import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
};

export async function GET() {
  const db = await getDb();
  const [girls, trans] = await Promise.all([
    db
      .collection("girls")
      .find(publicVisibilityQuery)
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray(),
    db
      .collection("trans")
      .find(publicVisibilityQuery)
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray(),
  ]);

  const combined = [
    ...girls.map((profile) => ({ profile, profileType: "girls" as const })),
    ...trans.map((profile) => ({ profile, profileType: "trans" as const })),
  ]
    .filter((item) => item?.profile)
    .sort((a, b) => {
      const aTime = a.profile.createdAt instanceof Date ? a.profile.createdAt.getTime() : 0;
      const bTime = b.profile.createdAt instanceof Date ? b.profile.createdAt.getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 9);

  return NextResponse.json(
    combined.map(({ profile, profileType }) => ({
      id: profile._id.toString(),
      name: profile.name ?? "New profile",
      age: typeof profile.age === "number" ? profile.age : null,
      location: profile.location ?? "",
      image: Array.isArray(profile.images) ? profile.images[0] ?? null : null,
      createdAt: profile.createdAt ?? null,
      gender: profile.gender ?? null,
      profileType,
    }))
  );
}
