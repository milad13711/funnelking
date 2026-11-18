"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { PRODUCT_LIST, type ProductFormat } from "@/lib/content";
import type { Storefront } from "@/lib/storefront";
import { createOrder, getOrderStatus, payOrder, requestOtp, verifyOtp } from "@/lib/checkout";

type Step = "select" | "details" | "otp" | "submitting" | "redirecting" | "error";

function formatToman(n: number) {
  return n.toLocaleString("fa-IR") + " تومان";
}

export function BuyBox({ prices, paymentMethod }: { prices: Storefront["prices"]; paymentMethod: Storefront["paymentMethod"] }) {
  const router = useRouter();
  const [format, setFormat] = useState<ProductFormat>("print");
  const [step, setStep] = useState<Step>("select");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const product = PRODUCT_LIST.find((p) => p.id === format)!;
  const priceOf = (id: ProductFormat) => prices[id];

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || phone.trim().length < 10) {
      setError("لطفاً نام و شماره موبایل معتبر وارد کنید.");
      return;
    }
    if (product.needsShipping && (!address.trim() || !postalCode.trim())) {
      setError("برای نسخه‌ی چاپی، آدرس و کد پستی لازم است.");
      return;
    }
    setLoading(true);
    try {
      await requestOtp(phone.trim());
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.trim().length < 4) {
      setError("کد تأیید را کامل وارد کنید.");
      return;
    }
    setLoading(true);
    setStep("submitting");
    try {
      const { bookingToken } = await verifyOtp(phone.trim(), otp.trim());
      const { orderId, paymentMethod: method } = await createOrder({
        bookingToken,
        format,
        buyerName: name.trim(),
        address: product.needsShipping ? address.trim() : undefined,
        postalCode: product.needsShipping ? postalCode.trim() : undefined,
      });
      if (method === "CARD") {
        // کارت‌به‌کارت: صفحه‌ی اختصاصی پرداخت (قابل‌بازگشت با لینک سفارش)
        setStep("redirecting");
        router.push(`/pay/${orderId}`);
        return;
      }
      const { paymentUrl } = await payOrder(orderId);
      setStep("redirecting");
      // Confirm the order actually reached a payable state before leaving the page.
      await getOrderStatus(orderId).catch(() => null);
      window.location.href = paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="buy" className="rounded-3xl border border-border bg-white p-5 elev-2 sm:p-7">
      <h3 className="mb-4 text-lg font-bold text-primary">نسخه‌ی خود را انتخاب کنید</h3>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {PRODUCT_LIST.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              setFormat(p.id);
              setError(null);
            }}
            className={clsx(
              "relative rounded-2xl border p-4 text-right transition",
              format === p.id
                ? "border-primary bg-primary-soft"
                : "border-border bg-white hover:border-primary/40"
            )}
          >
            {p.badge && (
              <span className="absolute -top-2 right-3 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-primary-deep">
                {p.badge}
              </span>
            )}
            <div className="text-sm font-bold text-primary">{p.title}</div>
            <div className="tabular mt-1 text-lg font-black text-ink">{formatToman(priceOf(p.id))}</div>
            <div className="mt-1 text-xs text-muted">{p.blurb}</div>
          </button>
        ))}
      </div>

      {step === "select" && (
        <button
          type="button"
          onClick={() => setStep("details")}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
        >
          ادامه‌ی خرید — {formatToman(priceOf(product.id))}
        </button>
      )}

      {step === "details" && (
        <form onSubmit={handleDetailsSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">نام و نام‌خانوادگی</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-primary"
              placeholder="مثلاً محمدامین بهرامی"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-soft">شماره موبایل</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="numeric"
              dir="ltr"
              className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-primary text-right"
              placeholder="09xxxxxxxxx"
            />
          </div>
          {product.needsShipping && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">آدرس دقیق پستی</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-primary"
                  placeholder="استان، شهر، خیابان، پلاک، واحد"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-soft">کد پستی</label>
                <input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  inputMode="numeric"
                  dir="ltr"
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-primary text-right"
                  placeholder="۱۰ رقم"
                />
              </div>
            </>
          )}
          {error && <p className="text-xs font-medium text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? "در حال ارسال کد تأیید…" : "دریافت کد تأیید پیامکی"}
          </button>
        </form>
      )}

      {(step === "otp" || step === "submitting" || step === "redirecting") && (
        <form onSubmit={handleOtpSubmit} className="space-y-3">
          <p className="text-xs text-muted">
            کد تأیید برای شماره‌ی <span dir="ltr" className="font-bold text-ink">{phone}</span> پیامک شد.
          </p>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            inputMode="numeric"
            dir="ltr"
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-center text-lg tracking-[0.4em] text-ink placeholder:text-muted/70 outline-none focus:border-primary"
            placeholder="----"
            maxLength={6}
            disabled={step !== "otp"}
          />
          {error && <p className="text-xs font-medium text-danger">{error}</p>}
          <button
            type="submit"
            disabled={step !== "otp" || loading}
            className="w-full rounded-xl bg-gold py-3 text-sm font-bold text-primary-deep transition hover:brightness-95 disabled:opacity-60"
          >
            {step === "otp" && (paymentMethod === "CARD" ? "ثبت سفارش و مشاهده‌ی اطلاعات واریز" : "پرداخت و ثبت سفارش")}
            {step === "submitting" && "در حال ثبت سفارش…"}
            {step === "redirecting" && (paymentMethod === "CARD" ? "انتقال به صفحه‌ی واریز…" : "انتقال به درگاه پرداخت…")}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-[11px] text-muted">
        {paymentMethod === "CARD"
          ? "پرداخت کارت‌به‌کارت · بعد از تأیید واریز، لینک دانلود نسخه‌ی اختصاصی شما پیامک می‌شود."
          : "پرداخت امن از طریق درگاه زرین‌پال · نسخه‌ی الکترونیکی بلافاصله بعد از پرداخت به نام شما صادر می‌شود."}
        {" "}
        <Link href="/library" className="font-semibold text-primary hover:underline">
          قبلاً خریده‌اید؟ پنل من
        </Link>
        {" · "}
        <Link href="/verify" className="font-semibold text-primary hover:underline">
          استعلام لایسنس
        </Link>
      </p>
    </div>
  );
}
