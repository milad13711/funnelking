import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BRAND } from "@/lib/content";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://funnelking.ir").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name} (Funnel King) — ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "کتاب سلطان قیف (Funnel King): راهنمای عملی طراحی قیف فروش، افزایش نرخ تبدیل، کاهش هزینه‌ی جذب مشتری و ساخت سیستم فروش پایدار برای کسب‌وکارها. نوشته‌ی محمدامین بهرامی.",
  keywords: [
    "کتاب سلطان قیف",
    "Funnel King",
    "قیف فروش",
    "افزایش نرخ تبدیل",
    "سیستم فروش",
    "مدیریت استراتژیک فروش",
    "کاهش هزینه جذب مشتری",
  ],
  openGraph: {
    title: `${BRAND.name} (Funnel King) — ${BRAND.tagline}`,
    description:
      "راهنمای عملی طراحی قیف فروش، افزایش نرخ تبدیل، کاهش هزینه‌ی جذب مشتری و ساخت سیستم فروش پایدار برای کسب‌وکارها.",
    locale: "fa_IR",
    type: "website",
    images: ["/og-cover.png"],
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#17302a",
  width: "device-width",
  initialScale: 1,
};

const bookJsonLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: `${BRAND.name} (Funnel King)`,
  author: { "@type": "Person", name: BRAND.author },
  isbn: BRAND.isbn,
  inLanguage: "fa",
  description:
    "راهنمای عملی طراحی قیف فروش، افزایش نرخ تبدیل، کاهش هزینه‌ی جذب مشتری و ساخت سیستم فروش پایدار برای کسب‌وکارها.",
  offers: {
    "@type": "AggregateOffer",
    lowPrice: 650000,
    highPrice: 1400000,
    priceCurrency: "IRT",
    availability: "https://schema.org/InStock",
    url: SITE_URL,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-ink">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }} />
        <a href="#main" className="skip-link">
          رفتن به محتوای اصلی
        </a>
        <SiteHeader />
        <div id="main" className="flex-1 flex flex-col">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
