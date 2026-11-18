"use client";

import { useState } from "react";
import { normalizePhone, verifyLicense, type LicenseCheck } from "@/lib/checkout";

export function VerifyLicenseForm() {
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<LicenseCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const order = Number(normalizePhone(orderNo));
    const p = normalizePhone(phone);
    if (!order || !/^09\d{9}$/.test(p) || code.trim().length < 16) {
      setError("شماره سفارش، شماره موبایل خریدار و کد مجوز را کامل وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      setResult(await verifyLicense({ orderNo: order, phone: p, code: code.trim() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="rounded-3xl border border-border bg-white p-5 elev-2 sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-soft">شماره سفارش</label>
          <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} inputMode="numeric" dir="ltr" className={`${input} text-right`} placeholder="مثلاً 1024" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-soft">شماره موبایل خریدار</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" dir="ltr" className={`${input} text-right`} placeholder="09xxxxxxxxx" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-soft">کد مجوز</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" autoCapitalize="characters" className={`${input} font-mono`} placeholder="FK-XXXX-XXXX-XXXX-XXXX" />
        </div>
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60">
          {loading ? "در حال استعلام…" : "استعلام"}
        </button>
      </form>

      {result?.valid === true && (
        <div className="mt-5 rounded-2xl border border-green-600/30 bg-green-50 p-4 text-sm text-ink">
          <p className="font-bold text-green-800">✓ این نسخه اصل است.</p>
          <p className="mt-2">صادرشده به نام <b>{result.holderName}</b> (<span dir="ltr">{result.holderPhone}</span>)</p>
          <p className="mt-1 text-xs text-muted">
            سفارش {result.orderNo.toLocaleString("fa-IR", { useGrouping: false })} ·{" "}
            {new Date(result.issuedAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="mt-2 text-xs text-muted">نام روی صفحه‌ی مجوز و پانویس فایل باید با همین نام یکی باشد.</p>
        </div>
      )}
      {result?.valid === false && (
        <div className="mt-5 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          این مشخصات با هیچ نسخه‌ی صادرشده‌ای مطابقت ندارد. شماره سفارش، موبایل و کد مجوز را دوباره بررسی کنید.
        </div>
      )}
    </div>
  );
}
