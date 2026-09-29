import type { ProductFormat } from "./content";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://exirerp.ir/api").replace(/\/$/, "");
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "t63724ac4c3f";

const BOOK_API = `${API_BASE}/public/book/${TENANT_SLUG}`;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BOOK_API}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `خطا در ارتباط با سرور (${res.status})`);
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
  return apiFetch<{ token: string }>("/otp/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export interface OrderInput {
  token: string;
  format: ProductFormat;
  name: string;
  phone: string;
  address?: string;
  postalCode?: string;
}

export function createOrder(input: OrderInput) {
  return apiFetch<{ orderId: string }>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function payOrder(orderId: string) {
  return apiFetch<{ paymentUrl: string }>(`/orders/${orderId}/pay`, {
    method: "POST",
  });
}

export function getOrderStatus(orderId: string) {
  return apiFetch<{ status: string; paidAt?: string }>(`/orders/${orderId}/status`);
}
