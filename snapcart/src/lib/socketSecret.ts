import { NextRequest } from "next/server";

/**
 * The socket server and the Next.js app share SOCKET_SECRET (set the same value in both .env files).
 * When it is set, the socket-only API routes reject requests that don't carry it,
 * so nobody can fake a user's location or take over their socket id.
 */
export function isFromSocketServer(req: NextRequest) {
  const secret = process.env.SOCKET_SECRET;
  if (!secret) return true; // not configured (local practice) — allow
  return req.headers.get("x-socket-secret") === secret;
}
