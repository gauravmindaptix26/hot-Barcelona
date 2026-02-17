import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const [girls, trans] = await Promise.all([
    db
      .collection("girls")
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray(),
    db
      .collection("trans")
      .find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(25)
      .toArray(),
  ]);

  const combined = [...girls, ...trans]
    .filter((item) => item)
    .sort((a, b) => {
      const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 9);

  return NextResponse.json(
    combined.map((profile) => ({
      id: profile._id.toString(),
      name: profile.name ?? "New profile",
      age: typeof profile.age === "number" ? profile.age : null,
      location: profile.location ?? "",
      image: Array.isArray(profile.images) ? profile.images[0] ?? null : null,
      createdAt: profile.createdAt ?? null,
      gender: profile.gender ?? null,
    }))
  );
}
