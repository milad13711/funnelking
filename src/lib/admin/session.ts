import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfig } from "./config";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken, verifySessionToken } from "./session-token";

export { SESSION_COOKIE };

export async function setSessionCookie(email: string, secret: string) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(email, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** بررسی واقعی نشست، نزدیک به داده (نه فقط در proxy) — هر صفحه/اکشن/route حساس باید این را صدا بزند. */
export async function currentAdmin(): Promise<string | null> {
  const cfg = adminConfig();
  if (!cfg) return null;
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value, cfg.sessionSecret, cfg.email);
}

export async function requireAdmin(): Promise<string> {
  const email = await currentAdmin();
  if (!email) redirect("/admin/login");
  return email;
}
