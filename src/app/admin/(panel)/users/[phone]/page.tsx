import Link from "next/link";
import { notFound } from "next/navigation";
import { restoreUserAction, revokeUserAction } from "../../buyers/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { OrderTable } from "@/components/admin/OrderTable";
import { Card, ErrorBox, Notice, PageTitle, Stat, btn, btnDanger } from "@/components/admin/ui";
import { bookApi, type OrderRow } from "@/lib/admin/api";
import { fmtNumber, fmtToman } from "@/lib/admin/format";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

const PHONE = /^(\+?98|0)?9\d{9}$/;

export default async function UserDetailPage({ params, searchParams }: { params: Promise<{ phone: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const { phone: raw } = await params;
  const phone = decodeURIComponent(raw);
  if (!PHONE.test(phone)) notFound();
  const sp = await searchParams;
  const orders = await safe(bookApi<OrderRow[]>(`/users/${encodeURIComponent(phone)}/orders`));
  if (orders.ok && orders.data.length === 0) notFound();

  const list = orders.ok ? orders.data : [];
  const paid = list.filter((o) => o.paidAt);
  const name = list[0]?.buyerName ?? "";
  const ebooks = paid.filter((o) => o.format === "EBOOK");
  const anyActive = ebooks.some((o) => !o.revokedAt);
  const anyRevoked = ebooks.some((o) => o.revokedAt);
  const back = `/admin/users/${encodeURIComponent(phone)}`;

  return (
    <>
      <PageTitle title={name || "کاربر"} hint={phone}>
        <Link href="/admin/users" className={btn}>
          ← همه‌ی کاربران
        </Link>
      </PageTitle>
      {sp.ok && <Notice>{sp.ok}</Notice>}
      {sp.err && <div className="mb-4"><ErrorBox>{sp.err}</ErrorBox></div>}
      {!orders.ok ? (
        <ErrorBox>{orders.error}</ErrorBox>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="سفارش‌های پرداخت‌شده" value={fmtNumber(paid.length)} />
            <Stat label="جمع خرید" value={fmtToman(paid.filter((o) => !o.isManual).reduce((s, o) => s + o.unitPrice, 0))} />
            <Stat label="نسخه‌های الکترونیکی" value={fmtNumber(ebooks.length)} />
            <Stat label="لغوشده" value={fmtNumber(ebooks.filter((o) => o.revokedAt).length)} tone={anyRevoked ? "warn" : "default"} />
          </div>

          <Card title="مدیریت دسترسی" className="mb-5">
            <p className="mb-3 text-sm text-muted">
              لغو دسترسی یعنی لینک‌های دانلود، «کتابخانه‌ی من» و استعلام اصالت همه‌ی نسخه‌های الکترونیکی این شماره از کار می‌افتد. فایل‌هایی که قبلاً دانلود شده را نمی‌شود پس گرفت.
            </p>
            <div className="flex flex-wrap gap-2">
              {anyActive && (
                <form action={revokeUserAction}>
                  <input type="hidden" name="phone" value={phone} />
                  <input type="hidden" name="back" value={back} />
                  <ConfirmButton className={btnDanger} message="دسترسی همه‌ی نسخه‌های الکترونیکی این کاربر لغو شود؟">
                    لغو دسترسی همه‌ی نسخه‌ها
                  </ConfirmButton>
                </form>
              )}
              {anyRevoked && (
                <form action={restoreUserAction}>
                  <input type="hidden" name="phone" value={phone} />
                  <input type="hidden" name="back" value={back} />
                  <button type="submit" className={btn}>
                    بازگردانی دسترسی‌ها
                  </button>
                </form>
              )}
              <Link href={`/admin/licenses?${new URLSearchParams({ name, phone })}`} className={btn}>
                ساخت لایسنس جدید برای این کاربر
              </Link>
            </div>
          </Card>

          <h2 className="mb-3 text-base font-bold text-primary-dark">سفارش‌ها</h2>
          <OrderTable orders={orders.data} back={back} />
        </>
      )}
    </>
  );
}
