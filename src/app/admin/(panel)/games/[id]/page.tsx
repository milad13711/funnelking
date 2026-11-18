import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, Card, ErrorBox, PageTitle, TableWrap, btn, td, th } from "@/components/admin/ui";
import { AdminApiError, gameApi, type GameArchive } from "@/lib/admin/api";
import { fmtDateTime, fmtNumber } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const STAGE_FA: Record<string, string> = {
  attention: "توجه",
  acquisition: "جذب",
  activation: "فعال‌سازی",
  revenue: "درآمد",
  retention: "نگهداشت",
  referral: "ارجاع و تکرار خرید",
};
const BOTTLENECK_FA: Record<string, string> = { growth: "رشد", value: "ارزش", money: "پول" };

type Round = Record<string, unknown>;
const num = (v: unknown) => (typeof v === "number" ? v : null);
const str = (v: unknown) => (typeof v === "string" ? v : "");

function ClassicRounds({ rounds }: { rounds: Round[] }) {
  return (
    <table className="w-full min-w-[640px]">
      <thead>
        <tr>
          <th className={th}>دور</th>
          <th className={th}>تصمیم‌ها (کارت‌های انتخابی)</th>
          <th className={th}>درآمد</th>
          <th className={th}>نقدینگی</th>
          <th className={th}>امتیاز</th>
          <th className={th}>گلوگاه</th>
        </tr>
      </thead>
      <tbody>
        {rounds.map((r, i) => {
          const names = Array.isArray(r.pickedCardNames) ? (r.pickedCardNames as (string | null)[]) : [];
          return (
            <tr key={i}>
              <td className={td}>{fmtNumber(num(r.round))}</td>
              <td className={td}>
                {names.filter(Boolean).length ? (
                  <ol className="list-decimal space-y-0.5 ps-4">
                    {names.map((n, k) => (
                      <li key={k} className={n ? "" : "text-muted"}>
                        {n ?? "بدون انتخاب"}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <span className="text-muted">بدون انتخاب</span>
                )}
              </td>
              <td className={td}>{fmtNumber(num(r.revenue))}</td>
              <td className={td}>{fmtNumber(num(r.cash))}</td>
              <td className={td}>{num(r.teamScore) !== null ? new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(num(r.teamScore)!) : "—"}</td>
              <td className={td}>{BOTTLENECK_FA[str(r.bottleneck)] ?? "—"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function FunnelRounds({ rounds }: { rounds: Round[] }) {
  return (
    <table className="w-full min-w-[640px]">
      <thead>
        <tr>
          <th className={th}>ماه</th>
          <th className={th}>تصمیم‌ها</th>
          <th className={th}>درآمد ماه</th>
          <th className={th}>نقدینگی</th>
        </tr>
      </thead>
      <tbody>
        {rounds.map((r, i) => {
          const decisions = Array.isArray(r.decisions) ? (r.decisions as Round[]) : [];
          return (
            <tr key={i}>
              <td className={td}>{fmtNumber(num(r.round))}</td>
              <td className={td}>
                {decisions.length === 0 ? (
                  <span className="text-muted">بدون تصمیم</span>
                ) : (
                  <ul className="space-y-1.5">
                    {decisions.map((d, k) => (
                      <li key={k}>
                        <span className="font-semibold">{str(d.text) || "—"}</span>
                        <span className="ms-2 text-xs text-muted">
                          بودجه {fmtNumber(num(d.budget))}
                          {str(d.stage) && <> · مرحله‌ی {STAGE_FA[str(d.stage)] ?? str(d.stage)}</>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </td>
              <td className={td}>{fmtNumber(num(r.monthlyRevenue))}</td>
              <td className={td}>{fmtNumber(num(r.cash))}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  let game: GameArchive;
  try {
    game = await gameApi<GameArchive>(`/games/${encodeURIComponent(id)}`);
  } catch (err) {
    if (err instanceof AdminApiError && err.status === 404) notFound();
    return (
      <>
        <PageTitle title="بازی" />
        <ErrorBox>{err instanceof AdminApiError ? err.message : "خطای پیش‌بینی‌نشده"}</ErrorBox>
      </>
    );
  }

  const ranked = [...game.reports].sort((a, b) => Number(a.finalRank ?? 99) - Number(b.finalRank ?? 99));
  const decisionsByTeam = new Map((game.decisions ?? []).map((d) => [d.companyName, d]));

  return (
    <>
      <PageTitle title={`بازی ${game.mode === "funnel" ? "قیف" : "کلاسیک"}`} hint={`${fmtDateTime(game.createdAt)} · ${fmtNumber(game.totalRounds)} دور`}>
        <Link href="/admin/games" className={btn}>
          ← آرشیو بازی‌ها
        </Link>
      </PageTitle>

      <div className="space-y-5">
        {ranked.map((rep) => {
          const name = str(rep.companyName);
          const team = decisionsByTeam.get(name);
          const models = Array.isArray(rep.decisionModels) ? (rep.decisionModels as { nameFa?: string; evidenceFa?: string }[]) : [];
          return (
            <Card key={name}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone={Number(rep.finalRank) === 1 ? "gold" : "info"}>رتبه‌ی {fmtNumber(num(rep.finalRank))}</Badge>
                <h2 className="text-base font-bold text-primary-dark">{name}</h2>
                <span className="text-xs text-muted">
                  {num(rep.finalScore) !== null && <>امتیاز {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(num(rep.finalScore)!)} · </>}
                  {num(rep.finalNetWorth) !== null && <>دارایی خالص {fmtNumber(num(rep.finalNetWorth))} · </>}
                  نقدینگی نهایی {fmtNumber(num(rep.finalCash))}
                </span>
                {typeof rep.discountCode === "string" && (
                  <code dir="ltr" className="select-all rounded bg-accent-soft px-1.5 py-0.5 text-xs text-gold-dark">
                    {rep.discountCode}
                  </code>
                )}
              </div>
              {models.length > 0 && (
                <ul className="mb-3 space-y-1 text-sm">
                  {models.map((m, i) => (
                    <li key={i}>
                      <span className="font-semibold">{m.nameFa}</span>
                      <span className="text-muted"> — {m.evidenceFa}</span>
                    </li>
                  ))}
                </ul>
              )}
              {team && team.rounds.length > 0 ? (
                <TableWrap>{game.mode === "funnel" ? <FunnelRounds rounds={team.rounds} /> : <ClassicRounds rounds={team.rounds} />}</TableWrap>
              ) : (
                <p className="text-sm text-muted">تصمیم‌های دور‌به‌دور این تیم ذخیره نشده است (بازی قدیمی‌تر از آرشیو تصمیم‌ها).</p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
