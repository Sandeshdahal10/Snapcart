/**
 * auth.ts
 * NextAuth configuration using a Credentials provider.
 * - Connects to MongoDB to validate user credentials.
 * - Uses JWT session strategy and exposes user id, name, email and role in token/session.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import connectDb from "./lib/db";
import User from "./models/user.model";
import bcrypt from "bcryptjs";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      /**
       * Credentials provider fields and authorize flow.
       * authorize():
       * - connects to the DB
       * - verifies email and password
       * - returns a minimal user object { id, email, name, role } on success
       */
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, request) {
        await connectDb();
        const email = credentials.email;
        const password = credentials.password as string;

        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User does not exist");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Your password is incorrect");
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    /**
     * jwt callback
     * - Runs when a token is created/updated.
     * - Copies authenticated user properties into the token.
     */
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDb();
        let dbUser = await User.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
        user.id = dbUser._id.toString();
        user.role = dbUser.role;
      }
      return true;
    },
    jwt({ token, user,trigger,session }) {
      if (user) {
        (token.id = user.id),
          (token.name = user.name),
          (token.email = user.email),
          (token.role = user.role);
      }
      if(trigger=="update"){
        token.role=session.role
      }
      return token;
    },
    /**
     * session callback
     * - Runs when a session is checked/created.
     * - Attaches id, name, email, role from token to session.user.
     */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, //10 days
  },
  secret: process.env.AUTH_SECRET,
});

//connect db
//email check
//password check
//return user object

//Flow of code
//1. User submits login form
//2. NextAuth calls authorize method
//3. authorize method connects to db and checks email and password
//4. If valid, return user object
//5. NextAuth calls jwt callback to create token
//6. NextAuth calls session callback to create session
//7. Session is returned to client
