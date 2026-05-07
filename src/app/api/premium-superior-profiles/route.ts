import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { normalizeSubscriptionPlanValue } from "@/lib/subscription";

export const revalidate = 120;

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
};

const premiumSuperiorProjection = {
  _id: 1,
  name: 1,
  age: 1,
  location: 1,
  images: 1,
  createdAt: 1,
  gender: 1,
  formFields: 1,
  subscriptionPlan: 1,
  premiumPlan: 1,
} as const;

const PREMIUM_SUPERIOR_PLAN = "PREMIUM SUPERIOR";

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

const readSubscriptionPlan = (value: unknown) =>
  normalizeSubscriptionPlanValue(readStringValue(value));

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
  const [girls, trans] = await Promise.all([
    db
      .collection("girls")
      .find(publicVisibilityQuery, { projection: premiumSuperiorProjection })
      .sort({ createdAt: -1 })
      .limit(120)
      .toArray(),
    db
      .collection("trans")
      .find(publicVisibilityQuery, { projection: premiumSuperiorProjection })
      .sort({ createdAt: -1 })
      .limit(120)
      .toArray(),
  ]);

  const combined = [
    ...girls.map((item) => ({ item, profileType: "girls" as const })),
    ...trans.map((item) => ({ item, profileType: "trans" as const })),
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
    .filter((entry) => entry.premiumPlan === PREMIUM_SUPERIOR_PLAN)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 24);

  return NextResponse.json(
    combined.map(({ item, profileType, createdAtMs }) => ({
      id: item._id.toString(),
      name: item.name ?? "Premium Profile",
      age: typeof item.age === "number" ? item.age : null,
      location: item.location ?? "Barcelona",
      image: Array.isArray(item.images) ? item.images[0] ?? null : null,
      createdAt: createdAtMs || null,
      gender: item.gender ?? null,
      profileType,
    })),
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    }
  );
}
