import { AdminApiError } from "./api";

export type Safe<T> = { ok: true; data: T } | { ok: false; error: string };

/** یک بخش صفحه با خطای سرور نباید کل صفحه را خراب کند؛ پیام خطا همان‌جا نشان داده می‌شود. */
export async function safe<T>(promise: Promise<T>): Promise<Safe<T>> {
  try {
    return { ok: true, data: await promise };
  } catch (err) {
    return { ok: false, error: err instanceof AdminApiError ? err.message : "خطای پیش‌بینی‌نشده" };
  }
}

/** پیام کوتاه نتیجه‌ی اکشن‌ها از طریق آدرس (بدون وضعیت سمت کلاینت). */
export function flashUrl(path: string, kind: "ok" | "err", message: string): string {
  const u = new URL(path, "http://x");
  u.searchParams.set(kind, message.slice(0, 200));
  return `${u.pathname}${u.search}`;
}
