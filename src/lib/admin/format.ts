const TZ = "Asia/Tehran";

const dateTime = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeStyle: "short", timeZone: TZ });
const dateOnly = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "medium", timeZone: TZ });
const dayShort = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { month: "numeric", day: "numeric", timeZone: TZ });
const number = new Intl.NumberFormat("fa-IR");

export const fmtDateTime = (iso: string | null | undefined) => (iso ? dateTime.format(new Date(iso)) : "—");
export const fmtDate = (iso: string | null | undefined) => (iso ? dateOnly.format(new Date(iso)) : "—");
export const fmtDay = (isoDay: string) => dayShort.format(new Date(`${isoDay}T12:00:00Z`));
export const fmtNumber = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) ? number.format(Math.round(n)) : "—");
export const fmtToman = (n: number | null | undefined) => (typeof n === "number" ? `${number.format(n)} تومان` : "—");

export const FORMAT_LABEL: Record<string, string> = { PRINT: "چاپی", EBOOK: "الکترونیکی (PDF/EPUB)", AUDIO: "صوتی" };
export const FORMAT_SHORT: Record<string, string> = { PRINT: "چاپی", EBOOK: "PDF", AUDIO: "صوتی" };
