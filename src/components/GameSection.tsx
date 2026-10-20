import { GAME_INFO } from "@/lib/content";

export function GameSection() {
  return (
    <section id="game" className="hero-band">
      <div className="bg-dots absolute inset-0 opacity-10" />
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <span className="badge-soon">زنده و قابل‌بازی</span>
        <h2 className="mt-4 text-2xl font-black sm:text-3xl">{GAME_INFO.title}</h2>
        <p className="mt-4 text-sm leading-8 text-white/80 sm:text-base">{GAME_INFO.description}</p>
        <a
          href="https://game.funnelking.ir"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-gold px-8 py-3 text-sm font-bold text-primary-deep transition hover:bg-gold-light"
        >
          ورود به بازی آنلاین ↗
        </a>
      </div>
    </section>
  );
}
