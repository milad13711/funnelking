import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";

/** قالب ذخیره: scrypt:N:r:p:saltBase64:hashBase64 — فقط هش در env نگه داشته می‌شود، نه رمز. */
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

function scrypt(password: string, salt: Buffer, n: number, r: number, p: number, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password.normalize("NFKC"), salt, keylen, { N: n, r, p, maxmem: 128 * n * r * 2 }, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, N, R, P, KEYLEN);
  return `scrypt:${N}:${R}:${P}:${salt.toString("base64")}:${hash.toString("base64")}`;
}

// برای وقتی ایمیل اشتباه است: همان هزینه‌ی محاسباتی را می‌پردازیم تا زمان پاسخ ایمیل درست/غلط را لو ندهد.
const DUMMY = "scrypt:16384:8:1:AAAAAAAAAAAAAAAAAAAAAA==:" + Buffer.alloc(KEYLEN).toString("base64");

export async function verifyPassword(password: string, stored: string | undefined): Promise<boolean> {
  const parts = (stored || DUMMY).split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scrypt(password, Buffer.from(saltB64, "base64"), Number(n), Number(r), Number(p), expected.length);
  return stored !== undefined && expected.length === actual.length && timingSafeEqual(expected, actual);
}
