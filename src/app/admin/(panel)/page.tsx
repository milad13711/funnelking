import Link from "next/link";
import { Badge, Card, ErrorBox, MiniBars, PageTitle, Stat, TableWrap, td, th } from "@/components/admin/ui";
import { bookApi, gameApi, type GameSummary, type Overview } from "@/lib/admin/api";
import { fmtDateTime, fmtDay, fmtNumber, fmtToman } from "@/lib/admin/format";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [overview, games] = await Promise.all([safe(bookApi<Overview>("/overview")), safe(gameApi<GameSummary[]>("/games?limit=5"))]);

  return (
    <>
      <PageTitle title="نمای کلی" hint="خلاصه‌ی فروش کتاب و بازی‌ها" />

      {!overview.ok ? (
        <ErrorBox>خطا در دریافت آمار فروش: {overview.error}</ErrorBox>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="نسخه‌های PDF/EPUB فروخته‌شده" value={fmtNumber(overview.data.paidOrders.EBOOK)} tone="gold" />
            <Stat label="نسخه‌های چاپی" value={fmtNumber(overview.data.paidOrders.PRINT)} />
            <Stat label="نسخه‌های صوتی" value={fmtNumber(overview.data.paidOrders.AUDIO)} />
            <Stat label="خریداران یکتا" value={fmtNumber(overview.data.uniqueBuyers)} />
            <Stat label="درآمد (بدون هدیه‌ها)" value={fmtToman(overview.data.revenueToman)} />
            <Stat
              label="نسخه‌ی نیازمند بررسی"
              value={fmtNumber(overview.data.ebookNeedsAttention)}
              sub="ساخت فایل با خطا مواجه شده"
              tone={overview.data.ebookNeedsAttention > 0 ? "warn" : "default"}
            />
            <Stat label="نسخه‌های لغوشده" value={fmtNumber(overview.data.revokedCopies)} />
            <Stat
              label="واریز منتظر تأیید"
              value={fmtNumber(overview.data.pendingPayments)}
              sub={overview.data.pendingPayments > 0 ? "برای تأیید به «پرداخت‌ها» بروید" : "موردی در صف نیست"}
              tone={overview.data.pendingPayments > 0 ? "warn" : "default"}
            />
          </div>

          <Card title="نسخه‌های صادرشده در ۳۰ روز گذشته" className="mt-5">
            <MiniBars data={overview.data.last30Days.map((d) => ({ label: fmtDay(d.day), sold: d.sold, manual: d.manual }))} />
            <p className="mt-2 text-xs text-muted">
              <span className="me-3 inline-block h-2 w-2 rounded-sm bg-primary align-middle" /> فروش سایت
              <span className="me-1 ms-4 inline-block h-2 w-2 rounded-sm bg-gold align-middle" /> هدیه / ساخت دستی
            </p>
            {overview.data.ebookNeedsAttention > 0 && (
              <p className="mt-3 text-sm">
                <Link href="/admin/buyers?tab=ebook" className="font-semibold text-danger underline">
                  برای دیدن نسخه‌های خطادار به «خریداران» بروید
                </Link>
              </p>
            )}
          </Card>
        </>
      )}

      <h2 className="mb-3 mt-8 text-base font-bold text-primary-dark">آخرین بازی‌های آرشیوشده</h2>
      {!games.ok ? (
        <ErrorBox>خطا در دریافت بازی‌ها: {games.error}</ErrorBox>
      ) : games.data.length === 0 ? (
        <p className="text-sm text-muted">هنوز بازی‌ای ذخیره نشده است.</p>
      ) : (
        <TableWrap>
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th className={th}>زمان</th>
                <th className={th}>حالت</th>
                <th className={th}>برنده</th>
                <th className={th}>تیم‌ها</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {games.data.map((g) => (
                <tr key={g.id}>
                  <td className={td}>{fmtDateTime(g.createdAt)}</td>
                  <td className={td}>
                    <Badge tone={g.mode === "funnel" ? "gold" : "info"}>{g.mode === "funnel" ? "قیف" : "کلاسیک"}</Badge>
                  </td>
                  <td className={td}>{g.teams.find((t) => t.finalRank === 1)?.companyName ?? "—"}</td>
                  <td className={td}>{fmtNumber(g.teams.length)}</td>
                  <td className={td}>
                    <Link href={`/admin/games/${encodeURIComponent(g.id)}`} className="text-xs font-semibold text-primary underline">
                      جزئیات
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </>
  );
}
