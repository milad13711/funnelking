const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "https://exirerp.ir/api").replace(/\/$/, "");
const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "t63724ac4c3f";

// آدرس رزرو در وب‌پنل Exir ERP — تا وقتی تنظیم نشده، دکمه‌های رزرو غیرفعال (href="#") نمایش داده می‌شوند.
const EVENTS_BOOKING_BASE_URL = (process.env.NEXT_PUBLIC_EVENTS_BOOKING_BASE_URL ?? "").replace(/\/$/, "");

export interface PublicEvent {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  venue?: string | null;
  isOnline: boolean;
  startAt: string;
  endAt: string;
  remainingCapacity: number | null;
}

export async function listUpcomingEvents(): Promise<PublicEvent[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE}/public/events/${TENANT_SLUG}`, { cache: "no-store", signal: controller.signal });
    if (!res.ok) throw new Error(`خطا در دریافت رویدادها (${res.status})`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export function eventBookingUrl(eventSlug: string): string {
  if (!EVENTS_BOOKING_BASE_URL) return "#";
  return `${EVENTS_BOOKING_BASE_URL}/events/${TENANT_SLUG}/${eventSlug}`;
}

export function isEventsBookingConfigured(): boolean {
  return EVENTS_BOOKING_BASE_URL.length > 0;
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}
