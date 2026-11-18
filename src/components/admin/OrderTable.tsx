import { noteAction, reissueAction, restoreAction, resendSmsAction, revokeAction } from "@/app/admin/(panel)/buyers/actions";
import type { OrderRow } from "@/lib/admin/api";
import { FORMAT_SHORT, fmtDateTime, fmtNumber } from "@/lib/admin/format";
import { ConfirmButton } from "./ConfirmButton";
import { Badge, TableWrap, btn, btnDanger, input, td, th } from "./ui";

function StatusBadges({ o }: { o: OrderRow }) {
  const badges: React.ReactNode[] = [];
  if (!o.paidAt) {
    if (o.status === "AWAITING_CONFIRMATION") badges.push(<Badge key="p" tone="warn">منتظر تأیید شما</Badge>);
    else if (o.status === "CANCELLED") badges.push(<Badge key="p" tone="bad">{o.rejectedReason ? "ردشده" : "لغوشده"}</Badge>);
    else badges.push(<Badge key="p" tone="info">منتظر واریز</Badge>);
  }
  if (o.isManual) badges.push(<Badge key="m" tone="gold">هدیه / دستی</Badge>);
  if (o.revokedAt) badges.push(<Badge key="r" tone="bad">لغوشده</Badge>);
  if (o.format === "EBOOK" && o.paidAt && !o.revokedAt) {
    if (o.ebook?.issuing) badges.push(<Badge key="i" tone="info">در حال ساخت…</Badge>);
    else if (o.ebook?.issued) badges.push(<Badge key="ok" tone="ok">آماده</Badge>);
    else if (o.ebook?.error) badges.push(<Badge key="e" tone="bad">خطا در ساخت</Badge>);
    else badges.push(<Badge key="w" tone="info">هنوز ساخته نشده</Badge>);
  }
  if (o.format === "PRINT" && o.paidAt) badges.push(<Badge key="s" tone="info">{o.status === "SHIPPED" ? "ارسال‌شده" : "برای ارسال"}</Badge>);
  return <div className="flex flex-wrap gap-1">{badges}</div>;
}

function Hidden({ id, back }: { id: string; back: string }) {
  return (
    <>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="back" value={back} />
    </>
  );
}

/** جدول سفارش‌ها با اکشن‌های مجوز؛ `back` همان صفحه‌ای است که بعد از اکشن به آن برمی‌گردیم. */
export function OrderTable({ orders, back }: { orders: OrderRow[]; back: string }) {
  if (orders.length === 0) return <p className="rounded-2xl border border-border bg-white p-6 text-center text-sm text-muted">موردی پیدا نشد.</p>;
  return (
    <TableWrap>
      <table className="w-full min-w-[980px]">
        <thead>
          <tr>
            <th className={th}>سفارش</th>
            <th className={th}>خریدار</th>
            <th className={th}>نسخه</th>
            <th className={th}>مبلغ</th>
            <th className={th}>تاریخ</th>
            <th className={th}>کد مجوز</th>
            <th className={th}>وضعیت</th>
            <th className={th}>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const ebookReady = o.format === "EBOOK" && !!o.paidAt;
            return (
              <tr key={o.id} className={o.revokedAt ? "bg-danger-soft/40" : undefined}>
                <td className={td}>{fmtNumber(o.orderNo)}</td>
                <td className={td}>
                  <div className="font-semibold">{o.buyerName}</div>
                  <div dir="ltr" className="text-right text-xs text-muted">
                    {o.buyerPhone}
                  </div>
                </td>
                <td className={td}>{FORMAT_SHORT[o.format]}</td>
                <td className={td}>{o.isManual ? "رایگان" : `${fmtNumber(o.unitPrice)} تومان`}</td>
                <td className={`${td} whitespace-nowrap`}>{fmtDateTime(o.paidAt ?? o.createdAt)}</td>
                <td className={td}>
                  {o.licenseCode ? (
                    <code dir="ltr" className="select-all whitespace-nowrap rounded bg-primary-soft px-1.5 py-0.5 text-xs">
                      {o.licenseCode}
                    </code>
                  ) : (
                    "—"
                  )}
                </td>
                <td className={td}>
                  <StatusBadges o={o} />
                  {o.ebook?.error && !o.ebook.issued && <div className="mt-1 max-w-48 text-[11px] text-danger">{o.ebook.error}</div>}
                </td>
                <td className={td}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {ebookReady && (
                      <>
                        <a className={btn} href={`/admin/files/${o.id}/pdf`}>
                          PDF
                        </a>
                        <a className={btn} href={`/admin/files/${o.id}/epub`}>
                          EPUB
                        </a>
                        <form action={resendSmsAction}>
                          <Hidden id={o.id} back={back} />
                          <ConfirmButton className={btn} message={`پیامک لینک دانلود دوباره برای ${o.buyerPhone} ارسال شود؟`}>
                            ارسال مجدد پیامک
                          </ConfirmButton>
                        </form>
                        <form action={reissueAction}>
                          <Hidden id={o.id} back={back} />
                          <ConfirmButton className={btn} message="فایل‌های این نسخه پاک و دوباره مهر شوند؟ کد مجوز تغییر نمی‌کند.">
                            ساخت دوباره
                          </ConfirmButton>
                        </form>
                        <form action={o.revokedAt ? restoreAction : revokeAction}>
                          <Hidden id={o.id} back={back} />
                          {o.revokedAt ? (
                            <button type="submit" className={btn}>
                              بازگردانی
                            </button>
                          ) : (
                            <ConfirmButton className={btnDanger} message="دسترسی این نسخه لغو شود؟ لینک دانلود و استعلام اصالت آن از کار می‌افتد.">
                              لغو دسترسی
                            </ConfirmButton>
                          )}
                        </form>
                      </>
                    )}
                    <details className="w-full">
                      <summary className="cursor-pointer text-xs text-primary underline">{o.adminNote ? "یادداشت: " + o.adminNote.slice(0, 24) : "یادداشت"}</summary>
                      <form action={noteAction} className="mt-1.5 flex gap-1.5">
                        <Hidden id={o.id} back={back} />
                        <input name="note" defaultValue={o.adminNote ?? ""} maxLength={500} className={input} aria-label="یادداشت داخلی" placeholder="فقط برای شما، به خریدار نشان داده نمی‌شود" />
                        <button type="submit" className={btn}>
                          ذخیره
                        </button>
                      </form>
                    </details>
                    {o.giftMessage && <div className="w-full text-[11px] text-muted">متن تبریک: {o.giftMessage}</div>}
                    {(o.payerCardLast4 || o.trackingCode) && (
                      <div className="w-full text-[11px] text-muted">
                        {o.payerCardLast4 && <>کارت واریزکننده: <span dir="ltr">••••{o.payerCardLast4}</span> </>}
                        {o.trackingCode && <>· پیگیری: <span dir="ltr">{o.trackingCode}</span></>}
                      </div>
                    )}
                    {o.rejectedReason && <div className="w-full text-[11px] text-danger">دلیل رد: {o.rejectedReason}</div>}
                    {o.downloadSmsAt && <div className="w-full text-[11px] text-muted">پیامک لینک: {fmtDateTime(o.downloadSmsAt)}</div>}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrap>
  );
}
