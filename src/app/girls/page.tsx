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

const getPremiumPlanPriority = (value: string | null) =>
  value ? (PREMIUM_PLAN_PRIORITY.get(value) ?? PREMIUM_PLAN_ORDER.length) : PREMIUM_PLAN_ORDER.length;

const readCreatedAtMs = (value: unknown) => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
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
    const images = Array.isArray(item.images) && item.images.length
      ? item.images
      : ["/images/hot1.webp"];
    const formFields = readFormFields(item.formFields);
    const premiumPlan =
      readSubscriptionPlan(formFields.subscriptionPlan) ??
      readSubscriptionPlan(readItemValue(item, "subscriptionPlan")) ??
      readSubscriptionPlan(readItemValue(item, "premiumPlan"));
    const premiumDuration =
      readSubscriptionDuration(formFields.subscriptionDuration) ??
      readSubscriptionDuration(readItemValue(item, "subscriptionDuration")) ??
      readSubscriptionDuration(readItemValue(item, "premiumDuration"));

    return {
      id: `db-${item._id.toString()}`,
      name: item.name ?? "New",
      age: Number.isFinite(Number(item.age)) ? Number(item.age) : 0,
      location: item.location ?? "Barcelona",
      rating: 4.7,
      reviews: 0,
      status: "New profile",
      image: images[0],
      tag: "New",
      about:
        "Fresh profile added by the model. Details and preferences will be updated soon.",
      details: {
        height: "—",
        body: "—",
        hair: "—",
        eyes: "—",
        nationality: "—",
        languages: "—",
      },
      style: {
        fashion: "Classic",
        personality: ["New", "Private", "Charming"],
        vibe: ["Fresh", "Glow", "Night"],
      },
      services: ["Private time", "Events"],
      availability: {
        days: "Mon - Sun",
        hours: "00:00 - 23:59",
        travel: "No",
      },
      gallery: images,
      premiumPlan,
      premiumDuration,
    };
  });

  return <GirlsClient initialProfiles={initialProfiles} />;
}
