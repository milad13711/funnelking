"use client";

import { useState } from "react";
import { normalizePhone, verifyLicense, type LicenseCheck } from "@/lib/checkout";

export function VerifyLicenseForm() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<LicenseCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const p = phone.trim() ? normalizePhone(phone) : "";
    const c = code.trim();
    if (!p && !c) {
      setError("شماره موبایل خریدار یا شناسه‌ی مجوز را وارد کنید (یکی کافی است).");
      return;
    }
    if (p && !/^09\d{9}$/.test(p)) {
      setError("شماره موبایل را به‌شکل ۰۹xxxxxxxxx وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      setResult(await verifyLicense({ ...(p ? { phone: p } : {}), ...(c ? { code: c } : {}) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته");
    } finally {
      setLoading(false);
    }
  }

  const input = "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 outline-none focus:border-primary";

  return (
    <div className="rounded-3xl border border-border bg-white p-5 elev-2 sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-soft">شناسه‌ی مجوز</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" autoCapitalize="characters" className={`${input} font-mono`} placeholder="FK-XXXX-XXXX-XXXX-XXXX" />
        </div>
        <p className="text-center text-xs text-muted">— یا —</p>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-soft">شماره موبایل خریدار</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" dir="ltr" className={`${input} text-right`} placeholder="09xxxxxxxxx" />
        </div>
        {error && <p className="text-xs font-medium text-danger">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary-dark disabled:opacity-60">
          {loading ? "در حال استعلام…" : "استعلام"}
        </button>
      </form>

      {result?.valid === true && (
        <div className="mt-5 space-y-3">
          {result.copies.map((c) => (
            <div key={c.orderNo} className="rounded-2xl border border-green-600/30 bg-green-50 p-4 text-sm text-ink">
              <p className="font-bold text-green-800">✓ نسخه‌ی اصل است.</p>
              <p className="mt-2">
                صادرشده به نام <b>{c.holderName}</b> (<span dir="ltr">{c.holderPhone}</span>)
              </p>
              {c.licenseCode && (
                <p className="mt-1 text-xs text-muted">
                  شناسه‌ی مجوز: <span dir="ltr" className="font-mono">{c.licenseCode}</span>
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                تاریخ صدور: {new Date(c.issuedAt).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
      {result?.valid === false && (
        <div className="mt-5 rounded-2xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
          نسخه‌ای با این مشخصات پیدا نشد. شناسه‌ی مجوز یا شماره‌ی موبایل را دوباره بررسی کنید.
        </div>
      )}
    </div>
  );
}
