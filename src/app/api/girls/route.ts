import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { authOptions } from "@/lib/auth";

type GirlPayload = {
  name?: string;
  age?: number;
  location?: string;
  images?: string[];
  gender?: string;
};

export async function GET() {
  const db = await getDb();
  const items = await db
    .collection("girls")
    .find({ isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json(
    items.map((item) => ({
      _id: item._id.toString(),
      name: item.name ?? "",
      age: item.age ?? null,
      location: item.location ?? "",
      images: Array.isArray(item.images) ? item.images : [],
      createdAt: item.createdAt ?? null,
    }))
  );
}

export async function POST(req: Request) {
  const limiter = rateLimit("girls:create", 20, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please login to save your ad." },
      { status: 401 }
    );
  }

  let payload: GirlPayload;
  try {
    payload = (await req.json()) as GirlPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = (payload.name ?? "").trim();
  const location = (payload.location ?? "").trim();
  const age = Number(payload.age);
  const images = Array.isArray(payload.images)
    ? payload.images.filter((item) => typeof item === "string")
    : [];

  if (!name || !location || !Number.isFinite(age)) {
    return NextResponse.json(
      { error: "Name, age, and location are required." },
      { status: 400 }
    );
  }

  if (images.length < 4) {
    return NextResponse.json(
      { error: "At least 4 images are required." },
      { status: 400 }
    );
  }
  if (images.length > 20) {
    return NextResponse.json(
      { error: "No more than 20 images are allowed." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const now = new Date();
  const userId = new ObjectId(session.user.id);
  const existing = await db.collection("girls").findOne({
    userId,
    isDeleted: { $ne: true },
  });

  if (existing) {
    await db.collection("girls").updateOne(
      { _id: existing._id },
      {
        $set: {
          name,
          age,
          location,
          images,
          gender: payload.gender ?? "girl",
          updatedAt: now,
        },
      }
    );
    return NextResponse.json({ ok: true, id: existing._id.toString(), updated: true });
  }

  const result = await db.collection("girls").insertOne({
    name,
    age,
    location,
    images,
    gender: payload.gender ?? "girl",
    userId,
    userEmail: session.user.email ?? null,
    createdAt: now,
  });

  return NextResponse.json({ ok: true, id: result.insertedId.toString(), updated: false });
}
