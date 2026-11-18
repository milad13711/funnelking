import Link from "next/link";
import { Badge, ErrorBox, Notice, PageTitle, TableWrap, btnPrimary, input, td, th } from "@/components/admin/ui";
import { bookApi, type SiteUser } from "@/lib/admin/api";
import { FORMAT_SHORT, fmtDate, fmtNumber, fmtToman } from "@/lib/admin/format";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; ok?: string; err?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const users = await safe(bookApi<SiteUser[]>(`/users${q ? `?q=${encodeURIComponent(q)}` : ""}`));

  return (
    <>
      <PageTitle title="کاربران سایت" hint="سایت حساب کاربری ندارد؛ هر کاربر یک شماره‌ی موبایل تأییدشده با OTP است که خرید کرده یا نسخه‌ی هدیه گرفته" />
      {sp.ok && <Notice>{sp.ok}</Notice>}
      {sp.err && <div className="mb-4"><ErrorBox>{sp.err}</ErrorBox></div>}
      <form className="mb-4 flex max-w-xl gap-2" role="search">
        <input name="q" defaultValue={q} className={input} placeholder="جستجو: نام یا شماره موبایل" aria-label="جستجوی کاربر" />
        <button type="submit" className={btnPrimary}>
          جستجو
        </button>
      </form>

      {!users.ok ? (
        <ErrorBox>{users.error}</ErrorBox>
      ) : users.data.length === 0 ? (
        <p className="text-sm text-muted">کاربری پیدا نشد.</p>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted">{fmtNumber(users.data.length)} کاربر</p>
          <TableWrap>
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className={th}>نام</th>
                  <th className={th}>موبایل</th>
                  <th className={th}>نسخه‌ها</th>
                  <th className={th}>جمع خرید</th>
                  <th className={th}>اولین / آخرین سفارش</th>
                  <th className={th}>وضعیت</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {users.data.map((u) => (
                  <tr key={u.phone}>
                    <td className={`${td} font-semibold`}>{u.name}</td>
                    <td className={td}>
                      <span dir="ltr">{u.phone}</span>
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1">
                        {u.formats.map((f) => (
                          <Badge key={f}>{FORMAT_SHORT[f]}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className={td}>{fmtToman(u.totalToman)}</td>
                    <td className={`${td} whitespace-nowrap text-xs text-muted`}>
                      {fmtDate(u.firstOrderAt)} / {fmtDate(u.lastOrderAt)}
                    </td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1">
                        {u.hasManual && <Badge tone="gold">هدیه / دستی</Badge>}
                        {u.revokedCopies > 0 && <Badge tone="bad">{fmtNumber(u.revokedCopies)} نسخه لغوشده</Badge>}
                      </div>
                    </td>
                    <td className={td}>
                      <Link href={`/admin/users/${encodeURIComponent(u.phone)}`} className="text-xs font-semibold text-primary underline">
                        مدیریت
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        </>
      )}
    </>
  );
}
