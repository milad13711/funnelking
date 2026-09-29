import Link from "next/link";
import { BuyBox } from "@/components/BuyBox";
import { ExercisesSection } from "@/components/ExercisesSection";
import { EventsSection } from "@/components/EventsSection";
import { GameSection } from "@/components/GameSection";
import {
  AUDIENCE,
  BRAND,
  FAQ,
  FIRST_CHAPTER_TEASER,
  LEARN_LIST,
  PAIN_POINTS,
  TOC,
} from "@/lib/content";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero-band">
        <div className="bg-dots absolute inset-0 opacity-20" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="reveal">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-light">
              انتشار {BRAND.year} · مدیریت استراتژیک فروش
            </span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              {BRAND.name} <span className="text-gold-light">Funnel King</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">{BRAND.tagline}</p>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              راهنمای عملی طراحی قیف فروش، افزایش نرخ تبدیل، کاهش هزینه‌ی جذب مشتری و ساخت سیستم فروش پایدار برای
              کسب‌وکارها.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#buy"
                className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-primary-deep transition hover:brightness-95"
              >
                خرید از funnelking.ir
              </a>
              <a
                href="/chapter-one"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                خواندن رایگان فصل اول
              </a>
            </div>
            <p className="mt-6 text-xs text-white/60">
              تألیف: {BRAND.author} · {BRAND.parts} بخش · ISBN {BRAND.isbn}
            </p>
          </div>

          <div className="reveal lg:justify-self-end lg:self-start">
            <BuyBox />
          </div>
        </div>
      </section>

      {/* چرا این کتاب */}
      <section id="why" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-black text-primary sm:text-3xl">چرا این کتاب؟</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          سلطان قیف فقط یک کتاب فروش نیست؛ نقشه‌ای برای ساختن یک ماشین رشد پایدار است. در بازاری که هر روز با
          بحران، رقابت و بی‌ثباتی روبه‌روست، بقا کافی نیست؛ باید سیستم ساخت.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className="card-lift rounded-2xl border border-border bg-white p-5 elev-1">
              <div className="font-bold text-primary">{p.title}</div>
              <p className="mt-2 text-sm text-muted">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* در سلطان قیف یاد می‌گیرید */}
      <section className="bg-primary-soft/40 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-black text-primary sm:text-3xl">در سلطان قیف یاد می‌گیرید چگونه…</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LEARN_LIST.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-xl bg-white p-3 text-sm text-ink-soft elev-1">
                <span className="mt-0.5 text-gold-dark">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* فهرست کتاب */}
      <section id="toc" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-black text-primary sm:text-3xl">داخل کتاب</h2>
        <p className="mt-2 text-ink-soft">فهرست کتاب: {BRAND.parts} بخش، از DNA استراتژی تا ابزارهای اجرا</p>
        <ol className="mt-6 divide-y divide-border rounded-2xl border border-border bg-white elev-1">
          {TOC.map((item, i) => (
            <li key={item.title} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <span className="text-ink-soft">
                <span className="tabular ml-2 font-bold text-gold-dark">{String(i).padStart(2, "0")}</span>
                {item.title}
              </span>
              <span className="tabular whitespace-nowrap text-xs text-muted">صفحه‌ی {item.page}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* بوم‌های تمرین پایان فصل */}
      <ExercisesSection />

      {/* پیش‌نمایش فصل اول */}
      <section id="first-chapter" className="bg-primary-soft/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-black text-primary sm:text-3xl">فصل اول را رایگان بخوانید</h2>
          <p className="mt-6 text-right text-sm leading-8 text-ink-soft sm:text-base">{FIRST_CHAPTER_TEASER}</p>
          <Link
            href="/chapter-one"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            خواندن کامل پیش‌گفتار و پیش‌درآمد
          </Link>
        </div>
      </section>

      {/* رویدادهای فانل کینگ */}
      <EventsSection />

      {/* بازی آنلاین فانل کینگ */}
      <GameSection />

      {/* برای چه کسب‌وکارهایی */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-black text-primary sm:text-3xl">این کتاب مناسب چه کسب‌وکارهایی است؟</h2>
        <p className="mt-2 text-ink-soft">اگر کسب‌وکار شما مشتری دارد، به قیف فروش نیاز دارید.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {AUDIENCE.map((a) => (
            <span
              key={a}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-ink-soft"
            >
              {a}
            </span>
          ))}
        </div>
      </section>

      {/* نویسنده */}
      <section id="author" className="bg-primary-soft/40 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-black text-white">
            م
          </div>
          <h2 className="text-xl font-black text-primary">{BRAND.author}</h2>
          <p className="mt-1 text-sm text-muted">{BRAND.authorRole}</p>
          <p className="mt-3 text-xs text-muted">با همکاری: {BRAND.collaborators}</p>
          <a
            href="https://thisismbahrami.ir"
            className="mt-4 inline-block text-sm font-bold text-primary underline underline-offset-4"
          >
            درباره‌ی نویسنده →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-black text-primary sm:text-3xl">پرسش‌های رایج</h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-white elev-1">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-bold text-ink marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-gold-dark transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-7 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA پایانی */}
      <section className="hero-band">
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-black sm:text-3xl">چرا الان باید این کتاب را تهیه کنید؟</h2>
          <p className="mt-4 text-sm text-white/80 sm:text-base">
            بازار هر روز رقابتی‌تر می‌شود، هزینه‌ی تبلیغات بالا می‌رود و اعتمادسازی سخت‌تر می‌شود. سلطان قیف کمک
            می‌کند قبل از پرداخت هزینه‌های اشتباه بیشتر، مسیر فروش خود را دقیق‌تر طراحی کنید.
          </p>
          <a
            href="#buy"
            className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-primary-deep transition hover:brightness-95"
          >
            خرید کتاب سلطان قیف
          </a>
        </div>
      </section>
    </>
  );
}
