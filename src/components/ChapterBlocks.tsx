import type { ChapterBlock } from "@/lib/chapter-one";

const COMPANY_MENTION = "اکسیر تجارت امین";

function Linkified({ text }: { text: string }) {
  const idx = text.indexOf(COMPANY_MENTION);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <a
        href="https://eta.co.ir"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-primary underline decoration-gold decoration-2 underline-offset-4 hover:text-gold-dark"
      >
        {COMPANY_MENTION}
      </a>
      <Linkified text={text.slice(idx + COMPANY_MENTION.length)} />
    </>
  );
}

export function ChapterBlocks({ blocks }: { blocks: ChapterBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="!mt-10 border-b-2 border-gold pb-2 text-xl font-black text-primary sm:text-2xl">
                <Linkified text={block.text} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="!mt-6 text-base font-bold text-primary sm:text-lg">
                <Linkified text={block.text} />
              </h3>
            );
          case "p":
            return (
              <p key={i} className="text-sm leading-8 text-ink-soft sm:text-base">
                <Linkified text={block.text} />
              </p>
            );
          case "list":
            return (
              <ul key={i} className="space-y-2 rounded-2xl border border-border bg-primary-soft/40 p-4 sm:p-5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm leading-7 text-ink-soft sm:text-base">
                    <span className="mt-1 text-gold-dark">•</span>
                    <span>
                      <Linkified text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            );
          case "signature":
            return (
              <div key={i} className="!mt-6 border-r-4 border-gold pr-4 text-sm text-ink-soft">
                {block.lines.map((line, j) => (
                  <p key={j} className={j === 0 ? "font-bold text-primary" : "text-muted"}>
                    <Linkified text={line} />
                  </p>
                ))}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
