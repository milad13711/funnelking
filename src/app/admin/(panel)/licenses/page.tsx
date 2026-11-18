import { ErrorBox, PageTitle } from "@/components/admin/ui";
import { OrderTable } from "@/components/admin/OrderTable";
import { bookApi, type OrderRow } from "@/lib/admin/api";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";
import { IssueLicenseForm } from "./IssueLicenseForm";

export const dynamic = "force-dynamic";

export default async function LicensesPage({ searchParams }: { searchParams: Promise<{ name?: string; phone?: string; ok?: string; err?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const recent = await safe(bookApi<OrderRow[]>("/orders?format=EBOOK&state=paid&take=300"));

  return (
    <>
      <PageTitle title="ساخت لایسنس" hint="برای هدیه، برنده‌ی ایونت یا جایگزین نسخه‌ی گم‌شده؛ خریدهای سایت خودکار مجوز می‌گیرند" />
      <IssueLicenseForm defaults={{ name: sp.name?.slice(0, 80), phone: sp.phone?.slice(0, 20) }} />

      <h2 className="mb-3 mt-8 text-base font-bold text-primary-dark">لایسنس‌های دستی ساخته‌شده</h2>
      {sp.ok && <p className="mb-3 text-sm text-success">{sp.ok}</p>}
      {sp.err && <div className="mb-3"><ErrorBox>{sp.err}</ErrorBox></div>}
      {!recent.ok ? <ErrorBox>{recent.error}</ErrorBox> : <OrderTable orders={recent.data.filter((o) => o.isManual)} back="/admin/licenses" />}
    </>
  );
}
