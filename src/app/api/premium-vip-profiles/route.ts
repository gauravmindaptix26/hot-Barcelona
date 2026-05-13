import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPublicProfileImages } from "@/lib/profile-images";

export const revalidate = 120;

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
};
const premiumVipProjection = {
  _id: 1,
  name: 1,
  age: 1,
  location: 1,
  images: 1,
  imageApprovals: 1,
  createdAt: 1,
  gender: 1,
  formFields: 1,
  subscriptionPlan: 1,
  premiumPlan: 1,
} as const;

const PREMIUM_VIP_PLAN = "TOP PREMIUM VIP";

const normalizePremiumPlanText = (value: string) =>
  value.replace(/\s+/g, " ").trim().toUpperCase();

const readFormFields = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readItemValue = (item: unknown, key: string) =>
  item && typeof item === "object" && !Array.isArray(item)
    ? (item as Record<string, unknown>)[key]
    : undefined;

const readStringValue = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" && item.trim()) {
        return item.trim();
      }
    }
  }
  return null;
};

const hasSpecialOffer = (fields: Record<string, unknown>) =>
  Boolean(
    readStringValue(fields.specialOffer) ||
      readStringValue(fields.specialoffer) ||
      readStringValue(fields.offerText)
  );

const readSubscriptionPlan = (value: unknown) => {
  const raw = readStringValue(value);
  if (!raw) return null;

  const normalized = normalizePremiumPlanText(raw);
  return normalized.startsWith(normalizePremiumPlanText(PREMIUM_VIP_PLAN))
    ? PREMIUM_VIP_PLAN
    : null;
};

const readCreatedAtMs = (value: unknown) => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export async function GET() {
  const db = await getDb();
  const girls = await db
    .collection("girls")
    .find(publicVisibilityQuery, { projection: premiumVipProjection })
    .sort({ createdAt: -1 })
    .limit(60)
    .toArray();

  const combined = [
    ...girls.map((item) => ({ item, profileType: "girls" as const })),
  ]
    .map(({ item, profileType }) => {
      const formFields = readFormFields(item.formFields);
      const premiumPlan =
        readSubscriptionPlan(formFields.subscriptionPlan) ??
        readSubscriptionPlan(readItemValue(item, "subscriptionPlan")) ??
        readSubscriptionPlan(readItemValue(item, "premiumPlan"));

      return {
        item,
        profileType,
        premiumPlan,
        createdAtMs: readCreatedAtMs(item.createdAt),
      };
    })
    .filter((entry) => entry.premiumPlan === PREMIUM_VIP_PLAN)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 6);

  return NextResponse.json(
    combined.map(({ item, profileType, createdAtMs }) => ({
      id: item._id.toString(),
      name: item.name ?? "VIP Profile",
      age: typeof item.age === "number" ? item.age : null,
      location: item.location ?? "Barcelona",
      image: getPublicProfileImages(
        item.images,
        readItemValue(item, "imageApprovals")
      )[0] ?? null,
      createdAt: createdAtMs || null,
      gender: item.gender ?? null,
      profileType,
      hasSpecialOffer: hasSpecialOffer(readFormFields(item.formFields)),
    })),
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    }
  );
}
