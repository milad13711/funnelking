import Link from "next/link";
import { ErrorBox, Notice, PageTitle, btnPrimary, input } from "@/components/admin/ui";
import { OrderTable } from "@/components/admin/OrderTable";
import { bookApi, type OrderRow } from "@/lib/admin/api";
import { fmtNumber } from "@/lib/admin/format";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "ebook", label: "الکترونیکی (PDF/EPUB)", format: "EBOOK" },
  { key: "print", label: "چاپی", format: "PRINT" },
  { key: "audio", label: "صوتی", format: "AUDIO" },
  { key: "all", label: "همه", format: "" },
] as const;

const STATES = [
  { key: "paid", label: "پرداخت‌شده" },
  { key: "pending", label: "پرداخت‌نشده" },
  { key: "all", label: "همه‌ی سفارش‌ها" },
] as const;

type Search = Promise<{ tab?: string; state?: string; q?: string; ok?: string; err?: string }>;

export default async function BuyersPage({ searchParams }: { searchParams: Search }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const state = STATES.find((s) => s.key === sp.state)?.key ?? "paid";
  const q = (sp.q ?? "").trim().slice(0, 60);

  const query = new URLSearchParams({ state });
  if (tab.format) query.set("format", tab.format);
  if (q) query.set("q", q);
  const orders = await safe(bookApi<OrderRow[]>(`/orders?${query}`));

  const back = `/admin/buyers?${new URLSearchParams({ tab: tab.key, state, ...(q ? { q } : {}) })}`;
  const link = (patch: Record<string, string>) => `/admin/buyers?${new URLSearchParams({ tab: tab.key, state, ...(q ? { q } : {}), ...patch })}`;

  return (
    <>
      <PageTitle title="خریداران و نسخه‌ها" hint="چه کسانی کتاب را تهیه کرده‌اند؛ مجوز، دانلود و مدیریت هر نسخه" />
      {sp.ok && <Notice>{sp.ok}</Notice>}
      {sp.err && <div className="mb-4"><ErrorBox>{sp.err}</ErrorBox></div>}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={link({ tab: t.key })}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${t.key === tab.key ? "bg-primary text-white" : "bg-white text-primary ring-1 ring-border hover:bg-primary-soft"}`}
          >
            {t.label}
          </Link>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
        {STATES.map((s) => (
          <Link
            key={s.key}
            href={link({ state: s.key })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${s.key === state ? "bg-gold text-primary-deep" : "bg-white text-muted ring-1 ring-border hover:bg-primary-soft"}`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <form className="mb-4 flex max-w-xl gap-2" role="search">
        <input type="hidden" name="tab" value={tab.key} />
        <input type="hidden" name="state" value={state} />
        <input name="q" defaultValue={q} className={input} placeholder="جستجو: نام، شماره موبایل، شماره سفارش یا کد مجوز" aria-label="جستجو" />
        <button type="submit" className={btnPrimary}>
          جستجو
        </button>
      </form>

      {!orders.ok ? (
        <ErrorBox>{orders.error}</ErrorBox>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">{fmtNumber(orders.data.length)} مورد</p>
          <OrderTable orders={orders.data} back={back} />
        </>
      )}
    </>
  );
}
