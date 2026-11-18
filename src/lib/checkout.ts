import type { ProductFormat } from "./content";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://exirerp.ir/api").replace(/\/$/, "");
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "t63724ac4c3f";

const BOOK_API = `${API_BASE}/public/book/${TENANT_SLUG}`;

// Frontend product ids are lowercase for readability; the backend's BookOrderFormat enum is uppercase.
const FORMAT_CODE: Record<ProductFormat, "PRINT" | "EBOOK" | "AUDIO"> = {
  print: "PRINT",
  ebook: "EBOOK",
  audio: "AUDIO",
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BOOK_API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join("، ") : body?.message;
    throw new Error(message ?? `خطا در ارتباط با سرور (${res.status})`);
  }
  return res.json();
}

export function requestOtp(phone: string) {
  return apiFetch<{ ok: true }>("/otp/request", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone: string, code: string) {
  return apiFetch<{ bookingToken: string; expiresInSeconds: number }>("/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export interface OrderInput {
  bookingToken: string;
  format: ProductFormat;
  buyerName: string;
  address?: string;
  postalCode?: string;
}

export type PaymentMethod = "CARD" | "ZARINPAL";

export function createOrder(input: OrderInput) {
  return apiFetch<{ orderId: string; paymentMethod: PaymentMethod }>("/orders", {
    method: "POST",
    body: JSON.stringify({
      bookingToken: input.bookingToken,
      format: FORMAT_CODE[input.format],
      buyerName: input.buyerName,
      address: input.address,
      postalCode: input.postalCode,
    }),
  });
}

export async function payOrder(orderId: string): Promise<{ paymentUrl: string }> {
  const result = await apiFetch<{ paymentUrl?: string; error?: string }>(`/orders/${orderId}/pay`, {
    method: "POST",
  });
  if (!result.paymentUrl) throw new Error(result.error ?? "امکان اتصال به درگاه پرداخت نبود");
  return { paymentUrl: result.paymentUrl };
}

export function getOrderStatus(orderId: string) {
  return apiFetch<{ status: string; paidAt?: string }>(`/orders/${orderId}/status`);
}

/** ارقام فارسی/عربی → لاتین و حذف فاصله/خط تیره؛ بک‌اند فقط 09xxxxxxxxx را برای OTP می‌پذیرد. */
export function normalizePhone(input: string): string {
  const latin = input.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  let p = latin.replace(/\D/g, "");
  if (p.startsWith("98")) p = "0" + p.slice(2);
  return p;
}

export interface PaymentInfo {
  orderNo: number;
  format: "PRINT" | "EBOOK" | "AUDIO";
  status: "PENDING_PAYMENT" | "AWAITING_CONFIRMATION" | "PAID" | "CANCELLED" | "SHIPPED" | "DELIVERED";
  buyerName: string;
  amountToman: number;
  amountRial: number;
  expiresAt: string | null;
  claimedAt: string | null;
  /** فقط تا وقتی سفارش هنوز قابل‌پرداخت است */
  card: { number: string; holder: string; bank: string } | null;
}

export function getPaymentInfo(orderId: string) {
  return apiFetch<PaymentInfo>(`/orders/${orderId}/payment`);
}

/** «واریز کردم» — سفارش به صف تأیید مدیر می‌رود. */
export function claimTransfer(orderId: string, input: { payerCardLast4?: string; trackingCode?: string }) {
  return apiFetch<PaymentInfo>(`/orders/${orderId}/claim`, {
    method: "POST",
    body: JSON.stringify({
      ...(input.payerCardLast4 ? { payerCardLast4: input.payerCardLast4 } : {}),
      ...(input.trackingCode ? { trackingCode: input.trackingCode } : {}),
    }),
  });
}

export function cancelOrder(orderId: string) {
  return apiFetch<{ ok: true }>(`/orders/${orderId}/cancel`, { method: "POST" });
}

export interface LibraryItem {
  orderNo: number;
  format: "PRINT" | "EBOOK" | "AUDIO";
  status: PaymentInfo["status"];
  unitPrice: number;
  createdAt: string;
  paidAt: string | null;
  licenseCode: string | null;
  ready: boolean;
  pageUrl: string | null;
  pdfUrl: string | null;
  epubUrl: string | null;
  expiresAt: string | null;
}

/** نسخه‌های الکترونیک خریداری‌شده با این شماره (توکن از verifyOtp)، با لینک‌های دانلود تازه. */
export function fetchLibrary(bookingToken: string) {
  return apiFetch<LibraryItem[]>("/library", {
    method: "POST",
    body: JSON.stringify({ bookingToken }),
  });
}

export type LicenseCheck =
  | { valid: false }
  | { valid: true; orderNo: number; holderName: string; holderPhone: string; issuedAt: string };

export function verifyLicense(input: { orderNo: number; phone: string; code: string }) {
  return apiFetch<LicenseCheck>("/license/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
