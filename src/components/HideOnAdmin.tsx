"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** هدر و فوتر سایت فروش در صفحه‌های داشبورد (/admin) نمایش داده نمی‌شوند. */
export function HideOnAdmin({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path === "/admin" || path.startsWith("/admin/")) return null;
  return <>{children}</>;
}
