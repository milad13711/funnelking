#!/usr/bin/env node
// ساخت هش رمز داشبورد برای ADMIN_PASSWORD_HASH (قالب: scrypt:N:r:p:salt:hash — با src/lib/admin/password.ts یکی است).
//   node scripts/admin-hash.mjs "<password>"    -> فقط هش را چاپ می‌کند
//   node scripts/admin-hash.mjs --generate       -> رمز قوی تصادفی می‌سازد و هر دو را چاپ می‌کند
import { randomBytes, randomInt, scryptSync } from "node:crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const arg = process.argv[2];
if (!arg) {
  console.error('استفاده: node scripts/admin-hash.mjs "<password>"   یا   node scripts/admin-hash.mjs --generate');
  process.exit(1);
}

let password = arg;
if (arg === "--generate") {
  // بدون نویسه‌های گیج‌کننده (0/O، 1/l/I)؛ ۲۴ نویسه ≈ ۱۳۰ بیت آنتروپی
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%*-_=+";
  password = Array.from({ length: 24 }, () => alphabet[randomInt(alphabet.length)]).join("");
}
if (password.length < 12) {
  console.error("رمز باید دست‌کم ۱۲ نویسه باشد.");
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password.normalize("NFKC"), salt, KEYLEN, { N, r: R, p: P, maxmem: 128 * N * R * 2 });
const line = `scrypt:${N}:${R}:${P}:${salt.toString("base64")}:${hash.toString("base64")}`;
if (arg === "--generate") console.log(`PASSWORD=${password}`);
console.log(`ADMIN_PASSWORD_HASH=${line}`);
