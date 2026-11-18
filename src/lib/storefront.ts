import { PRODUCTS, type ProductFormat } from "./content";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://exirerp.ir/api").replace(/\/$/, "");
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "t63724ac4c3f";

export interface Storefront {
  prices: Record<ProductFormat, number>;
  paymentMethod: "CARD" | "ZARINPAL";
}

const FORMAT_KEY: Record<string, ProductFormat> = { PRINT: "print", EBOOK: "ebook", AUDIO: "audio" };

const FALLBACK: Storefront = {
  prices: { print: PRODUCTS.print.price, ebook: PRODUCTS.ebook.price, audio: PRODUCTS.audio.price },
  paymentMethod: "CARD",
};

/**
 * قیمت‌ها و روش پرداخت را از پنل مدیریت (تنظیمات فروش کتاب) می‌خواند، تا ۶۰ ثانیه کش می‌شود.
 * اگر سرور در دسترس نبود، قیمت‌های پیش‌فرض content.ts نمایش داده می‌شود (سفارش‌ها همچنان با قیمت سرور ثبت می‌شوند).
 */
export async function getStorefront(): Promise<Storefront> {
  try {
    const res = await fetch(`${API_BASE}/public/book/${TENANT_SLUG}/storefront`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as { formats?: { format: string; unitPrice: number }[]; paymentMethod?: string };
    const prices = { ...FALLBACK.prices };
    for (const f of data.formats ?? []) {
      const key = FORMAT_KEY[f.format];
      if (key && Number.isFinite(f.unitPrice) && f.unitPrice > 0) prices[key] = f.unitPrice;
    }
    return { prices, paymentMethod: data.paymentMethod === "ZARINPAL" ? "ZARINPAL" : "CARD" };
  } catch {
    return FALLBACK;
  }
}
