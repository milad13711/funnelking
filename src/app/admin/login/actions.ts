"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminConfig } from "@/lib/admin/config";
import { verifyPassword } from "@/lib/admin/password";
import { clearLoginFailures, loginBlocked, recordLoginFailure } from "@/lib/admin/ratelimit";
import { clearSessionCookie, setSessionCookie } from "@/lib/admin/session";

export interface LoginState {
  error?: string;
}

const GENERIC_ERROR = "ایمیل یا رمز عبور درست نیست.";

async function clientIp(): Promise<string> {
  const h = await headers();
  // پشت nginx: اولین مقدار X-Forwarded-For آدرس واقعی کلاینت است
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function loginAction(_prev: LoginState, form: FormData): Promise<LoginState> {
  const cfg = adminConfig();
  if (!cfg) return { error: "داشبورد هنوز روی این سرور فعال نشده است." };

  const ip = await clientIp();
  const wait = loginBlocked(ip);
  if (wait > 0) return { error: `تلاش‌های ناموفق زیاد بود. ${new Intl.NumberFormat("fa-IR").format(wait)} دقیقه‌ی دیگر دوباره امتحان کنید.` };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  // همیشه یک بار scrypt اجرا می‌شود (حتی با ایمیل اشتباه) تا زمان پاسخ چیزی را لو ندهد
  const passwordOk = await verifyPassword(password.slice(0, 200), email === cfg.email ? cfg.passwordHash : undefined);
  if (!passwordOk) {
    recordLoginFailure(ip);
    await new Promise((r) => setTimeout(r, 600));
    return { error: GENERIC_ERROR };
  }
  clearLoginFailures(ip);
  await setSessionCookie(cfg.email, cfg.sessionSecret);
  redirect("/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
