import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

const allowedProfileTypes = new Set(["girls", "trans"]);

const normalizeProfileType = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return allowedProfileTypes.has(trimmed) ? trimmed : null;
};

const normalizeProfileId = (value: unknown) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return ObjectId.isValid(trimmed) ? trimmed : null;
};

export async function GET() {
  const session = await getAppServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ favorites: [] }, { status: 200 });
  }

  const db = await getDb();
  const favorites = await db
    .collection("profile_favorites")
    .find(
      { userId: session.user.id },
      { projection: { _id: 0, profileId: 1, profileType: 1 } }
    )
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json({
    favorites: favorites
      .map((item) => {
        const profileId =
          typeof item.profileId === "string" && ObjectId.isValid(item.profileId)
            ? item.profileId
            : null;
        const profileType = normalizeProfileType(item.profileType);
        if (!profileId || !profileType) return null;
        return {
          profileId,
          profileType,
        };
      })
      .filter(Boolean),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAppServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: { profileId?: string; profileType?: string };
  try {
    payload = (await request.json()) as { profileId?: string; profileType?: string };
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const profileId = normalizeProfileId(payload.profileId);
  const profileType = normalizeProfileType(payload.profileType);

  if (!profileId || !profileType) {
    return NextResponse.json({ error: "Invalid favorite target." }, { status: 400 });
  }

  const db = await getDb();
  const target = await db.collection(profileType).findOne(
    {
      _id: new ObjectId(profileId),
      isDeleted: { $ne: true },
      $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
    },
    { projection: { _id: 1 } }
  );

  if (!target) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  await db.collection("profile_favorites").updateOne(
    {
      userId: session.user.id,
      profileId,
      profileType,
    },
    {
      $set: {
        userId: session.user.id,
        profileId,
        profileType,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({
    ok: true,
    favorited: true,
    profileId,
    profileType,
  });
}

export async function DELETE(request: NextRequest) {
  const session = await getAppServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: { profileId?: string; profileType?: string };
  try {
    payload = (await request.json()) as { profileId?: string; profileType?: string };
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const profileId = normalizeProfileId(payload.profileId);
  const profileType = normalizeProfileType(payload.profileType);

  if (!profileId || !profileType) {
    return NextResponse.json({ error: "Invalid favorite target." }, { status: 400 });
  }

  const db = await getDb();
  await db.collection("profile_favorites").deleteOne({
    userId: session.user.id,
    profileId,
    profileType,
  });

  return NextResponse.json({
    ok: true,
    favorited: false,
    profileId,
    profileType,
  });
}
