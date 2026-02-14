export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  const normalized = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (normalized.length === 0) return false;
  return normalized.includes(email.toLowerCase());
}
