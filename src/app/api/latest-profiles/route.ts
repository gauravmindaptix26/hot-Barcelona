import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPublicProfileImages } from "@/lib/profile-images";

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

const SOURCE_PROFILE_LIMIT = 100;
const NEW_COMER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

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

const readDateMs = (value: unknown) => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const readNewComerTimestampMs = (profile: unknown) =>
  Math.max(
    readDateMs(readItemValue(profile, "submittedAt")),
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
  const cutoffDate = new Date(Date.now() - NEW_COMER_WINDOW_MS);
  const girls = await db
    .collection("girls")
    .find(
      {
        $and: [
          publicVisibilityQuery,
          {
            $or: [
              { submittedAt: { $gte: cutoffDate } },
              { createdAt: { $gte: cutoffDate } },
            ],
          },
        ],
      },
      { projection: latestProfileProjection }
    )
    .sort({ submittedAt: -1, createdAt: -1, updatedAt: -1 })
    .limit(SOURCE_PROFILE_LIMIT)
    .toArray();

  const combined = girls
    .map((profile) => ({ profile, profileType: "girls" as const }))
    .filter((item) => item?.profile)
    .map(({ profile, profileType }) => {
      return {
        profile,
        profileType,
        createdAtMs: readNewComerTimestampMs(profile),
      };
    })
    .filter((item) => item.createdAtMs >= cutoffDate.getTime())
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
