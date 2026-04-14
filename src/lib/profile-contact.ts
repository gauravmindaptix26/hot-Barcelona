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

export const stripPrivateContactFields = (fields: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(fields).filter(([key]) => !isPrivateContactField(key))
  );

export const extractContactPhone = (fields: Record<string, unknown>) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!isPrivateContactField(key)) continue;

    const firstValue = readFirstStringValue(value);
    if (firstValue) {
      return firstValue;
    }
  }

  return "";
};

export const normalizeWhatsAppNumber = (value: string) => {
  const digitsOnly = value.replace(/\D+/g, "").replace(/^00/, "");
  return digitsOnly.length >= 6 ? digitsOnly : "";
};

export const buildWhatsAppHrefFromFields = (fields: Record<string, unknown>) => {
  const contactPhone = extractContactPhone(fields);
  if (!contactPhone) return null;

  const normalizedPhone = normalizeWhatsAppNumber(contactPhone);
  if (!normalizedPhone) return null;

  return `https://wa.me/${normalizedPhone}`;
};
