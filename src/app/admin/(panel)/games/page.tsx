import Link from "next/link";
import { Badge, ErrorBox, PageTitle, TableWrap, td, th } from "@/components/admin/ui";
import { gameApi, type DiscountCodeRow, type GameSummary } from "@/lib/admin/api";
import { fmtDateTime, fmtNumber } from "@/lib/admin/format";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function GamesPage() {
  await requireAdmin();
  const [games, codes] = await Promise.all([safe(gameApi<GameSummary[]>("/games?limit=300")), safe(gameApi<DiscountCodeRow[]>("/discount-codes"))]);

  return (
    <>
      <PageTitle title="آرشیو بازی‌ها" hint="هر بازی که تمام شود با نتیجه‌ی تیم‌ها و تصمیم‌های دور‌به‌دور خودکار ذخیره می‌شود" />
      {!games.ok ? (
        <ErrorBox>{games.error}</ErrorBox>
      ) : games.data.length === 0 ? (
        <p className="text-sm text-muted">هنوز بازی‌ای ذخیره نشده است. بازی‌هایی که از این پس تمام شوند اینجا می‌آیند.</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">{fmtNumber(games.data.length)} بازی</p>
          <TableWrap>
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <th className={th}>زمان</th>
                  <th className={th}>حالت</th>
                  <th className={th}>دورها</th>
                  <th className={th}>رتبه‌ی اول</th>
                  <th className={th}>تیم‌ها</th>
                  <th className={th}>تصمیم‌ها</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {games.data.map((g) => (
                  <tr key={g.id}>
                    <td className={`${td} whitespace-nowrap`}>{fmtDateTime(g.createdAt)}</td>
                    <td className={td}>
                      <Badge tone={g.mode === "funnel" ? "gold" : "info"}>{g.mode === "funnel" ? "قیف" : "کلاسیک"}</Badge>
                    </td>
                    <td className={td}>{fmtNumber(g.totalRounds)}</td>
                    <td className={`${td} font-semibold`}>{g.teams.find((t) => t.finalRank === 1)?.companyName ?? "—"}</td>
                    <td className={`${td} text-xs text-muted`}>{g.teams.map((t) => t.companyName).join("، ")}</td>
                    <td className={td}>{g.hasDecisions ? <Badge tone="ok">ثبت‌شده</Badge> : <Badge tone="warn">ندارد (بازی قدیمی)</Badge>}</td>
                    <td className={td}>
                      <Link href={`/admin/games/${encodeURIComponent(g.id)}`} className="text-xs font-semibold text-primary underline">
                        مشاهده
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </>
      )}

      <h2 className="mb-3 mt-8 text-base font-bold text-primary-dark">کدهای تخفیف تیم‌های برنده</h2>
      {!codes.ok ? (
        <ErrorBox>{codes.error}</ErrorBox>
      ) : codes.data.length === 0 ? (
        <p className="text-sm text-muted">هنوز کدی صادر نشده است.</p>
      ) : (
        <TableWrap>
          <table className="w-full min-w-[520px]">
            <thead>
              <tr>
                <th className={th}>کد</th>
                <th className={th}>صدور</th>
                <th className={th}>وضعیت</th>
                <th className={th}>بازی</th>
              </tr>
            </thead>
            <tbody>
              {codes.data.map((c) => (
                <tr key={c.code}>
                  <td className={td}>
                    <code dir="ltr" className="select-all rounded bg-primary-soft px-1.5 py-0.5 text-xs">
                      {c.code}
                    </code>
                  </td>
                  <td className={`${td} whitespace-nowrap`}>{fmtDateTime(c.createdAt)}</td>
                  <td className={td}>{c.redeemedAt ? <Badge tone="ok">استفاده‌شده — {fmtDateTime(c.redeemedAt)}</Badge> : <Badge tone="warn">استفاده‌نشده</Badge>}</td>
                  <td className={td}>
                    <Link href={`/admin/games/${encodeURIComponent(c.gameId)}`} className="text-xs font-semibold text-primary underline">
                      مشاهده
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
