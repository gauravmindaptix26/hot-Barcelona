import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPublicProfileImages } from "@/lib/profile-images";
import { normalizeSubscriptionPlanValue } from "@/lib/subscription";

export const revalidate = 120;

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
};
const latestProfileProjection = {
  _id: 1,
  name: 1,
  age: 1,
  location: 1,
  images: 1,
  imageApprovals: 1,
  createdAt: 1,
  submittedAt: 1,
  updatedAt: 1,
  gender: 1,
  formFields: 1,
  subscriptionPlan: 1,
  premiumPlan: 1,
} as const;

const TOP_PREMIUM_STANDARD_PLAN = "TOP PREMIUM STANDARD";
const SOURCE_PROFILE_LIMIT = 100;

const readFormFields = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readFirstStringValue = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const first = value.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
    return first?.trim() ?? "";
  }
  return "";
};

const readItemValue = (item: unknown, key: string) =>
  item && typeof item === "object" && !Array.isArray(item)
    ? (item as Record<string, unknown>)[key]
    : undefined;

const readSubscriptionPlan = (value: unknown) =>
  normalizeSubscriptionPlanValue(readFirstStringValue(value));

const readDateMs = (value: unknown) => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const readProfileTimestampMs = (profile: unknown) =>
  Math.max(
    readDateMs(readItemValue(profile, "submittedAt")),
    readDateMs(readItemValue(profile, "updatedAt")),
    readDateMs(readItemValue(profile, "createdAt"))
  );

const hasSpecialOffer = (fields: Record<string, unknown>) =>
  Boolean(
    readFirstStringValue(fields.specialOffer) ||
      readFirstStringValue(fields.specialoffer) ||
      readFirstStringValue(fields.offerText)
  );

export async function GET() {
  const db = await getDb();
  const [girls, trans] = await Promise.all([
    db
      .collection("girls")
      .find(publicVisibilityQuery, { projection: latestProfileProjection })
      .sort({ submittedAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(SOURCE_PROFILE_LIMIT)
      .toArray(),
    db
      .collection("trans")
      .find(publicVisibilityQuery, { projection: latestProfileProjection })
      .sort({ submittedAt: -1, updatedAt: -1, createdAt: -1 })
      .limit(SOURCE_PROFILE_LIMIT)
      .toArray(),
  ]);

  const combined = [
    ...girls.map((profile) => ({ profile, profileType: "girls" as const })),
    ...trans.map((profile) => ({ profile, profileType: "trans" as const })),
  ]
    .filter((item) => item?.profile)
    .map(({ profile, profileType }) => {
      const formFields = readFormFields(profile.formFields);
      const premiumPlan =
        readSubscriptionPlan(formFields.subscriptionPlan) ??
        readSubscriptionPlan(readItemValue(profile, "subscriptionPlan")) ??
        readSubscriptionPlan(readItemValue(profile, "premiumPlan"));

      return {
        profile,
        profileType,
        premiumPlan,
        createdAtMs: readProfileTimestampMs(profile),
      };
    })
    .filter((item) => item.premiumPlan === TOP_PREMIUM_STANDARD_PLAN)
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
    .slice(0, 12);

  return NextResponse.json(
    combined.map(({ profile, profileType, createdAtMs }) => ({
      id: profile._id.toString(),
      name: profile.name ?? "New profile",
      age: typeof profile.age === "number" ? profile.age : null,
      location: profile.location ?? "",
      image: getPublicProfileImages(
        profile.images,
        readItemValue(profile, "imageApprovals")
      )[0] ?? null,
      createdAt: createdAtMs || null,
      gender: profile.gender ?? null,
      profileType,
      hasSpecialOffer: hasSpecialOffer(readFormFields(profile.formFields)),
    })),
    {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    }
  );
}
