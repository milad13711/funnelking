import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { bookApi, type Overview } from "@/lib/admin/api";
import { safe } from "@/lib/admin/safe";
import { requireAdmin } from "@/lib/admin/session";
import { logoutAction } from "../login/actions";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const email = await requireAdmin();
  const overview = await safe(bookApi<Overview>("/overview"));
  const pending = overview.ok ? overview.data.pendingPayments : 0;
  return (
    <div className="lg:flex">
      <aside className="bg-primary-deep p-3 text-white lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 lg:mb-6 lg:block">
          <div>
            <div className="text-base font-extrabold text-gold-light">♛ سلطان قیف</div>
            <div className="text-xs text-white/60">داشبورد مدیریت</div>
          </div>
          <form action={logoutAction} className="lg:mt-4">
            <button type="submit" className="rounded-lg border border-white/25 px-3 py-1 text-xs text-white/80 hover:bg-white/10">
              خروج
            </button>
          </form>
        </div>
        <AdminNav pending={pending} />
        <div dir="ltr" className="mt-4 hidden truncate text-[11px] text-white/45 lg:block" title={email}>
          {email}
        </div>
      </aside>
      <main id="admin-main" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
