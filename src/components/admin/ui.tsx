import type { ReactNode } from "react";

/** اجزای ساده‌ی ظاهری داشبورد؛ همه Server Component هستند. */

export function PageTitle({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-extrabold text-primary-dark sm:text-2xl">{title}</h1>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title && <h2 className="mb-3 text-base font-bold text-primary-dark">{title}</h2>}
      {children}
    </section>
  );
}

export function Stat({ label, value, sub, tone = "default" }: { label: string; value: string; sub?: string; tone?: "default" | "warn" | "gold" }) {
  const toneClass = tone === "warn" ? "text-danger" : tone === "gold" ? "text-gold-dark" : "text-primary-dark";
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-extrabold ${toneClass}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

const BADGE: Record<string, string> = {
  ok: "bg-success-soft text-success",
  warn: "bg-warning-soft text-warning",
  bad: "bg-danger-soft text-danger",
  info: "bg-primary-soft text-primary",
  gold: "bg-accent-soft text-gold-dark",
};

export function Badge({ tone = "info", children }: { tone?: keyof typeof BADGE; children: ReactNode }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold ${BADGE[tone]}`}>{children}</span>;
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm text-danger">{children}</div>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="mb-4 rounded-xl border border-gold/40 bg-accent-soft p-3 text-sm text-gold-dark">{children}</div>;
}

export const btn =
  "inline-flex items-center justify-center rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-gold";
export const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-gold disabled:opacity-60";
export const btnDanger =
  "inline-flex items-center justify-center rounded-lg border border-danger/40 bg-white px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft";
export const input =
  "w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">{children}</div>;
}

export const th = "whitespace-nowrap border-b border-border bg-primary-soft px-3 py-2 text-right text-xs font-bold text-primary";
export const td = "border-b border-border/70 px-3 py-2 align-top text-sm";

/** نمودار میله‌ای ساده (CSS) برای ۳۰ روز اخیر. */
export function MiniBars({ data }: { data: { label: string; sold: number; manual: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.sold + d.manual));
  if (data.length === 0) return <p className="text-sm text-muted">در ۳۰ روز گذشته فروشی ثبت نشده است.</p>;
  return (
    <div className="flex h-36 items-end gap-1.5" role="img" aria-label="تعداد نسخه‌های صادرشده در ۳۰ روز گذشته">
      {data.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${d.label}: ${d.sold} فروش، ${d.manual} هدیه/دستی`}>
          <div className="flex w-full flex-col justify-end" style={{ height: Math.max(6, Math.round(((d.sold + d.manual) / max) * 100)) }}>
            {d.manual > 0 && <div className="w-full rounded-t bg-gold" style={{ flexGrow: d.manual }} />}
            {d.sold > 0 && <div className={`w-full bg-primary ${d.manual === 0 ? "rounded-t" : ""}`} style={{ flexGrow: d.sold }} />}
          </div>
          <span className="w-full truncate text-center text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
