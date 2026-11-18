"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminApiError, bookApi } from "@/lib/admin/api";
import { flashUrl } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

const BACK = "/admin/settings";

/** رقم فارسی/عربی → لاتین و حذف جداکننده‌ی هزارگان از ورودی قیمت. */
function toInt(raw: FormDataEntryValue | null): number | undefined {
  const t = String(raw ?? "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[,٬\s]/g, "");
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

export async function saveSettingsAction(form: FormData) {
  await requireAdmin();
  let kind: "ok" | "err" = "ok";
  let message = "تنظیمات ذخیره شد.";
  try {
    const body: Record<string, unknown> = {};
    for (const key of ["printPriceToman", "ebookPriceToman", "audioPriceToman", "payWindowMinutes"] as const) {
      const n = toInt(form.get(key));
      if (n !== undefined) {
        if (!Number.isInteger(n) || n <= 0) throw new AdminApiError("قیمت‌ها و مهلت باید عدد صحیح مثبت باشند", 400);
        body[key] = n;
      }
    }
    const method = String(form.get("paymentMethod") ?? "");
    if (method === "CARD" || method === "ZARINPAL") body.paymentMethod = method;
    for (const key of ["cardNumber", "cardHolder", "cardBank", "notifyPhone"] as const) {
      body[key] = String(form.get(key) ?? "").trim();
    }
    await bookApi("/settings", { method: "PUT", body: JSON.stringify(body) });
  } catch (err) {
    kind = "err";
    message = err instanceof AdminApiError ? err.message : "ذخیره انجام نشد";
  }
  revalidatePath("/admin", "layout");
  redirect(flashUrl(BACK, kind, message));
}

export async function testSmsAction() {
  await requireAdmin();
  let kind: "ok" | "err" = "ok";
  let message = "پیامک آزمایشی ارسال شد؛ گوشی خود را بررسی کنید.";
  try {
    const res = await bookApi<{ sent: boolean; error?: string }>("/settings/test-sms", { method: "POST" });
    if (!res.sent) throw new AdminApiError(`ارسال نشد: ${res.error ?? "نامشخص"}`, 502);
  } catch (err) {
    kind = "err";
    message = err instanceof AdminApiError ? err.message : "ارسال انجام نشد";
  }
  redirect(flashUrl(BACK, kind, message));
}
