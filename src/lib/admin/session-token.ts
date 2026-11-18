import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "fk_admin";
export const SESSION_TTL_SECONDS = 8 * 3600;

interface Payload {
  e: string; // ایمیل
  exp: number; // epoch seconds
  n: string; // nonce
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString("base64url");

function sign(secret: string, body: string): string {
  return createHmac("sha256", secret).update(`fk-admin-session.${body}`).digest("base64url");
}

export function createSessionToken(email: string, secret: string, now = Date.now()): string {
  const payload: Payload = { e: email, exp: Math.floor(now / 1000) + SESSION_TTL_SECONDS, n: randomBytes(8).toString("hex") };
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(secret, body)}`;
}

/** ایمیل صاحب نشست معتبر، یا null (امضای نادرست، دست‌کاری‌شده یا منقضی). */
export function verifySessionToken(token: string | undefined, secret: string, expectedEmail: string, now = Date.now()): string | null {
  if (!token) return null;
  const [body, mac, extra] = token.split(".");
  if (!body || !mac || extra !== undefined) return null;
  const good = Buffer.from(sign(secret, body));
  const got = Buffer.from(mac);
  if (good.length !== got.length || !timingSafeEqual(good, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (typeof p.e !== "string" || typeof p.exp !== "number" || p.exp * 1000 <= now) return null;
    return p.e === expectedEmail ? p.e : null;
  } catch {
    return null;
  }
}
