import { NextResponse } from "next/server";
import { AdminApiError, bookFile } from "@/lib/admin/api";
import { currentAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** دانلود نسخه‌ی مهرخورده‌ی یک خریدار برای مدیر — فایل از بک‌اند خصوصی stream می‌شود (لینک عمومی ساخته نمی‌شود). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string; kind: string }> }) {
  if (!(await currentAdmin())) return new NextResponse("Unauthorized", { status: 401 });
  const { id, kind } = await ctx.params;
  if (!UUID.test(id) || (kind !== "pdf" && kind !== "epub")) return new NextResponse("Not found", { status: 404 });

  let upstream: Response;
  try {
    upstream = await bookFile(id, kind);
  } catch (err) {
    const status = err instanceof AdminApiError ? err.status : 502;
    return new NextResponse(err instanceof Error ? err.message : "error", { status });
  }
  if (!upstream.ok || !upstream.body) {
    return new NextResponse(upstream.status === 503 ? "نسخه هنوز آماده نیست؛ چند لحظه‌ی دیگر دوباره تلاش کنید" : "فایل یافت نشد", { status: upstream.status === 503 ? 503 : 404 });
  }
  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex");
  return new NextResponse(upstream.body, { status: 200, headers });
}
