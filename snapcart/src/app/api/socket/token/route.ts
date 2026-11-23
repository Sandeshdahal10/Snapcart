import { auth } from "@/auth";
import { signSocketToken } from "@/lib/socketToken";
import { NextResponse } from "next/server";

/** Gives the logged-in user a signed token to identify themselves to the socket server. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json(
    { userId: session.user.id, token: signSocketToken(session.user.id) },
    { status: 200 },
  );
}
