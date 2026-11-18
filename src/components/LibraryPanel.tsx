"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchLibrary, normalizePhone, requestOtp, verifyOtp, type LibraryItem } from "@/lib/checkout";

type Step = "phone" | "otp" | "list";

const FORMAT_FA = { PRINT: "نسخه‌ی چاپی", EBOOK: "نسخه‌ی الکترونیکی", AUDIO: "نسخه‌ی صوتی" } as const;

function faDate(iso: string) {
  return new Date(iso).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
}

export function LibraryPanel() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run(fn: () => Promise<void>) {
    setError(null);
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  function handlePhone(e: React.FormEvent) {
    e.preventDefault();
    const p = normalizePhone(phone);
    if (!/^09\d{9}$/.test(p)) {
      setError("شماره موبایلی را که با آن خرید کرده‌اید به‌شکل ۰۹xxxxxxxxx وارد کنید.");
      return;
    }
    run(async () => {
      await requestOtp(p);
      setPhone(p);
      setStep("otp");
    });
  }

  function handleOtp(e: React.FormEvent) {
    e.preventDefault();
    run(async () => {
      const { bookingToken } = await verifyOtp(phone, normalizePhone(otp));
      setItems(await fetchLibrary(bookingToken));
      setStep("list");
    });
  }

  const input = "w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="rounded-3xl border border-border bg-white p-5 elev-2 sm:p-7">
      {step === "phone" && (
        <form onSubmit={handlePhone} className="space-y-3">
          <label className="mb-1 block text-xs font-semibold text-ink-soft">شماره موبایلی که با آن خرید کرده‌اید</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" dir="ltr" className={`${input} text-right`} placeholder="09xxxxxxxxx" />
          {error && <p className="text-xs font-medium text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60">
            {loading ? "در حال ارسال کد…" : "دریافت کد تأیید پیامکی"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleOtp} className="space-y-3">
          <p className="text-xs text-muted">
            کد تأیید برای شماره‌ی <span dir="ltr" className="font-bold text-ink">{phone}</span> پیامک شد.
          </p>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} inputMode="numeric" dir="ltr" maxLength={6} placeholder="----" className={`${input} text-center text-lg tracking-[0.4em]`} />
          {error && <p className="text-xs font-medium text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-gold py-3 text-sm font-bold text-primary-deep transition hover:brightness-95 disabled:opacity-60">
            {loading ? "در حال بررسی…" : "ورود به پنل من"}
          </button>
          <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(null); }} className="w-full text-xs text-muted hover:text-primary">
            تغییر شماره
          </button>
        </form>
      )}

      {step === "list" && items.length === 0 && (
        <div className="space-y-3 text-center text-sm text-ink-soft">
          <p>با این شماره سفارشی پیدا نشد.</p>
          <p className="text-xs text-muted">اگر با شماره‌ی دیگری خرید کرده‌اید، با همان شماره وارد شوید.</p>
          <Link href="/#buy" className="inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white">خرید کتاب</Link>
        </div>
      )}

      {step === "list" && items.length > 0 && (
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={item.orderNo} className="rounded-2xl border border-border p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-bold text-primary">سلطان قیف — {FORMAT_FA[item.format]}</span>
                <span className="text-xs text-muted">
                  سفارش {item.orderNo.toLocaleString("fa-IR", { useGrouping: false })} · {faDate(item.paidAt ?? item.createdAt)}
                </span>
              </div>

              {item.status === "AWAITING_CONFIRMATION" && (
                <p className="mt-2 rounded-lg bg-warning-soft p-2.5 text-xs text-warning">
                  واریز شما ثبت شده و منتظر تأیید است. بعد از تأیید، لینک دانلود پیامک می‌شود و همین‌جا قرار می‌گیرد.
                </p>
              )}

              {item.format === "EBOOK" && item.paidAt && item.pdfUrl && item.epubUrl && (
                <>
                  {item.licenseCode && (
                    <p className="mt-2 text-xs text-muted">
                      کد مجوز: <span dir="ltr" className="font-mono font-semibold text-ink">{item.licenseCode}</span>
                    </p>
                  )}
                  {!item.ready && (
                    <p className="mt-2 text-xs text-muted">نسخه‌ی اختصاصی شما در حال آماده‌سازی است؛ دانلود ممکن است تا یک دقیقه طول بکشد.</p>
                  )}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <a href={item.pdfUrl} className="rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-primary-dark">
                      دانلود PDF
                      <span className="block text-[11px] font-normal opacity-80">صفحه‌به‌صفحه — لپ‌تاپ و تبلت</span>
                    </a>
                    <a href={item.epubUrl} className="rounded-xl border border-primary px-4 py-2.5 text-center text-sm font-bold text-primary transition hover:bg-primary-soft">
                      دانلود EPUB
                      <span className="block text-[11px] font-normal opacity-80">موبایل و اپ‌های کتاب‌خوان</span>
                    </a>
                  </div>
                  {item.expiresAt && <p className="mt-2 text-[11px] text-muted">لینک‌ها تا {faDate(item.expiresAt)} معتبرند؛ بعد از آن دوباره از همین صفحه بگیرید.</p>}
                </>
              )}

              {item.format !== "EBOOK" && item.paidAt && (
                <p className="mt-2 text-xs text-muted">
                  {item.format === "PRINT" ? (item.status === "SHIPPED" ? "نسخه‌ی چاپی ارسال شده است." : "پرداخت تأیید شد؛ نسخه‌ی چاپی به‌زودی ارسال می‌شود.") : "پرداخت تأیید شد؛ فایل صوتی به‌زودی برای شما ارسال می‌شود."}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
