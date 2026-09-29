import { BRAND } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-primary-soft/40 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 text-sm text-ink-soft sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <div className="mb-2 font-bold text-primary">{BRAND.name} — Funnel King</div>
          <p className="text-muted">{BRAND.tagline}</p>
          <p className="mt-3 text-xs text-muted">
            تألیف: {BRAND.author} · با همکاری: {BRAND.collaborators}
          </p>
        </div>

        <div>
          <div className="mb-2 font-bold text-primary">لینک‌های مرتبط</div>
          <ul className="space-y-1">
            <li>
              <a href="#buy" className="hover:text-primary">خرید کتاب</a>
            </li>
            <li>
              <a href="#faq" className="hover:text-primary">پرسش‌های رایج</a>
            </li>
            <li>
              <a href="https://thisismbahrami.ir" className="hover:text-primary">
                درباره‌ی نویسنده
              </a>
            </li>
          </ul>
        </div>

        <div className="text-xs text-muted">
          <p>ISBN {BRAND.isbn}</p>
          <p className="mt-1">© {BRAND.year} تمامی حقوق برای {BRAND.name} محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
}
