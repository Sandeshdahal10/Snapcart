import { auth } from "@/auth";
import type { Session, User } from "next-auth";
import { NextResponse } from "next/server";

type Role = "user" | "deliveryBoy" | "admin";
type AuthedSession = Session & { user: User };

type RequireRoleResult =
  | { session: AuthedSession; error: null }
  | { session: null; error: NextResponse };

/**
 * Checks the logged-in user's role inside an API route.
 *
 * Usage:
 *   const { session, error } = await requireRole("admin");
 *   if (error) return error;
 *
 * Needed because proxy.ts skips every /api/auth/* path (so NextAuth works),
 * which means the /api/auth/admin/* routes are NOT protected by the middleware.
 */
export async function requireRole(...roles: Role[]): Promise<RequireRoleResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ message: "Not authenticated" }, { status: 401 }),
    };
  }
  if (roles.length && !roles.includes(session.user.role as Role)) {
    return {
      session: null,
      error: NextResponse.json({ message: "Unauthorized" }, { status: 403 }),
    };
  }
  return { session: session as AuthedSession, error: null };
}
