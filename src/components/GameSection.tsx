import { GAME_INFO } from "@/lib/content";

export function GameSection() {
  return (
    <section id="game" className="hero-band">
      <div className="bg-dots absolute inset-0 opacity-10" />
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <span className="badge-soon">به‌زودی</span>
        <h2 className="mt-4 text-2xl font-black sm:text-3xl">{GAME_INFO.title}</h2>
        <p className="mt-4 text-sm leading-8 text-white/80 sm:text-base">{GAME_INFO.description}</p>
      </div>
    </section>
  );
}
