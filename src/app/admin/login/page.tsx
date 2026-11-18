import { LoginForm } from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10">
      <div className="w-full rounded-3xl border border-border bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl text-gold" aria-hidden>
            ♛
          </div>
          <h1 className="text-xl font-extrabold text-primary-dark">ورود به داشبورد سلطان قیف</h1>
          <p className="mt-1 text-sm text-muted">فقط برای مدیر سایت</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
