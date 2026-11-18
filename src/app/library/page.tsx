import type { Metadata } from "next";
import Link from "next/link";
import { LibraryPanel } from "@/components/LibraryPanel";

export const metadata: Metadata = {
  title: "کتابخانه‌ی من",
  description: "دریافت دوباره‌ی نسخه‌ی الکترونیکی کتاب سلطان قیف با شماره موبایل خریدار.",
  robots: { index: false },
};

export default function LibraryPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-black text-primary sm:text-3xl">کتابخانه‌ی من</h1>
      <p className="mt-3 text-sm leading-7 text-ink-soft">
        نسخه‌ی الکترونیکی «سلطان قیف» را هر وقت خواستید دوباره دریافت کنید. با شماره‌ای که با آن خرید کرده‌اید وارد شوید.
        PDF برای خواندن صفحه‌به‌صفحه مثل کتاب چاپی است، و EPUB برای موبایل و اپ‌های کتاب‌خوان مثل Apple Books، Google Play Books یا Lithium.
      </p>
      <div className="mt-8">
        <LibraryPanel />
      </div>
      <p className="mt-6 text-xs leading-6 text-muted">
        هر نسخه به نام خریدارش صادر شده و کد مجوز دارد. لطفاً آن را با دیگران به اشتراک نگذارید.{" "}
        <Link href="/verify" className="font-semibold text-primary hover:underline">استعلام اصالت یک نسخه</Link>
      </p>
    </section>
  );
}
