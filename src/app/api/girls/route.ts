import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

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
    .find({})
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

  if (images.length < 1) {
    return NextResponse.json(
      { error: "At least one image is required." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const now = new Date();
  const result = await db.collection("girls").insertOne({
    name,
    age,
    location,
    images,
    gender: payload.gender ?? "girl",
    createdAt: now,
  });

  return NextResponse.json({ ok: true, id: result.insertedId.toString() });
}
