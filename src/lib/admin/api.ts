import { backendConfig, gameConfig } from "./config";

/** فراخوانی سرور-به-سرور: کلیدها فقط روی سرور Next.js هستند و هرگز به مرورگر نمی‌رسند. */

export class AdminApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function call<T>(base: string, header: string, key: string, path: string, init?: RequestInit): Promise<T> {
  if (!key) throw new AdminApiError("کلید دسترسی به سرور تنظیم نشده است", 503);
  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(90_000),
      headers: { "Content-Type": "application/json", ...init?.headers, [header]: key },
    });
  } catch {
    throw new AdminApiError("ارتباط با سرور برقرار نشد", 502);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = Array.isArray(body?.message) ? body.message.join("، ") : body?.message ?? body?.error;
    throw new AdminApiError(message ?? `خطا در ارتباط با سرور (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

export function bookApi<T>(path: string, init?: RequestInit): Promise<T> {
  const { base, key } = backendConfig();
  return call<T>(base, "x-fk-admin-key", key, path, init);
}

export function gameApi<T>(path: string, init?: RequestInit): Promise<T> {
  const { base, key } = gameConfig();
  return call<T>(base, "x-admin-key", key, path, init);
}

/** فایل مهرخورده را از بک‌اند به‌صورت stream می‌گیرد (برای پراکسی دانلود). */
export async function bookFile(orderId: string, kind: "pdf" | "epub"): Promise<Response> {
  const { base, key } = backendConfig();
  if (!key) throw new AdminApiError("کلید دسترسی به سرور تنظیم نشده است", 503);
  return fetch(`${base}/orders/${orderId}/file/${kind}`, { cache: "no-store", headers: { "x-fk-admin-key": key }, signal: AbortSignal.timeout(120_000) });
}

// ───────── انواع پاسخ ─────────

export type BookFormat = "PRINT" | "EBOOK" | "AUDIO";

export interface OrderRow {
  id: string;
  orderNo: number;
  format: BookFormat;
  status: string;
  buyerName: string;
  buyerPhone: string;
  buyerPhoneMasked: string;
  unitPrice: number;
  paidAt: string | null;
  createdAt: string;
  isManual: boolean;
  giftMessage: string | null;
  adminNote: string | null;
  licenseCode: string | null;
  revokedAt: string | null;
  paymentMethod: string | null;
  claimedAt: string | null;
  payerCardLast4: string | null;
  trackingCode: string | null;
  confirmedAt: string | null;
  rejectedReason: string | null;
  downloadSmsAt: string | null;
  ebook: { issued: boolean; issuing: boolean; issuedAt: string | null; error: string | null } | null;
}

export interface Overview {
  paidOrders: Record<BookFormat, number>;
  revenueToman: number;
  uniqueBuyers: number;
  ebookNeedsAttention: number;
  revokedCopies: number;
  pendingPayments: number;
  last30Days: { day: string; sold: number; manual: number }[];
}

export interface SiteUser {
  phone: string;
  phoneMasked: string;
  name: string;
  orders: number;
  paidOrders: number;
  formats: BookFormat[];
  totalToman: number;
  ebookCopies: number;
  revokedCopies: number;
  hasManual: boolean;
  firstOrderAt: string;
  lastOrderAt: string;
}

export interface GameSummary {
  id: string;
  createdAt: string;
  totalRounds: number;
  mode: "classic" | "funnel";
  hasDecisions: boolean;
  teams: { companyName: string; finalRank: number; finalScore: number | null; finalNetWorth: number | null }[];
}

export interface GameArchive {
  id: string;
  createdAt: string;
  totalRounds: number;
  mode: "classic" | "funnel";
  reports: Record<string, unknown>[];
  decisions: { teamId: string; companyName: string; rounds: Record<string, unknown>[] }[] | null;
}

export interface DiscountCodeRow {
  code: string;
  gameId: string;
  teamId: string;
  createdAt: string;
  redeemedAt: string | null;
}

export interface BookSettings {
  printPriceToman: number;
  ebookPriceToman: number;
  audioPriceToman: number;
  paymentMethod: "CARD" | "ZARINPAL";
  cardNumber: string;
  cardHolder: string;
  cardBank: string;
  notifyPhone: string;
  payWindowMinutes: number;
  /** FK_SMS_API_KEY / FK_SMS_SENDER روی سرور تنظیم شده‌اند */
  smsDedicatedConfigured: boolean;
}
