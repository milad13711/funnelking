import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChapterBlocks } from "@/components/ChapterBlocks";
import { INTRO_BLOCKS, INTRO_TITLE, PREFACE_BLOCKS, PREFACE_TITLE } from "@/lib/chapter-one";
import { BRAND } from "@/lib/content";

export const metadata: Metadata = {
  title: "خواندن رایگان فصل اول",
  description: "پیش‌گفتار نویسنده و پیش‌درآمد و قرارداد خواندن کتاب سلطان قیف (Funnel King) را رایگان و کامل بخوانید.",
};

export default function ChapterOnePage() {
  return (
    <>
      <section className="hero-band">
        <div className="bg-dots absolute inset-0 opacity-10" />
        <div className="relative mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-deep">
            <Image src="/logo-mark.png" alt="" width={30} height={47} className="h-8 w-auto" />
          </div>
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-light">
            پیش‌نمایش رایگان
          </span>
          <h1 className="mt-4 text-2xl font-black leading-tight sm:text-4xl">
            پیش‌گفتار و پیش‌درآمد {BRAND.name}
          </h1>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            پیش از خرید، پیش‌گفتار نویسنده و پیش‌درآمد و قرارداد خواندن را کامل و رایگان بخوانید.
          </p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link href="/" className="text-sm font-bold text-primary hover:underline">
          ← بازگشت به صفحه‌ی اصلی
        </Link>

        <div className="mt-8">
          <h2 className="text-2xl font-black text-primary sm:text-3xl">{PREFACE_TITLE}</h2>
          <div className="mt-5">
            <ChapterBlocks blocks={PREFACE_BLOCKS} />
          </div>
        </div>

        <hr className="my-12 border-border" />

        <div>
          <h2 className="text-2xl font-black text-primary sm:text-3xl">{INTRO_TITLE}</h2>
          <div className="mt-5">
            <ChapterBlocks blocks={INTRO_BLOCKS} />
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-gold bg-primary-soft/50 p-6 text-center sm:p-8">
          <h3 className="text-lg font-black text-primary sm:text-xl">ادامه‌ی ماجرا در کتاب کامل است</h3>
          <p className="mt-2 text-sm text-ink-soft">
            از این‌جا وارد ۱۱ بخش کتاب می‌شوید: از DNA تفکر استراتژیک تا دستورکارها و ابزارهای اجرا.
          </p>
          <Link
            href="/#buy"
            className="mt-5 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-primary-deep transition hover:brightness-95"
          >
            خرید کتاب سلطان قیف
          </Link>
        </div>
      </article>
    </>
  );
}
