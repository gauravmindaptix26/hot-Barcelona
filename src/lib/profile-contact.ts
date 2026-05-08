const privateContactFieldKeys = new Set([
  "phone",
  "phonenumber",
  "mobile",
  "mobilenumber",
  "whatsapp",
  "whatsappnumber",
  "contact",
  "contactnumber",
]);
const nonPublicProfileFieldKeys = new Set([
  ...privateContactFieldKeys,
  "email",
  "paymentmethod",
]);

const normalizeFieldKey = (key: string) =>
  key.toLowerCase().replace(/[\s_-]+/g, "");

const readFirstStringValue = (value: unknown) => {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const firstValue = value.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
    return firstValue?.trim() ?? "";
  }

  return "";
};

const parseToggleValue = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (["yes", "true", "1", "on"].includes(normalized)) return true;
  if (["no", "false", "0", "off"].includes(normalized)) return false;
  return null;
};

export const isPrivateContactField = (key: string) => {
  const normalized = normalizeFieldKey(key);
  if (privateContactFieldKeys.has(normalized)) return true;

  return (
    normalized.includes("phone") ||
    normalized.includes("mobile") ||
    normalized.includes("whatsapp") ||
    normalized.includes("contactnumber")
  );
};

export const isNonPublicProfileField = (key: string) => {
  const normalized = normalizeFieldKey(key);
  if (nonPublicProfileFieldKeys.has(normalized)) return true;
  if (normalized.includes("email")) return true;
  return isPrivateContactField(key);
};

export const stripPrivateContactFields = (fields: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(fields).filter(([key]) => !isNonPublicProfileField(key))
  );

const readContactValueByMatcher = (
  fields: Record<string, unknown>,
  matcher: (normalizedKey: string) => boolean
) => {
  for (const [key, value] of Object.entries(fields)) {
    const normalized = normalizeFieldKey(key);
    if (!matcher(normalized)) continue;

    const firstValue = readFirstStringValue(value);
    if (firstValue) {
      return firstValue;
    }
  }

  return "";
};

const readToggleValueByMatcher = (
  fields: Record<string, unknown>,
  matcher: (normalizedKey: string) => boolean
) => {
  for (const [key, value] of Object.entries(fields)) {
    const normalized = normalizeFieldKey(key);
    if (!matcher(normalized)) continue;

    const firstValue = readFirstStringValue(value);
    if (!firstValue) continue;

    const parsed = parseToggleValue(firstValue);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
};

const readWhatsAppValue = (fields: Record<string, unknown>) =>
  readContactValueByMatcher(
    fields,
    (normalized) =>
      normalized === "whatsapp" ||
      normalized === "whatsappnumber" ||
      normalized.includes("whatsapp")
  );

const readTelegramValue = (fields: Record<string, unknown>) => {
  for (const [key, value] of Object.entries(fields)) {
    const normalized = normalizeFieldKey(key);
    if (!normalized.includes("telegram")) continue;

    const firstValue = readFirstStringValue(value);
    if (firstValue) {
      return firstValue;
    }
  }

  return "";
};

const isWhatsAppEnabled = (fields: Record<string, unknown>) => {
  if (readWhatsAppValue(fields)) return true;

  return (
    readToggleValueByMatcher(
      fields,
      (normalized) =>
        normalized === "whatsappenabled" ||
        normalized === "whatsapptoggle" ||
        normalized === "attendsbywhatsapp"
    ) !== false
  );
};

const isTelegramEnabled = (fields: Record<string, unknown>) => {
  if (readTelegramValue(fields)) return true;

  return (
    readToggleValueByMatcher(
      fields,
      (normalized) =>
        normalized === "telegramenabled" ||
        normalized === "telegramtoggle" ||
        normalized === "attendsbytelegram"
    ) !== false
  );
};

export const extractPhoneValue = (fields: Record<string, unknown>) =>
  readContactValueByMatcher(
    fields,
    (normalized) =>
      normalized === "phone" ||
      normalized === "phonenumber" ||
      normalized === "mobile" ||
      normalized === "mobilenumber" ||
      normalized === "contact" ||
      normalized === "contactnumber" ||
      (normalized.includes("phone") && !normalized.includes("whatsapp")) ||
      normalized.includes("mobile")
  );

export const extractWhatsAppValue = (fields: Record<string, unknown>) => {
  if (!isWhatsAppEnabled(fields)) return "";

  return readWhatsAppValue(fields);
};

export const extractContactPhone = (fields: Record<string, unknown>) => {
  return extractPhoneValue(fields) || extractWhatsAppValue(fields);
};

export const normalizeWhatsAppNumber = (value: string) => {
  const digitsOnly = value.replace(/\D+/g, "").replace(/^00/, "");
  return digitsOnly.length >= 6 ? digitsOnly : "";
};

export const buildPhoneHrefFromFields = (fields: Record<string, unknown>) => {
  const contactPhone = extractPhoneValue(fields);
  if (!contactPhone) return null;

  const digitsOnly = contactPhone.replace(/\D+/g, "");
  if (digitsOnly.length < 6) return null;

  const hrefValue = contactPhone.trim().startsWith("+")
    ? `+${digitsOnly}`
    : digitsOnly;

  return `tel:${hrefValue}`;
};

export const buildWhatsAppHrefFromFields = (fields: Record<string, unknown>) => {
  if (!isWhatsAppEnabled(fields)) return null;

  const contactPhone = extractWhatsAppValue(fields) || extractPhoneValue(fields);
  if (!contactPhone) return null;

  const normalizedPhone = normalizeWhatsAppNumber(contactPhone);
  if (!normalizedPhone) return null;

  return `https://wa.me/${normalizedPhone}`;
};

export const extractTelegramValue = (fields: Record<string, unknown>) => {
  if (!isTelegramEnabled(fields)) return "";

  return readTelegramValue(fields);
};

export const buildTelegramHrefFromFields = (fields: Record<string, unknown>) => {
  if (!isTelegramEnabled(fields)) return null;

  const telegramValue = extractTelegramValue(fields);
  if (!telegramValue) return null;

  const trimmed = telegramValue.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const handle = trimmed
    .replace(/^@+/, "")
    .replace(/^(?:https?:\/\/)?(?:www\.)?(?:t(?:elegram)?\.me)\/+/i, "")
    .replace(/[/?#].*$/, "")
    .trim();

  return handle ? `https://t.me/${handle}` : null;
};

export const extractWebsiteValue = (fields: Record<string, unknown>) =>
  readContactValueByMatcher(
    fields,
    (normalized) =>
      normalized === "websiteurl" ||
      normalized === "website" ||
      normalized === "web" ||
      normalized === "optionalwebsite"
  );

export const extractReferralValue = (fields: Record<string, unknown>) =>
  readContactValueByMatcher(
    fields,
    (normalized) =>
      normalized === "referralurl" ||
      normalized === "referral" ||
      normalized === "referidourl" ||
      normalized === "referredby" ||
      normalized === "referrallink"
  );

const normalizeExternalHref = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (/^[\w.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return null;
};

export const buildWebsiteHrefFromFields = (fields: Record<string, unknown>) =>
  normalizeExternalHref(extractWebsiteValue(fields));

export const buildReferralHrefFromFields = (fields: Record<string, unknown>) =>
  normalizeExternalHref(extractReferralValue(fields));
