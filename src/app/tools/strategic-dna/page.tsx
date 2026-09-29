import type { Metadata } from "next";
import Link from "next/link";
import { StrategicDnaCanvas } from "@/components/StrategicDnaCanvas";

export const metadata: Metadata = {
  title: "بوم DNA تفکر استراتژیک",
  description: "بوم آنلاین تمرین بخش یکم کتاب سلطان قیف — گلوگاه‌های فروش سازمان خود را پیدا کنید و خروجی را PDF دانلود کنید.",
};

export default function StrategicDnaPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/#exercises" className="text-sm font-bold text-primary hover:underline">
        ← بازگشت به بوم‌های تمرین
      </Link>

      <div className="mt-4">
        <span className="badge-soon">بخش یکم</span>
        <h1 className="mt-3 text-2xl font-black text-primary sm:text-4xl">بوم DNA تفکر استراتژیک</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">
          این بوم برای تمرین انتهای بخش یکم کتاب سلطان قیف طراحی شده — آن را برای سازمان خودتان آنلاین پر کنید تا
          گلوگاه‌های اصلی فروش و مسیر تصمیم‌گیری استراتژیک‌تان مشخص شود، سپس خروجی را به‌صورت PDF دانلود کنید.
        </p>
      </div>

      <div className="mt-10">
        <StrategicDnaCanvas />
      </div>
    </section>
  );
}
