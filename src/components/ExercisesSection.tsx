import Link from "next/link";
import { CHAPTER_EXERCISES } from "@/lib/content";

export function ExercisesSection() {
  return (
    <section id="exercises" className="bg-primary-soft/40 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-2xl font-black text-primary sm:text-3xl">بوم‌های تمرین پایان فصل</h2>
        <p className="mt-2 max-w-2xl text-ink-soft">
          برای هر بخش کتاب یک بوم تمرین طراحی شده تا سازمان شما گلوگاه‌های خودش را پیدا کند — آنلاین پر می‌کنید و
          خروجی را به‌صورت PDF دانلود می‌کنید.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTER_EXERCISES.map((ex) =>
            ex.available && ex.href ? (
              <Link
                key={ex.title}
                href={ex.href}
                className="card-lift flex flex-col justify-between rounded-2xl border border-gold bg-white p-5 elev-1"
              >
                <div>
                  <div className="text-xs font-bold text-gold-dark">{ex.chapterLabel}</div>
                  <div className="mt-1 font-bold text-primary">{ex.title}</div>
                </div>
                <span className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-center text-xs font-bold text-white">
                  شروع بوم
                </span>
              </Link>
            ) : (
              <div
                key={ex.title}
                className="flex flex-col justify-between rounded-2xl border border-border bg-white/60 p-5 opacity-70"
              >
                <div>
                  <div className="text-xs font-bold text-muted">{ex.chapterLabel}</div>
                  <div className="mt-1 font-bold text-ink-soft">{ex.title}</div>
                </div>
                <span className="badge-soon mt-4 self-start">به‌زودی</span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
