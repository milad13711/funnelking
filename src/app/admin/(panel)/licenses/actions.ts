"use server";

import { revalidatePath } from "next/cache";
import { AdminApiError, bookApi, type OrderRow } from "@/lib/admin/api";
import { requireAdmin } from "@/lib/admin/session";

export interface IssueState {
  error?: string;
  order?: OrderRow;
}

/**
 * ساخت لایسنس دستی (هدیه، برنده‌ی ایونت، جایگزین): بک‌اند یک سفارش رایگان می‌سازد و همان ابزار قطعی
 * license_stamp.py نام و کد را داخل PDF/EPUB درج می‌کند — بدون هوش مصنوعی.
 */
export async function issueLicenseAction(_prev: IssueState, form: FormData): Promise<IssueState> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  const phone = String(form.get("phone") ?? "").replace(/[\s-]/g, "");
  const giftMessage = String(form.get("giftMessage") ?? "").trim();
  const adminNote = String(form.get("adminNote") ?? "").trim();
  if (name.length < 2) return { error: "نام دارنده را وارد کنید." };
  if (!/^(\+?98|0)?9\d{9}$/.test(phone)) return { error: "شماره موبایل نامعتبر است (مثلاً ۰۹۱۲۱۲۳۴۵۶۷)." };
  try {
    const order = await bookApi<OrderRow>("/licenses", {
      method: "POST",
      body: JSON.stringify({ name, phone, ...(giftMessage ? { giftMessage } : {}), ...(adminNote ? { adminNote } : {}) }),
    });
    revalidatePath("/admin", "layout");
    return { order };
  } catch (err) {
    return { error: err instanceof AdminApiError ? err.message : "ساخت لایسنس انجام نشد" };
  }
}
