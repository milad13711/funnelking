import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://exirerp.ir/api").replace(/\/$/, "");
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "t63724ac4c3f";

/**
 * لینک کوتاه پیامک: /d/<شماره‌سفارش>-<توکن>. بک‌اند توکن را می‌سنجد و لینک امضاشده‌ی تازه‌ی صفحه‌ی دریافت را
 * می‌دهد؛ اینجا فقط ریدایرکت می‌کنیم. لینک نامعتبر/لغوشده به «پنل من» می‌رود (ورود با کد پیامکی).
 */
export async function GET(req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const m = /^(\d{1,9})-([a-z2-7]{16})$/.exec(code);
  const fallback = new URL("/library", req.url);
  if (!m) return NextResponse.redirect(fallback, 302);
  try {
    const res = await fetch(`${API_BASE}/public/book/${TENANT_SLUG}/dl/${m[1]}/${m[2]}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.redirect(fallback, 302);
    const { pageUrl } = (await res.json()) as { pageUrl?: string };
    if (!pageUrl || !/^https?:\/\//.test(pageUrl)) return NextResponse.redirect(fallback, 302);
    const out = NextResponse.redirect(pageUrl, 302);
    out.headers.set("Cache-Control", "private, no-store");
    out.headers.set("Referrer-Policy", "no-referrer");
    out.headers.set("X-Robots-Tag", "noindex");
    return out;
  } catch {
    return NextResponse.redirect(fallback, 302);
  }
}
