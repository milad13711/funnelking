import { Badge, Card, ErrorBox, Notice, PageTitle, btn, btnPrimary, input } from "@/components/admin/ui";
import { bookApi, type BookSettings } from "@/lib/admin/api";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";
import { saveSettingsAction, testSmsAction } from "./actions";

export const dynamic = "force-dynamic";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const res = await safe(bookApi<BookSettings>("/settings"));

  return (
    <>
      <PageTitle title="تنظیمات فروش" hint="قیمت کتاب، حساب کارت‌به‌کارت و پیامک اطلاع‌رسانی؛ تغییر قیمت تا یک دقیقه در سایت اعمال می‌شود" />
      {sp.ok && <Notice>{sp.ok}</Notice>}
      {sp.err && <div className="mb-4"><ErrorBox>{sp.err}</ErrorBox></div>}
      {!res.ok ? (
        <ErrorBox>{res.error}</ErrorBox>
      ) : (
        <form action={saveSettingsAction} className="space-y-5">
          <Card title="قیمت نسخه‌ها (تومان)">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field id="ebookPriceToman" label="نسخه‌ی الکترونیکی">
                <input id="ebookPriceToman" name="ebookPriceToman" defaultValue={res.data.ebookPriceToman} inputMode="numeric" dir="ltr" className={`${input} text-right`} />
              </Field>
              <Field id="printPriceToman" label="نسخه‌ی چاپی">
                <input id="printPriceToman" name="printPriceToman" defaultValue={res.data.printPriceToman} inputMode="numeric" dir="ltr" className={`${input} text-right`} />
              </Field>
              <Field id="audioPriceToman" label="نسخه‌ی صوتی">
                <input id="audioPriceToman" name="audioPriceToman" defaultValue={res.data.audioPriceToman} inputMode="numeric" dir="ltr" className={`${input} text-right`} />
              </Field>
            </div>
          </Card>

          <Card title="روش پرداخت">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="paymentMethod" label="روش پرداخت سایت" hint="کارت‌به‌کارت: خریدار واریز می‌کند و شما تأیید می‌کنید. زرین‌پال: درگاه خودکار.">
                <select id="paymentMethod" name="paymentMethod" defaultValue={res.data.paymentMethod} className={input}>
                  <option value="CARD">کارت‌به‌کارت (تأیید دستی)</option>
                  <option value="ZARINPAL">درگاه زرین‌پال</option>
                </select>
              </Field>
              <Field id="payWindowMinutes" label="مهلت واریز (دقیقه)" hint="تایمر صفحه‌ی پرداخت؛ بعد از آن هم تا ۲۴ ساعت می‌شود «واریز کردم» زد.">
                <input id="payWindowMinutes" name="payWindowMinutes" defaultValue={res.data.payWindowMinutes} inputMode="numeric" dir="ltr" className={`${input} text-right`} />
              </Field>
              <Field id="cardNumber" label="شماره‌ی کارت مقصد (۱۶ رقم)">
                <input id="cardNumber" name="cardNumber" defaultValue={res.data.cardNumber} inputMode="numeric" dir="ltr" maxLength={25} className={`${input} text-right`} />
              </Field>
              <Field id="cardHolder" label="به نام">
                <input id="cardHolder" name="cardHolder" defaultValue={res.data.cardHolder} maxLength={60} className={input} />
              </Field>
              <Field id="cardBank" label="نام بانک" hint="خالی = از روی شماره‌ی کارت تشخیص داده می‌شود.">
                <input id="cardBank" name="cardBank" defaultValue={res.data.cardBank} maxLength={40} className={input} />
              </Field>
            </div>
          </Card>

          <Card title="پیامک اطلاع‌رسانی">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="notifyPhone" label="موبایل شما برای اطلاع از درخواست‌ها" hint="با هر «واریز کردم» روی این شماره پیامک می‌آید.">
                <input id="notifyPhone" name="notifyPhone" defaultValue={res.data.notifyPhone} inputMode="tel" dir="ltr" placeholder="09123456789" className={`${input} text-right`} />
              </Field>
              <div className="text-sm">
                <p className="mb-1 font-semibold text-ink-soft">پنل پیامکی (لیمو پیامک)</p>
                {res.data.smsDedicatedConfigured ? <Badge tone="ok">اتصال اختصاصی فعال است</Badge> : <Badge tone="warn">اتصال اختصاصی تنظیم نشده (از پنل پیامکی ERP استفاده می‌شود)</Badge>}
              </div>
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={btnPrimary}>
              ذخیره‌ی تنظیمات
            </button>
            <button type="submit" formAction={testSmsAction} formNoValidate className={btn}>
              ارسال پیامک آزمایشی (به موبایل ذخیره‌شده)
            </button>
          </div>
        </form>
      )}
    </>
  );
}
