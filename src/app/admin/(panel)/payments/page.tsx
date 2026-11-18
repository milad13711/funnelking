import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Badge, Card, ErrorBox, Notice, PageTitle, btnDanger, btnPrimary, input } from "@/components/admin/ui";
import { bookApi, type OrderRow } from "@/lib/admin/api";
import { FORMAT_LABEL, fmtDateTime, fmtNumber, fmtToman } from "@/lib/admin/format";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";
import { confirmPaymentAction, rejectPaymentAction } from "./actions";

export const dynamic = "force-dynamic";

function PaymentCard({ o, unclaimed }: { o: OrderRow; unclaimed?: boolean }) {
  return (
    <Card className={unclaimed ? "border-dashed" : "border-gold/50"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-primary-dark">{o.buyerName}</h3>
            <Badge tone={unclaimed ? "info" : "warn"}>{unclaimed ? "هنوز «واریز کردم» نزده" : "منتظر تأیید"}</Badge>
            <Badge tone="gold">{FORMAT_LABEL[o.format]}</Badge>
          </div>
          <p dir="ltr" className="mt-1 text-right text-sm text-muted">
            {o.buyerPhone}
          </p>
        </div>
        <div className="text-left">
          <div className="text-lg font-extrabold text-primary-dark">{fmtToman(o.unitPrice)}</div>
          <div className="text-xs text-muted">سفارش {fmtNumber(o.orderNo)} · {fmtDateTime(o.claimedAt ?? o.createdAt)}</div>
        </div>
      </div>

      {(o.payerCardLast4 || o.trackingCode) && (
        <p className="mt-3 rounded-lg bg-primary-soft p-2.5 text-sm">
          {o.payerCardLast4 && (
            <span className="me-4">
              کارت واریزکننده: <b dir="ltr">••••{o.payerCardLast4}</b>
            </span>
          )}
          {o.trackingCode && (
            <span>
              شماره پیگیری: <b dir="ltr">{o.trackingCode}</b>
            </span>
          )}
        </p>
      )}

      <form action={confirmPaymentAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <input type="hidden" name="id" value={o.id} />
        <div>
          <label htmlFor={`n-${o.id}`} className="mb-1 block text-xs font-semibold text-ink-soft">
            نام (قابل اصلاح)
          </label>
          <input id={`n-${o.id}`} name="name" defaultValue={o.buyerName} required minLength={2} maxLength={80} className={input} />
        </div>
        <div>
          <label htmlFor={`p-${o.id}`} className="mb-1 block text-xs font-semibold text-ink-soft">
            موبایل (پیامک لینک به این شماره می‌رود)
          </label>
          <input id={`p-${o.id}`} name="phone" defaultValue={o.buyerPhone} required dir="ltr" inputMode="tel" className={`${input} text-right`} />
        </div>
        <ConfirmButton className={btnPrimary} message="واریز را در حساب بانکی دیده‌اید؟ با تأیید، نسخه‌ی اختصاصی ساخته و پیامک لینک دانلود برای خریدار ارسال می‌شود.">
          تأیید واریز و ارسال لینک
        </ConfirmButton>
      </form>

      <form action={rejectPaymentAction} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={o.id} />
        <input name="reason" maxLength={300} className={`${input} max-w-xs`} placeholder="دلیل رد (اختیاری، فقط برای شما)" aria-label="دلیل رد" />
        <ConfirmButton className={btnDanger} message="این درخواست رد شود؟ به خریدار پیامک داده می‌شود.">
          رد واریز
        </ConfirmButton>
      </form>
    </Card>
  );
}

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [queue, open] = await Promise.all([safe(bookApi<OrderRow[]>("/payments")), safe(bookApi<OrderRow[]>("/orders?state=pending&take=100"))]);
  const unclaimed = open.ok ? open.data.filter((o) => o.status === "PENDING_PAYMENT" && o.paymentMethod === "CARD") : [];

  return (
    <>
      <PageTitle title="پرداخت‌های کارت‌به‌کارت" hint="واریز را در حساب بانکی بررسی و تأیید کنید؛ بعد از تأیید، لینک دانلود برای خریدار پیامک می‌شود" />
      {sp.ok && <Notice>{sp.ok}</Notice>}
      {sp.err && <div className="mb-4"><ErrorBox>{sp.err}</ErrorBox></div>}

      <h2 className="mb-3 text-base font-bold text-primary-dark">منتظر تأیید شما</h2>
      {!queue.ok ? (
        <ErrorBox>{queue.error}</ErrorBox>
      ) : queue.data.length === 0 ? (
        <p className="mb-6 rounded-2xl border border-border bg-white p-6 text-center text-sm text-muted">درخواستی در صف نیست. وقتی کسی «واریز کردم» را بزند، پیامک می‌گیرید و اینجا می‌آید.</p>
      ) : (
        <div className="mb-6 space-y-4">
          {queue.data.map((o) => (
            <PaymentCard key={o.id} o={o} />
          ))}
        </div>
      )}

      {unclaimed.length > 0 && (
        <>
          <h2 className="mb-1 mt-8 text-base font-bold text-primary-dark">سفارش‌های باز (هنوز «واریز کردم» نزده‌اند)</h2>
          <p className="mb-3 text-xs text-muted">اگر خریداری واریز کرده ولی دکمه را نزده، از اینجا می‌توانید مستقیم تأیید کنید.</p>
          <div className="space-y-4">
            {unclaimed.map((o) => (
              <PaymentCard key={o.id} o={o} unclaimed />
            ))}
          </div>
        </>
      )}
    </>
  );
}
