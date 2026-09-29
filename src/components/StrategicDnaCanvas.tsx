"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const FUNNEL_STAGES = [
  { key: "awareness", label: "آگاهی" },
  { key: "interest", label: "علاقه" },
  { key: "consideration", label: "بررسی" },
  { key: "decision", label: "تصمیم" },
  { key: "purchase", label: "خرید" },
  { key: "loyalty", label: "وفاداری" },
] as const;

type FunnelStageKey = (typeof FUNNEL_STAGES)[number]["key"];

interface CanvasState {
  orgName: string;
  vision: string;
  advantage: string;
  targetCustomer: string;
  funnelBottlenecks: Record<FunnelStageKey, string>;
  bottlenecks: [string, string, string];
  resources: { budget: string; team: string; time: string };
  decision: string;
  nextAction: string;
}

const EMPTY_STATE: CanvasState = {
  orgName: "",
  vision: "",
  advantage: "",
  targetCustomer: "",
  funnelBottlenecks: { awareness: "", interest: "", consideration: "", decision: "", purchase: "", loyalty: "" },
  bottlenecks: ["", "", ""],
  resources: { budget: "", team: "", time: "" },
  decision: "",
  nextAction: "",
};

function Field({
  label,
  hint,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-bold text-primary">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-muted">{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

export function StrategicDnaCanvas() {
  const [state, setState] = useState<CanvasState>(EMPTY_STATE);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  function update<K extends keyof CanvasState>(key: K, value: CanvasState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  async function downloadPdf() {
    if (!printRef.current) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);
      const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`boom-strategic-dna-${state.orgName || "sazman"}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  const filledCount =
    [state.vision, state.advantage, state.targetCustomer, state.decision, state.nextAction].filter(Boolean).length +
    Object.values(state.funnelBottlenecks).filter(Boolean).length +
    state.bottlenecks.filter(Boolean).length +
    Object.values(state.resources).filter(Boolean).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-white p-5 elev-1 sm:p-7">
          <label className="mb-1 block text-sm font-bold text-primary">نام سازمان / کسب‌وکار</label>
          <input
            value={state.orgName}
            onChange={(e) => update("orgName", e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="مثلاً فروشگاه اینترنتی ..."
          />
        </div>

        <div className="rounded-3xl border border-border bg-white p-5 elev-1 sm:p-7">
          <h3 className="mb-4 font-bold text-primary">۱. DNA استراتژیک</h3>
          <div className="space-y-4">
            <Field label="چشم‌انداز سه‌ساله" hint="۳ سال دیگر کجا می‌خواهید باشید؟" value={state.vision} onChange={(v) => update("vision", v)} />
            <Field
              label="مزیت رقابتی اصلی"
              hint="چرا مشتری باید شما را انتخاب کند، نه رقبا را؟"
              value={state.advantage}
              onChange={(v) => update("advantage", v)}
            />
            <Field
              label="مشتری هدف"
              hint="دقیقاً مشتری ایده‌آل شما کیست؟"
              value={state.targetCustomer}
              onChange={(v) => update("targetCustomer", v)}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-5 elev-1 sm:p-7">
          <h3 className="mb-1 font-bold text-primary">۲. گلوگاه هر مرحله از قیف فروش</h3>
          <p className="mb-4 text-xs text-muted">در هر مرحله، بزرگ‌ترین ریزش یا مشکل را بنویسید.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FUNNEL_STAGES.map((stage) => (
              <Field
                key={stage.key}
                label={stage.label}
                rows={2}
                value={state.funnelBottlenecks[stage.key]}
                onChange={(v) => update("funnelBottlenecks", { ...state.funnelBottlenecks, [stage.key]: v })}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-5 elev-1 sm:p-7">
          <h3 className="mb-4 font-bold text-primary">۳. سه گلوگاه اصلی فروش شما</h3>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Field
                key={i}
                label={`گلوگاه ${["اول", "دوم", "سوم"][i]}`}
                rows={1}
                value={state.bottlenecks[i]}
                onChange={(v) => {
                  const next = [...state.bottlenecks] as [string, string, string];
                  next[i] = v;
                  update("bottlenecks", next);
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-5 elev-1 sm:p-7">
          <h3 className="mb-4 font-bold text-primary">۴. منابع محدود در دسترس</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="بودجه" rows={2} value={state.resources.budget} onChange={(v) => update("resources", { ...state.resources, budget: v })} />
            <Field label="تیم" rows={2} value={state.resources.team} onChange={(v) => update("resources", { ...state.resources, team: v })} />
            <Field label="زمان" rows={2} value={state.resources.time} onChange={(v) => update("resources", { ...state.resources, time: v })} />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-5 elev-1 sm:p-7">
          <h3 className="mb-4 font-bold text-primary">۵. تصمیم و گام اجرایی</h3>
          <div className="space-y-4">
            <Field
              label="تصمیم استراتژیک کلیدی"
              hint="با این محدودیت‌ها و گلوگاه‌ها، چه تصمیمی می‌گیرید؟"
              value={state.decision}
              onChange={(v) => update("decision", v)}
            />
            <Field label="گام اجرایی بعدی" hint="اولین قدم عملی همین هفته چیست؟" rows={2} value={state.nextAction} onChange={(v) => update("nextAction", v)} />
          </div>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-gold bg-primary-soft/60 p-6 text-center elev-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-deep mx-auto">
            <Image src="/logo-mark.png" alt="" width={30} height={47} className="h-8 w-auto" />
          </div>
          <p className="mt-3 text-sm text-ink-soft">{filledCount} فیلد از این بوم تکمیل شده</p>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={exporting}
            className="mt-4 w-full rounded-xl bg-gold py-3 text-sm font-bold text-primary-deep transition hover:brightness-95 disabled:opacity-60"
          >
            {exporting ? "در حال ساخت PDF…" : "دانلود PDF بوم"}
          </button>
          <p className="mt-3 text-[11px] text-muted">این بوم فقط روی مرورگر شما ذخیره می‌شود و به سروری ارسال نمی‌شود.</p>
        </div>
      </div>

      {/* نسخه‌ی چاپی برای گرفتن PDF — خارج از دید ولی رندرشده تا html2canvas بتواند آن را بگیرد */}
      <div className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden="true">
        <div ref={printRef} style={{ width: 794, background: "#ffffff", padding: 40, fontFamily: "Vazirmatn Variable, Tahoma, sans-serif" }} dir="rtl">
          <div style={{ background: "#171933", borderRadius: 20, padding: "24px 28px", color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: "#101124", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#c9a24a", fontWeight: 900, fontSize: 20 }}>ف</span>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>بوم DNA تفکر استراتژیک</div>
              <div style={{ fontSize: 12, color: "#c9a24a", marginTop: 4 }}>سلطان قیف — Funnel King · funnelking.ir</div>
            </div>
          </div>

          <div style={{ marginTop: 20, fontSize: 13, color: "#3d4272" }}>
            سازمان: <strong style={{ color: "#171933" }}>{state.orgName || "—"}</strong>
          </div>

          <PrintSection title="۱. DNA استراتژیک">
            <PrintRow label="چشم‌انداز سه‌ساله" value={state.vision} />
            <PrintRow label="مزیت رقابتی اصلی" value={state.advantage} />
            <PrintRow label="مشتری هدف" value={state.targetCustomer} />
          </PrintSection>

          <PrintSection title="۲. گلوگاه هر مرحله از قیف فروش">
            {FUNNEL_STAGES.map((s) => (
              <PrintRow key={s.key} label={s.label} value={state.funnelBottlenecks[s.key]} />
            ))}
          </PrintSection>

          <PrintSection title="۳. سه گلوگاه اصلی فروش">
            {state.bottlenecks.map((b, i) => (
              <PrintRow key={i} label={`گلوگاه ${["اول", "دوم", "سوم"][i]}`} value={b} />
            ))}
          </PrintSection>

          <PrintSection title="۴. منابع محدود در دسترس">
            <PrintRow label="بودجه" value={state.resources.budget} />
            <PrintRow label="تیم" value={state.resources.team} />
            <PrintRow label="زمان" value={state.resources.time} />
          </PrintSection>

          <PrintSection title="۵. تصمیم و گام اجرایی">
            <PrintRow label="تصمیم استراتژیک کلیدی" value={state.decision} />
            <PrintRow label="گام اجرایی بعدی" value={state.nextAction} />
          </PrintSection>

          <div style={{ marginTop: 24, borderTop: "1px solid #e6e7f2", paddingTop: 12, fontSize: 11, color: "#6b6f96", display: "flex", justifyContent: "space-between" }}>
            <span>funnelking.ir</span>
            <span>{new Date().toLocaleDateString("fa-IR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 900, color: "#171933", borderBottom: "2px solid #c9a24a", paddingBottom: 6, marginBottom: 10 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function PrintRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#f7f8fc", borderRadius: 12, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9c7a30" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#171933", marginTop: 3, whiteSpace: "pre-wrap" }}>{value || "—"}</div>
    </div>
  );
}
