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

export const extractWhatsAppValue = (fields: Record<string, unknown>) =>
  readContactValueByMatcher(
    fields,
    (normalized) =>
      normalized === "whatsapp" ||
      normalized === "whatsappnumber" ||
      normalized.includes("whatsapp")
  );

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
  const contactPhone = extractWhatsAppValue(fields) || extractPhoneValue(fields);
  if (!contactPhone) return null;

  const normalizedPhone = normalizeWhatsAppNumber(contactPhone);
  if (!normalizedPhone) return null;

  return `https://wa.me/${normalizedPhone}`;
};

export const extractTelegramValue = (fields: Record<string, unknown>) => {
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

export const buildTelegramHrefFromFields = (fields: Record<string, unknown>) => {
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
