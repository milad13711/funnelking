"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "نمای کلی", exact: true },
  { href: "/admin/payments", label: "پرداخت‌ها", badge: true },
  { href: "/admin/buyers", label: "خریداران و نسخه‌ها" },
  { href: "/admin/licenses", label: "ساخت لایسنس" },
  { href: "/admin/users", label: "کاربران سایت" },
  { href: "/admin/games", label: "آرشیو بازی‌ها" },
  { href: "/admin/settings", label: "تنظیمات فروش" },
];

export function AdminNav({ pending = 0 }: { pending?: number }) {
  const path = usePathname();
  return (
    <nav aria-label="منوی مدیریت" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((item) => {
        const active = item.exact ? path === item.href : path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
              active ? "bg-gold text-primary-deep" : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
            {"badge" in item && item.badge && pending > 0 && (
              <span className="ms-2 inline-block min-w-5 rounded-full bg-danger px-1.5 text-center text-[11px] font-bold text-white">{pending.toLocaleString("fa-IR")}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
