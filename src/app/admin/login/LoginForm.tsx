"use client";

import { useActionState } from "react";
import { btnPrimary, input } from "@/components/admin/ui";
import { loginAction, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-4" autoComplete="on">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold text-ink-soft">
          ایمیل
        </label>
        <input id="email" name="email" type="email" required dir="ltr" autoComplete="username" className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-ink-soft">
          رمز عبور
        </label>
        <input id="password" name="password" type="password" required dir="ltr" autoComplete="current-password" className={input} />
      </div>
      {state.error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-full`}>
        {pending ? "در حال بررسی…" : "ورود"}
      </button>
    </form>
  );
}
