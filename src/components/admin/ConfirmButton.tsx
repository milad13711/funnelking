"use client";

import type { ReactNode } from "react";

/** دکمه‌ی submit که پیش از ارسال فرم تأیید می‌گیرد (برای کارهای حساس مثل لغو دسترسی). */
export function ConfirmButton({ message, className, children }: { message: string; className?: string; children: ReactNode }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
