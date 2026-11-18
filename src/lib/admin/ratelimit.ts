
/** محدودیت تلاش ورود (در حافظه‌ی همین پروسه؛ برای یک نمونه‌ی سایت کافی است). */
const WINDOW_MS = 15 * 60_000;
const MAX_PER_IP = 5;
const MAX_GLOBAL = 30;

const byIp = new Map<string, number[]>();
let global: number[] = [];

function prune(list: number[], now: number) {
  return list.filter((t) => now - t < WINDOW_MS);
}

/** دقیقه‌های باقی‌مانده از قفل؛ ۰ یعنی مجاز. */
export function loginBlocked(ip: string, now = Date.now()): number {
  global = prune(global, now);
  const mine = prune(byIp.get(ip) ?? [], now);
  byIp.set(ip, mine);
  if (mine.length >= MAX_PER_IP) return Math.ceil((WINDOW_MS - (now - mine[0])) / 60_000);
  if (global.length >= MAX_GLOBAL) return Math.ceil((WINDOW_MS - (now - global[0])) / 60_000);
  return 0;
}

export function recordLoginFailure(ip: string, now = Date.now()) {
  byIp.set(ip, [...prune(byIp.get(ip) ?? [], now), now]);
  global = [...prune(global, now), now];
  if (byIp.size > 5000) byIp.clear();
}

export function clearLoginFailures(ip: string) {
  byIp.delete(ip);
}
