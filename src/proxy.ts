import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminConfig } from "@/lib/admin/config";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/admin/session-token";

/**
 * بررسی «خوش‌بینانه»ی نشست برای مسیرهای /admin (ریدایرکت به ورود) + هدرهای امنیتی.
 * بررسی اصلی هم‌چنان داخل هر صفحه/اکشن/route با requireAdmin() انجام می‌شود (راهنمای Next: authentication).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const cfg = adminConfig();
  const ok = !!cfg && !!verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value, cfg.sessionSecret, cfg.email);

  let response: NextResponse;
  if (!ok && !isLogin) {
    response = NextResponse.redirect(new URL("/admin/login", request.url));
  } else if (ok && isLogin) {
    response = NextResponse.redirect(new URL("/admin", request.url));
  } else {
    response = NextResponse.next();
  }
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Frame-Options", "DENY");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
