function normalizeEnvLabel(value: string | null | undefined) {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw) return "dev";
  if (raw === "production" || raw === "prod") return "prod";
  if (raw === "staging" || raw === "stage" || raw === "preview") return "staging";
  if (raw === "test" || raw === "testing") return "test";
  return "dev";
}

export function getCloudinaryAdsFolder() {
  const envLabel = normalizeEnvLabel(
    process.env.APP_ENV ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV
  );
  return `hot-barcelona/${envLabel}/ads`;
}

export function extractCloudinaryPublicId(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;

    let publicParts = parts.slice(uploadIndex + 1);
    if (publicParts.length === 0) return null;
    if (/^v\d+$/.test(publicParts[0])) {
      publicParts = publicParts.slice(1);
    }
    if (publicParts.length === 0) return null;

    const withExtension = publicParts.join("/");
    return withExtension.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

export function deriveCloudinaryPublicIds(urls: string[]) {
  const ids = urls
    .map((url) => extractCloudinaryPublicId(url))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  return Array.from(new Set(ids));
}
