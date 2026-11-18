"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminApiError, bookApi } from "@/lib/admin/api";
import { flashUrl } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** فقط مسیرهای داخلی داشبورد؛ جلوگیری از open redirect از طریق فیلد مخفی. */
function backPath(form: FormData): string {
  const raw = String(form.get("back") ?? "");
  return /^\/admin(\/[A-Za-z0-9\-_%./]*)?(\?[A-Za-z0-9\-_%=&.+]*)?$/.test(raw) && !raw.includes("..") ? raw : "/admin/buyers";
}

function orderId(form: FormData): string {
  const id = String(form.get("id") ?? "");
  if (!UUID.test(id)) throw new AdminApiError("شناسه‌ی سفارش نامعتبر است", 400);
  return id;
}

async function run(form: FormData, okMessage: string, job: (id: string) => Promise<unknown>) {
  await requireAdmin(); // اکشن‌ها endpoint عمومی‌اند؛ نشست باید همین‌جا هم بررسی شود
  const back = backPath(form);
  let message = okMessage;
  let kind: "ok" | "err" = "ok";
  try {
    await job(orderId(form));
  } catch (err) {
    kind = "err";
    message = err instanceof AdminApiError ? err.message : "عملیات انجام نشد";
  }
  revalidatePath("/admin", "layout");
  redirect(flashUrl(back, kind, message));
}

export async function reissueAction(form: FormData) {
  await run(form, "نسخه از نو مهر شد.", (id) => bookApi(`/orders/${id}/reissue`, { method: "POST" }));
}

export async function revokeAction(form: FormData) {
  await run(form, "دسترسی این نسخه لغو شد.", (id) => bookApi(`/orders/${id}/revoke`, { method: "POST" }));
}

export async function restoreAction(form: FormData) {
  await run(form, "دسترسی این نسخه بازگردانده شد.", (id) => bookApi(`/orders/${id}/restore`, { method: "POST" }));
}

export async function noteAction(form: FormData) {
  const adminNote = String(form.get("note") ?? "").slice(0, 500);
  await run(form, "یادداشت ذخیره شد.", (id) => bookApi(`/orders/${id}/note`, { method: "PATCH", body: JSON.stringify({ adminNote }) }));
}

export async function revokeUserAction(form: FormData) {
  await userBulk(form, "revoke", "دسترسی همه‌ی نسخه‌های این کاربر لغو شد.");
}

export async function restoreUserAction(form: FormData) {
  await userBulk(form, "restore", "دسترسی نسخه‌های این کاربر بازگردانده شد.");
}

async function userBulk(form: FormData, op: "revoke" | "restore", okMessage: string) {
  await requireAdmin();
  const phone = String(form.get("phone") ?? "");
  const back = backPath(form);
  let message = okMessage;
  let kind: "ok" | "err" = "ok";
  try {
    if (!/^(\+?98|0)?9\d{9}$/.test(phone)) throw new AdminApiError("شماره نامعتبر است", 400);
    await bookApi(`/users/${encodeURIComponent(phone)}/${op}`, { method: "POST" });
  } catch (err) {
    kind = "err";
    message = err instanceof AdminApiError ? err.message : "عملیات انجام نشد";
  }
  revalidatePath("/admin", "layout");
  redirect(flashUrl(back, kind, message));
}

export async function resendSmsAction(form: FormData) {
  await run(form, "پیامک لینک دانلود دوباره ارسال شد.", async (id) => {
    const res = await bookApi<{ sent: boolean; error?: string }>(`/orders/${id}/resend-sms`, { method: "POST" });
    if (!res.sent) throw new AdminApiError(res.error ?? "ارسال پیامک ناموفق بود", 502);
  });
}
