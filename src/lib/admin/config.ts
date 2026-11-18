
/**
 * پیکربندی داشبورد — همه از env در زمان اجرا (نه build). هر کدام نبود، داشبورد بسته می‌ماند (fail-closed).
 *   ADMIN_EMAIL, ADMIN_PASSWORD_HASH (scripts/admin-hash.mjs), ADMIN_SESSION_SECRET (≥۳۲ نویسه)
 *   FK_ADMIN_API_KEY (همان مقدار backend), BACKEND_API_URL, GAME_API_URL, GAME_ADMIN_KEY
 */
export interface AdminConfig {
  email: string;
  passwordHash: string;
  sessionSecret: string;
}

export function adminConfig(): AdminConfig | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!email || !passwordHash || !sessionSecret || sessionSecret.length < 32) return null;
  return { email, passwordHash, sessionSecret };
}

export function backendConfig() {
  const base = (process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "https://exirerp.ir/api").replace(/\/$/, "");
  const tenant = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "t63724ac4c3f";
  const key = process.env.FK_ADMIN_API_KEY?.trim() ?? "";
  return { base: `${base}/site-admin/book/${tenant}`, key };
}

export function gameConfig() {
  const base = (process.env.GAME_API_URL ?? "https://game.funnelking.ir/colyseus").replace(/\/$/, "");
  return { base: `${base}/api/admin`, key: process.env.GAME_ADMIN_KEY?.trim() ?? "" };
}
