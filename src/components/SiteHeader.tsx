import Link from "next/link";
import { BRAND } from "@/lib/content";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
            ف
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base">{BRAND.name}</span>
            <span className="text-[11px] font-medium text-muted">Funnel King</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-ink-soft md:flex">
          <a href="#why" className="transition hover:text-primary">چرا این کتاب</a>
          <a href="#toc" className="transition hover:text-primary">فهرست کتاب</a>
          <a href="#author" className="transition hover:text-primary">نویسنده</a>
          <a href="#faq" className="transition hover:text-primary">پرسش‌های رایج</a>
        </nav>

        <a
          href="#buy"
          className="rounded-full bg-gold px-4 py-2 text-sm font-bold text-primary-deep transition hover:brightness-95"
        >
          خرید کتاب
        </a>
      </div>
    </header>
  );
}
