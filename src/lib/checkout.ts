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

export function createOrder(input: OrderInput) {
  return apiFetch<{ orderId: string }>("/orders", {
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
