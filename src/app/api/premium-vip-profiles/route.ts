import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
};

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
  const [girls, trans] = await Promise.all([
    db.collection("girls").find(publicVisibilityQuery).sort({ createdAt: -1 }).limit(60).toArray(),
    db.collection("trans").find(publicVisibilityQuery).sort({ createdAt: -1 }).limit(60).toArray(),
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
    .filter((entry) => entry.premiumPlan === PREMIUM_VIP_PLAN)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 6);

  return NextResponse.json(
    combined.map(({ item, profileType, createdAtMs }) => ({
      id: item._id.toString(),
      name: item.name ?? "VIP Profile",
      age: typeof item.age === "number" ? item.age : null,
      location: item.location ?? "Barcelona",
      image: Array.isArray(item.images) ? item.images[0] ?? null : null,
      createdAt: createdAtMs || null,
      gender: item.gender ?? null,
      profileType,
    }))
  );
}
