import GirlsClient from "./girls-client";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
};

const PREMIUM_PLAN_ORDER = [
  "TOP PREMIUM VIP",
  "TOP PREMIUM BANNER",
  "TOP PREMIUM TOP",
  "TOP PREMIUM STANDARD",
] as const;

const PREMIUM_PLAN_PRIORITY = new Map<string, number>(
  PREMIUM_PLAN_ORDER.map((plan, index) => [plan, index])
);

const scheduleDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const normalizePremiumPlanText = (value: string) =>
  value.replace(/\s+/g, " ").trim().toUpperCase();

const PREMIUM_PLAN_LOOKUP = new Map(
  PREMIUM_PLAN_ORDER.map((plan) => [normalizePremiumPlanText(plan), plan] as const)
);

const readSubscriptionPlan = (value: unknown) => {
  if (typeof value !== "string") return null;
  const normalized = normalizePremiumPlanText(value);
  const exact = PREMIUM_PLAN_LOOKUP.get(normalized);
  if (exact) return exact;

  for (const plan of PREMIUM_PLAN_ORDER) {
    if (normalized.startsWith(normalizePremiumPlanText(plan))) {
      return plan;
    }
  }

  return null;
};

const readSubscriptionDuration = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const readFormFields = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readItemValue = (item: unknown, key: string) =>
  item && typeof item === "object" && !Array.isArray(item)
    ? (item as Record<string, unknown>)[key]
    : undefined;

const readString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const readNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const readStringArray = (value: unknown) => {
  if (Array.isArray(value)) {
    return Array.from(
      new Set(
        value
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
};

const readFieldText = (fields: Record<string, unknown>, key: string) => {
  const raw = fields[key];
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) {
    const first = raw.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
    return first?.trim() ?? "";
  }
  return "";
};

const uniqueStrings = (values: string[]) =>
  Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const readCreatedAtMs = (value: unknown) => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getPremiumPlanPriority = (value: string | null) =>
  value ? (PREMIUM_PLAN_PRIORITY.get(value) ?? PREMIUM_PLAN_ORDER.length) : PREMIUM_PLAN_ORDER.length;

const buildAvailability = (
  fields: Record<string, unknown>,
  services: string[],
  attention: string[]
) => {
  const openSlots: Array<{ day: string; start: string; end: string }> = [];
  let hasScheduleValue = false;

  for (const day of scheduleDays) {
    const start = readFieldText(fields, `schedule-${day}-start`);
    const end = readFieldText(fields, `schedule-${day}-end`);
    if (!start && !end) continue;

    hasScheduleValue = true;
    const isRest =
      start.toLowerCase() === "rest" || end.toLowerCase() === "rest";
    if (!isRest && start && end) {
      openSlots.push({ day, start, end });
    }
  }

  const daysLabel =
    openSlots.length > 0
      ? uniqueStrings(openSlots.map((slot) => slot.day.slice(0, 3))).join(", ")
      : hasScheduleValue
        ? "Rest / custom"
        : "";

  const hourPairs = uniqueStrings(openSlots.map((slot) => `${slot.start} - ${slot.end}`));
  const hoursLabel =
    openSlots.length === 0
      ? hasScheduleValue
        ? "Rest"
        : ""
      : hourPairs.length === 1
        ? hourPairs[0]
        : `${hourPairs.length} schedules`;

  const hasTravelSignal = [...services, ...attention].length > 0;
  const hasTravel = [...services, ...attention].some((value) =>
    value.toLowerCase().includes("travel")
  );

  return {
    days: daysLabel,
    hours: hoursLabel,
    travel: hasTravelSignal ? (hasTravel ? "Yes" : "No") : "",
  };
};

const buildAbout = (params: {
  name: string;
  age: number;
  location: string;
  description: string;
  nationality: string;
  services: string[];
  rates: string[];
}) => {
  if (params.description) return params.description;

  const chunks: string[] = [];
  if (params.nationality) chunks.push(`Nationality: ${params.nationality}`);
  if (params.services.length) {
    chunks.push(`Services: ${params.services.slice(0, 5).join(", ")}`);
  }
  if (params.rates.length) chunks.push(`Rates: ${params.rates.join(" | ")}`);

  const heading = [
    params.name,
    params.age > 0 ? `${params.age}` : "",
    params.location ? `in ${params.location}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const body = chunks.join(". ");
  if (heading && body) return `${heading}. ${body}.`;
  if (body) return `${body}.`;
  if (heading) return `${heading}.`;
  return "Profile details will be updated soon.";
};

export default async function GirlsPage() {
  const db = await getDb();
  const items = await db
    .collection("girls")
    .find(publicVisibilityQuery)
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  const sortedItems = [...items].sort((a, b) => {
    const aFields = readFormFields(a.formFields);
    const bFields = readFormFields(b.formFields);
    const aPremiumPlan =
      readSubscriptionPlan(aFields.subscriptionPlan) ??
      readSubscriptionPlan(readItemValue(a, "subscriptionPlan")) ??
      readSubscriptionPlan(readItemValue(a, "premiumPlan"));
    const bPremiumPlan =
      readSubscriptionPlan(bFields.subscriptionPlan) ??
      readSubscriptionPlan(readItemValue(b, "subscriptionPlan")) ??
      readSubscriptionPlan(readItemValue(b, "premiumPlan"));
    const aRank = getPremiumPlanPriority(aPremiumPlan);
    const bRank = getPremiumPlanPriority(bPremiumPlan);

    if (aRank !== bRank) {
      return aRank - bRank;
    }

    return readCreatedAtMs(b.createdAt) - readCreatedAtMs(a.createdAt);
  });

  const initialProfiles = sortedItems.map((item) => {
    const formFields = readFormFields(item.formFields);
    const images = Array.isArray(item.images)
      ? item.images.filter(
          (image): image is string =>
            typeof image === "string" && image.trim().length > 0
        )
      : [];

    const services = readStringArray(formFields.servicesOffered);
    const physicalAttributes = readStringArray(formFields.physicalAttributes);
    const attentionLevel = readStringArray(formFields.attentionLevel);
    const specialFilters = readStringArray(formFields.specialFilters);
    const languages = readStringArray(formFields.languages);

    const nationality = readFieldText(formFields, "nationality");
    const descriptionText = readFieldText(formFields, "descriptionText");
    const paymentMethod = readFieldText(formFields, "paymentMethod");

    const rates = uniqueStrings(
      [
        readFieldText(formFields, "rate20"),
        readFieldText(formFields, "rate30"),
        readFieldText(formFields, "rate45"),
        readFieldText(formFields, "rate60"),
      ].filter(Boolean)
    );

    const name =
      readString(item.name) || readFieldText(formFields, "stageName") || "Profile";
    const age = readNumber(item.age) ?? readNumber(formFields.age) ?? 0;
    const location =
      readString(item.location) ||
      readFieldText(formFields, "address");
    const rating =
      readNumber(readItemValue(item, "rating")) ??
      readNumber(readItemValue(formFields, "rating"));
    const reviews =
      readNumber(readItemValue(item, "reviews")) ??
      readNumber(readItemValue(formFields, "reviews"));

    const premiumPlan =
      readSubscriptionPlan(formFields.subscriptionPlan) ??
      readSubscriptionPlan(readItemValue(item, "subscriptionPlan")) ??
      readSubscriptionPlan(readItemValue(item, "premiumPlan"));
    const premiumDuration =
      readSubscriptionDuration(formFields.subscriptionDuration) ??
      readSubscriptionDuration(readItemValue(item, "subscriptionDuration")) ??
      readSubscriptionDuration(readItemValue(item, "premiumDuration"));

    const profileServices = uniqueStrings([
      ...services,
      ...specialFilters,
      ...attentionLevel,
      ...(paymentMethod ? [paymentMethod] : []),
      ...rates.map((rate) => `Rate: ${rate}`),
    ]);

    return {
      id: `db-${item._id.toString()}`,
      name,
      age,
      location,
      rating,
      reviews,
      status: readString(readItemValue(item, "status")),
      image: images[0] ?? "",
      tag: premiumPlan ? "Premium" : "",
      about: descriptionText,
      details: {
        height: readFieldText(formFields, "height"),
        body: readFieldText(formFields, "body") || physicalAttributes[0] || "",
        hair: readFieldText(formFields, "hair"),
        eyes: readFieldText(formFields, "eyes"),
        nationality,
        languages: languages.length ? languages.join(", ") : "",
      },
      style: {
        fashion: premiumPlan ?? "",
        personality:
          attentionLevel.length > 0
            ? attentionLevel.slice(0, 3)
            : physicalAttributes.slice(0, 3).length > 0
              ? physicalAttributes.slice(0, 3)
              : [],
        vibe:
          specialFilters.length > 0
            ? specialFilters.slice(0, 3)
            : [],
      },
      services: profileServices,
      availability: buildAvailability(formFields, services, attentionLevel),
      gallery: images,
      premiumPlan,
      premiumDuration,
      formFields,
    };
  });

  return <GirlsClient initialProfiles={initialProfiles} />;
}
