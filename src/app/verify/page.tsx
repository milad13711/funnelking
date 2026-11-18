import type { Metadata } from "next";
import { VerifyLicenseForm } from "@/components/VerifyLicenseForm";

export const metadata: Metadata = {
  title: "استعلام اصالت نسخه‌ی الکترونیکی",
  description: "بررسی کنید یک نسخه‌ی الکترونیکی کتاب سلطان قیف اصل است و به نام چه کسی صادر شده.",
};

export default function VerifyPage() {
  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-black text-primary sm:text-3xl">استعلام اصالت نسخه</h1>
      <p className="mt-3 text-sm leading-7 text-ink-soft">
        هر نسخه‌ی الکترونیکی «سلطان قیف» برای یک خریدار صادر می‌شود. شماره سفارش و کد مجوز روی صفحه‌ی مجوز ابتدای کتاب و در
        پانویس صفحه‌ها چاپ شده است. با وارد کردن آن‌ها و شماره موبایل خریدار می‌توانید اصالت نسخه را بررسی کنید.
      </p>
      <div className="mt-8">
        <VerifyLicenseForm />
      </div>
    </section>
  );
}
