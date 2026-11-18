"use client";

import { useActionState, useState } from "react";
import { Badge, btn, btnPrimary, input } from "@/components/admin/ui";
import { issueLicenseAction, type IssueState } from "./actions";

const GIFT_PRESETS = [
  { label: "برنده‌ی ایونت", text: "بابت برنده شدن در ایونت فانل کینگ بهت تبریک می‌گم." },
  { label: "هدیه", text: "این نسخه رو به‌عنوان هدیه برات فرستادم، امیدوارم کمکت کنه." },
];

export function IssueLicenseForm({ defaults }: { defaults?: { name?: string; phone?: string } }) {
  const [state, action, pending] = useActionState<IssueState, FormData>(issueLicenseAction, {});
  const [gift, setGift] = useState("");
  const order = state.order;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <form action={action} className="space-y-4 rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-semibold text-ink-soft">
              نام دارنده
            </label>
            <input id="name" name="name" required minLength={2} maxLength={80} defaultValue={defaults?.name} className={input} />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-semibold text-ink-soft">
              شماره موبایل
            </label>
            <input id="phone" name="phone" required dir="ltr" inputMode="tel" defaultValue={defaults?.phone} placeholder="09121234567" className={`${input} text-right`} />
          </div>
        </div>
        <div>
          <label htmlFor="giftMessage" className="mb-1 block text-sm font-semibold text-ink-soft">
            جمله‌ی اول دست‌نوشته‌ی میلاد <span className="font-normal text-muted">(اختیاری)</span>
          </label>
          <textarea
            id="giftMessage"
            name="giftMessage"
            rows={2}
            maxLength={220}
            value={gift}
            onChange={(e) => setGift(e.target.value)}
            placeholder="خالی = «بابت این تصمیم بهت تبریک می‌گم.»"
            className={input}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {GIFT_PRESETS.map((p) => (
              <button key={p.label} type="button" className={btn} onClick={() => setGift(p.text)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="adminNote" className="mb-1 block text-sm font-semibold text-ink-soft">
            یادداشت داخلی <span className="font-normal text-muted">(اختیاری، به دارنده نشان داده نمی‌شود)</span>
          </label>
          <input id="adminNote" name="adminNote" maxLength={500} placeholder="مثلاً: برنده‌ی دهمین ایونت، دانشگاه علامه" className={input} />
        </div>
        {state.error && (
          <p role="alert" className="rounded-lg bg-danger-soft p-2.5 text-sm text-danger">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "در حال ساخت نسخه… (حدود نیم دقیقه)" : "ساخت لایسنس و درج در کتاب"}
        </button>
        <p className="text-xs text-muted">نام، شماره‌ی ماسک‌شده و کد مجوز به‌طور خودکار داخل صفحه‌ی مجوز و پاورقی همه‌ی صفحه‌های PDF و EPUB درج می‌شود.</p>
      </form>

      <div aria-live="polite">
        {order ? (
          <div className="space-y-3 rounded-2xl border border-gold/50 bg-accent-soft p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-primary-dark">لایسنس ساخته شد</h2>
              {order.ebook?.issued ? <Badge tone="ok">فایل‌ها آماده‌اند</Badge> : order.ebook?.error ? <Badge tone="bad">خطا در ساخت</Badge> : <Badge tone="info">در حال ساخت…</Badge>}
            </div>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">دارنده</dt>
                <dd className="font-semibold">{order.buyerName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">شماره سفارش</dt>
                <dd>{order.orderNo}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">کد مجوز</dt>
                <dd>
                  <code dir="ltr" className="select-all rounded bg-white px-2 py-0.5 text-xs">
                    {order.licenseCode}
                  </code>
                </dd>
              </div>
            </dl>
            {order.ebook?.error && !order.ebook.issued && <p className="text-xs text-danger">{order.ebook.error}</p>}
            <div className="flex flex-wrap gap-2">
              <a className={btnPrimary} href={`/admin/files/${order.id}/pdf`}>
                دانلود PDF
              </a>
              <a className={btn} href={`/admin/files/${order.id}/epub`}>
                دانلود EPUB
              </a>
            </div>
            <p className="text-xs text-muted">فایل را برای دارنده بفرستید. اصالت نسخه در صفحه‌ی «استعلام» سایت با شماره سفارش، موبایل و کد مجوز قابل بررسی است.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-white/60 p-6 text-center text-sm text-muted">
            بعد از ساخت، کد مجوز و لینک دانلود فایل‌ها همین‌جا نمایش داده می‌شود.
          </div>
        )}
      </div>
    </div>
  );
}
