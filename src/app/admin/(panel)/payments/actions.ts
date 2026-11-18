"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminApiError, bookApi } from "@/lib/admin/api";
import { flashUrl } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BACK = "/admin/payments";

async function run(form: FormData, okMessage: string, job: (id: string) => Promise<unknown>) {
  await requireAdmin(); // اکشن‌ها endpoint عمومی‌اند؛ نشست باید همین‌جا هم بررسی شود
  let kind: "ok" | "err" = "ok";
  let message = okMessage;
  try {
    const id = String(form.get("id") ?? "");
    if (!UUID.test(id)) throw new AdminApiError("شناسه‌ی سفارش نامعتبر است", 400);
    await job(id);
  } catch (err) {
    kind = "err";
    message = err instanceof AdminApiError ? err.message : "عملیات انجام نشد";
  }
  revalidatePath("/admin", "layout");
  redirect(flashUrl(BACK, kind, message));
}

/** تأیید واریز: نام و موبایل (قابل اصلاح) ثبت، نسخه‌ی اختصاصی مهر و پیامک لینک دانلود برای خریدار ارسال می‌شود. */
export async function confirmPaymentAction(form: FormData) {
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").replace(/[\s-]/g, "");
  await run(form, "واریز تأیید شد؛ نسخه‌ی اختصاصی ساخته شد و پیامک لینک دانلود ارسال شد.", (id) =>
    bookApi(`/orders/${id}/confirm`, { method: "POST", body: JSON.stringify({ ...(name ? { name } : {}), ...(phone ? { phone } : {}) }) }),
  );
}

export async function rejectPaymentAction(form: FormData) {
  const reason = String(form.get("reason") ?? "").trim();
  await run(form, "واریز رد شد و به خریدار پیامک داده شد.", (id) =>
    bookApi(`/orders/${id}/reject`, { method: "POST", body: JSON.stringify(reason ? { reason } : {}) }),
  );
}
