"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { cancelOrder, claimTransfer, getPaymentInfo, type PaymentInfo } from "@/lib/checkout";

const FORMAT_LABEL = { PRINT: "نسخه‌ی چاپی", EBOOK: "نسخه‌ی الکترونیکی", AUDIO: "نسخه‌ی صوتی" } as const;
const fa = (n: number | string) => Number(n).toLocaleString("fa-IR");
const faDigits = (s: string) => s.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
/** ارقام فارسی/عربی → لاتین (برای فیلدهای عددی؛ بدون دست‌زدن به پیش‌شماره‌ی 98 مثل normalizePhone). */
const latinDigits = (s: string) => s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

function useCountdown(expiresAt: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return left;
}

function CopyButton({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* کلیپ‌بورد در دسترس نیست؛ کاربر می‌تواند متن را انتخاب کند */
        }
      }}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${className}`}
      aria-label={label}
    >
      <span aria-hidden>{done ? "✓" : "⧉"}</span>
      {done ? "کپی شد" : label}
    </button>
  );
}

function Shell({ title, timer, children }: { title: string; timer?: string | null; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-[#eef2fa] elev-2">
      <div className="flex items-center justify-between gap-3 bg-primary px-4 py-4 text-white">
        <h1 className="text-base font-extrabold">{title}</h1>
        {timer && (
          <span className="tabular rounded-full bg-white/15 px-3 py-1 text-sm font-bold" aria-label="زمان باقی‌مانده">
            ⏱ {timer}
          </span>
        )}
      </div>
      <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function PayCard({ orderId }: { orderId: string }) {
  const [info, setInfo] = useState<PaymentInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [last4, setLast4] = useState("");
  const [tracking, setTracking] = useState("");
  const [busy, setBusy] = useState(false);
  const left = useCountdown(info?.status === "PENDING_PAYMENT" ? info.expiresAt : null);

  const load = useCallback(async () => {
    try {
      setInfo(await getPaymentInfo(orderId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    }
  }, [orderId]);

  useEffect(() => {
    let alive = true;
    getPaymentInfo(orderId)
      .then((i) => alive && setInfo(i))
      .catch((err) => alive && setError(err instanceof Error ? err.message : "خطای ناشناخته"));
    return () => {
      alive = false;
    };
  }, [orderId]);

  // بعد از «واریز کردم»، وضعیت را هر ۲۰ ثانیه می‌پرسیم تا تأیید مدیر بدون رفرش نشان داده شود
  useEffect(() => {
    if (info?.status !== "AWAITING_CONFIRMATION") return;
    const id = setInterval(() => void load(), 20_000);
    return () => clearInterval(id);
  }, [info?.status, load]);

  async function onClaim() {
    setError(null);
    const digits = latinDigits(last4).trim();
    if (digits && !/^\d{4}$/.test(digits)) {
      setError("چهار رقم آخر کارت را درست وارد کنید یا خالی بگذارید.");
      return;
    }
    setBusy(true);
    try {
      setInfo(await claimTransfer(orderId, { payerCardLast4: digits || undefined, trackingCode: latinDigits(tracking).trim() || undefined }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت درخواست انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  async function onCancel() {
    if (!window.confirm("سفارش لغو شود؟")) return;
    setBusy(true);
    try {
      await cancelOrder(orderId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "لغو انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  if (!info) {
    return (
      <Shell title="کارت به کارت">
        {error ? <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p> : <p className="text-center text-sm text-muted">در حال بارگذاری…</p>}
      </Shell>
    );
  }

  const label = FORMAT_LABEL[info.format];
  const timer = left === null ? null : `${faDigits(String(Math.floor(left / 60)).padStart(2, "0"))}:${faDigits(String(left % 60).padStart(2, "0"))}`;

  // ───────── در انتظار تأیید مدیر ─────────
  if (info.status === "AWAITING_CONFIRMATION") {
    return (
      <Shell title="درخواست شما ثبت شد">
        <div className="rounded-2xl bg-white p-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-2xl text-success" aria-hidden>
            ✓
          </div>
          <p className="font-bold text-primary-dark">منتظر تأیید واریز</p>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            بعد از بررسی واریز، {info.format === "EBOOK" ? "لینک دانلود نسخه‌ی اختصاصی شما" : "وضعیت سفارش"} پیامک می‌شود. نسخه‌ی اختصاصی در «پنل من» هم قرار می‌گیرد.
          </p>
          <dl className="mt-4 space-y-1.5 rounded-xl bg-primary-soft p-3 text-right text-sm">
            <div className="flex justify-between"><dt className="text-muted">شماره سفارش</dt><dd className="tabular font-bold">{fa(info.orderNo)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">محصول</dt><dd className="font-bold">{label}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">مبلغ</dt><dd className="tabular font-bold">{fa(info.amountToman)} تومان</dd></div>
          </dl>
        </div>
        <Link href="/library" className="block rounded-2xl bg-primary py-3 text-center text-sm font-bold text-white hover:bg-primary-dark">
          ورود به پنل من (با کد پیامکی)
        </Link>
      </Shell>
    );
  }

  // ───────── تأیید شده ─────────
  if (info.status === "PAID" || info.status === "DELIVERED" || info.status === "SHIPPED") {
    return (
      <Shell title="واریز تأیید شد">
        <div className="rounded-2xl bg-white p-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-2xl text-success" aria-hidden>
            ✓
          </div>
          <p className="font-bold text-primary-dark">سفارش شماره‌ی {fa(info.orderNo)} تأیید شد</p>
          <p className="mt-2 text-sm leading-7 text-ink-soft">
            {info.format === "EBOOK"
              ? "لینک دانلود نسخه‌ی اختصاصی شما پیامک شد و در پنل شما هم هست."
              : info.format === "PRINT"
                ? "نسخه‌ی چاپی به‌زودی برای شما ارسال می‌شود."
                : "فایل صوتی به‌زودی برای شما ارسال می‌شود."}
          </p>
        </div>
        <Link href="/library" className="block rounded-2xl bg-primary py-3 text-center text-sm font-bold text-white hover:bg-primary-dark">
          ورود به پنل من
        </Link>
      </Shell>
    );
  }

  // ───────── لغو شده ─────────
  if (info.status === "CANCELLED" || !info.card) {
    return (
      <Shell title="سفارش بسته شد">
        <div className="rounded-2xl bg-white p-5 text-center text-sm leading-7 text-ink-soft">
          <p className="font-bold text-primary-dark">این سفارش دیگر فعال نیست.</p>
          <p className="mt-1">اگر واریز کرده‌اید، شماره‌ی سفارش ({fa(info.orderNo)}) را برای پشتیبانی بفرستید. برای خرید دوباره، سفارش تازه بسازید.</p>
        </div>
        <Link href="/#buy" className="block rounded-2xl bg-primary py-3 text-center text-sm font-bold text-white hover:bg-primary-dark">
          ثبت سفارش جدید
        </Link>
      </Shell>
    );
  }

  // ───────── صفحه‌ی واریز ─────────
  const rawCard = info.card.number.replace(/\s/g, "");
  return (
    <Shell title="کارت به کارت" timer={timer}>
      <div className="rounded-3xl bg-primary-deep p-5 text-white elev-2">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>کارت مقصد{info.card.bank ? ` · ${info.card.bank}` : ""}</span>
          <span aria-hidden>))))</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <CopyButton value={rawCard} label="کپی" className="bg-white/10 text-white hover:bg-white/20" />
          <p dir="ltr" className="tabular select-all text-xl font-extrabold tracking-wider sm:text-2xl">
            {faDigits(info.card.number)}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-bold">{info.card.holder}</span>
          <span className="text-white/60">به نام</span>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <CopyButton value={String(info.amountRial)} label="کپی مبلغ به ریال" className="bg-primary-soft text-primary hover:bg-primary-soft/70" />
          <div className="text-right">
            <p className="text-xs text-muted">مبلغ دقیق واریز · {label}</p>
            <p className="tabular text-2xl font-black text-ink">
              {fa(info.amountRial)} <span className="text-sm font-semibold">ریال</span>
            </p>
            <p className="tabular text-xs text-muted">{fa(info.amountToman)} تومان</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-warning-soft p-3 text-sm leading-7 text-warning">
          <span aria-hidden className="me-1">●</span>
          دقیقاً همین مبلغ را به همین کارت واریز کنید. بعد از واریز، دکمه‌ی «واریز کردم» را بزنید تا درخواست شما برای تأیید ثبت شود.
          {left === 0 && <strong className="block">مهلت پیشنهادی تمام شده؛ اگر واریز کرده‌اید همچنان می‌توانید دکمه را بزنید.</strong>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="last4" className="mb-1 block text-xs font-semibold text-ink-soft">
              ۴ رقم آخر کارت شما <span className="font-normal text-muted">(اختیاری)</span>
            </label>
            <input
              id="last4"
              value={last4}
              onChange={(e) => setLast4(e.target.value)}
              inputMode="numeric"
              dir="ltr"
              maxLength={4}
              placeholder="۶۰۸۸"
              className="w-full rounded-xl border border-border bg-[#f6f8fc] px-3 py-2.5 text-center text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="tracking" className="mb-1 block text-xs font-semibold text-ink-soft">
              شماره پیگیری بانک <span className="font-normal text-muted">(اختیاری)</span>
            </label>
            <input
              id="tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              inputMode="numeric"
              dir="ltr"
              maxLength={30}
              placeholder="مثلاً ۱۲۳۴۵۶"
              className="w-full rounded-xl border border-border bg-[#f6f8fc] px-3 py-2.5 text-center text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onClaim}
        disabled={busy}
        className="w-full rounded-2xl bg-success py-4 text-base font-extrabold text-white shadow transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? "در حال ثبت…" : "واریز کردم"}
      </button>
      <button type="button" onClick={onCancel} disabled={busy} className="w-full text-center text-sm font-semibold text-danger hover:underline disabled:opacity-60">
        انصراف
      </button>
      <p className="text-center text-[11px] text-muted">
        سفارش شماره‌ی {fa(info.orderNo)} · {info.buyerName}
      </p>
    </Shell>
  );
}
