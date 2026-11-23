import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { name, email, password } = await req.json();
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !email.trim() ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 }
      );
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return NextResponse.json(
        {
          message: "Email already exist or registered",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must be at least 6 characters long!",
        },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    // Never send the password hash back to the browser
    const { password: _password, ...safeUser } = user.toObject();
    return NextResponse.json(
      {
        user: safeUser,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: `register error ${error}`,
      },
      { status: 500 }
    );
  }
}
//connect db
//name, email, password frontend
//email check
//password 6 character
//password hash
//user create
