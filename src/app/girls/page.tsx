import GirlsClient from "./girls-client";
import { getDb } from "@/lib/db";
import { stripPrivateContactFields } from "@/lib/profile-contact";
import { getPublicProfileImages } from "@/lib/profile-images";
import { normalizeProfileLabel } from "@/lib/profile-labels";
import {
  normalizeSubscriptionDurationValue,
  normalizeSubscriptionPlanValue,
  SUBSCRIPTION_PLAN_ORDER,
} from "@/lib/subscription";
import { unstable_cache } from "next/cache";

export const revalidate = 120;

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  approvalStatus: "approved",
};
const profileProjection = {
  _id: 1,
  name: 1,
  age: 1,
  location: 1,
  images: 1,
  imageApprovals: 1,
  createdAt: 1,
  status: 1,
  gender: 1,
  formFields: 1,
  rating: 1,
  reviews: 1,
  subscriptionPlan: 1,
  subscriptionDuration: 1,
  premiumPlan: 1,
  premiumDuration: 1,
} as const;

const PREMIUM_PLAN_ORDER = SUBSCRIPTION_PLAN_ORDER;

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

const readSubscriptionPlan = (value: unknown) =>
  typeof value === "string" ? normalizeSubscriptionPlanValue(value) : null;

const readSubscriptionDuration = (value: unknown) =>
  normalizeSubscriptionDurationValue(value);

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
          .map(normalizeProfileLabel)
          .filter(Boolean)
      )
    );
  }
  if (typeof value === "string" && value.trim()) {
    return [normalizeProfileLabel(value)];
  }
  return [];
};

const readFieldText = (fields: Record<string, unknown>, key: string) => {
  const raw = fields[key];
  if (typeof raw === "string") return normalizeProfileLabel(raw);
  if (Array.isArray(raw)) {
    const first = raw.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
    return first ? normalizeProfileLabel(first) : "";
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

const getCachedGirlsProfiles = unstable_cache(
  async () => {
    const db = await getDb();
    const items = await db
      .collection("girls")
      .find(publicVisibilityQuery, { projection: profileProjection })
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

  return sortedItems.map((item) => {
    const formFields = readFormFields(item.formFields);
    const publicFormFields = stripPrivateContactFields(formFields);
    const images = getPublicProfileImages(item.images, readItemValue(item, "imageApprovals"));

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
      readFieldText(formFields, "address") ||
      readString(item.location);
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
      formFields: publicFormFields,
    };
  });
  },
  ["girls-public-profiles-v5"],
  { revalidate: 120, tags: ["girls-public-profiles"] }
);

export default async function GirlsPage() {
  const initialProfiles = await getCachedGirlsProfiles();

  return (
    <GirlsClient
      initialProfiles={initialProfiles}
    />
  );
}
