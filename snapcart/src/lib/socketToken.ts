import crypto from "crypto";

/**
 * Signed "who am I" token for the socket server.
 * Format: <userId>.<expiresAtMs>.<hmac>, signed with SOCKET_SECRET.
 * The socket server checks it with the same secret, so a browser can't
 * claim to be another user (and receive their delivery code or move their map marker).
 */
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function signSocketToken(userId: string) {
  const secret = process.env.SOCKET_SECRET || "";
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}
