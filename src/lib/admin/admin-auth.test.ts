import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword, verifyPassword } from "./password";
import { clearLoginFailures, loginBlocked, recordLoginFailure } from "./ratelimit";
import { createSessionToken, verifySessionToken } from "./session-token";

const SECRET = "s".repeat(48);
const EMAIL = "admin@example.com";

test("password: correct password verifies, wrong or missing hash never does", async () => {
  const stored = await hashPassword("Correct-Horse-Battery-9!");
  assert.match(stored, /^scrypt:16384:8:1:/);
  assert.equal(await verifyPassword("Correct-Horse-Battery-9!", stored), true);
  assert.equal(await verifyPassword("correct-horse-battery-9!", stored), false);
  assert.equal(await verifyPassword("", stored), false);
  // ایمیل اشتباه = هش undefined؛ حتی با رمز درست هم نباید رد شود
  assert.equal(await verifyPassword("Correct-Horse-Battery-9!", undefined), false);
  assert.equal(await verifyPassword("x", "garbage"), false);
});

test("password: every hash uses a fresh salt", async () => {
  assert.notEqual(await hashPassword("same"), await hashPassword("same"));
});

test("session: valid token round-trips and is bound to the admin email", () => {
  const t = createSessionToken(EMAIL, SECRET, 1_000_000);
  assert.equal(verifySessionToken(t, SECRET, EMAIL, 1_000_000 + 1000), EMAIL);
  assert.equal(verifySessionToken(t, SECRET, "other@example.com", 1_000_000 + 1000), null);
});

test("session: expired, tampered, wrong-secret and malformed tokens are rejected", () => {
  const t = createSessionToken(EMAIL, SECRET, 1_000_000);
  const eightHoursLater = 1_000_000 + 8 * 3600 * 1000 + 1000;
  assert.equal(verifySessionToken(t, SECRET, EMAIL, eightHoursLater), null);
  assert.equal(verifySessionToken(t, "x".repeat(48), EMAIL, 1_000_000 + 1000), null);
  const [body, mac] = t.split(".");
  const forged = Buffer.from(JSON.stringify({ e: EMAIL, exp: 9_999_999_999, n: "00" })).toString("base64url");
  assert.equal(verifySessionToken(`${forged}.${mac}`, SECRET, EMAIL, 1_000_000), null);
  assert.equal(verifySessionToken(`${body}.${mac}.extra`, SECRET, EMAIL, 1_000_000), null);
  assert.equal(verifySessionToken(`${body}.`, SECRET, EMAIL, 1_000_000), null);
  assert.equal(verifySessionToken(undefined, SECRET, EMAIL), null);
  assert.equal(verifySessionToken("not-a-token", SECRET, EMAIL), null);
});

test("rate limit: locks after 5 failures per IP, unlocks after the window, clears on success", () => {
  const ip = "203.0.113.7";
  const t0 = 10_000_000;
  for (let i = 0; i < 4; i++) recordLoginFailure(ip, t0 + i);
  assert.equal(loginBlocked(ip, t0 + 10), 0);
  recordLoginFailure(ip, t0 + 5);
  assert.ok(loginBlocked(ip, t0 + 10) > 0);
  assert.equal(loginBlocked("198.51.100.1", t0 + 10), 0); // IP دیگر آزاد است
  assert.equal(loginBlocked(ip, t0 + 16 * 60_000), 0); // بعد از پنجره‌ی ۱۵ دقیقه
  recordLoginFailure(ip, t0 + 20 * 60_000);
  clearLoginFailures(ip);
  assert.equal(loginBlocked(ip, t0 + 20 * 60_000 + 1), 0);
});
