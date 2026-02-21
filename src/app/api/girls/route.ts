import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

const publicVisibilityQuery = {
  isDeleted: { $ne: true },
  $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
};

type GirlPayload = {
  name?: string;
  age?: number;
  location?: string;
  images?: string[];
  gender?: string;
  email?: string;
  password?: string;
};

export async function GET() {
  const db = await getDb();
  const items = await db
    .collection("girls")
    .find(publicVisibilityQuery)
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
  const email = (payload.email ?? "").trim().toLowerCase();
  const password = (payload.password ?? "").trim();
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
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
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
  const existing = await db.collection("girls").findOne({
    email,
    isDeleted: { $ne: true },
  });

  if (existing) {
    const existingHash =
      typeof existing.passwordHash === "string" ? existing.passwordHash : "";
    const ok = existingHash
      ? await bcrypt.compare(password, existingHash)
      : false;
    if (!ok) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 }
      );
    }

    await db.collection("girls").updateOne(
      { _id: existing._id },
      {
        $set: {
          name,
          age,
          location,
          images,
          gender: payload.gender ?? "girl",
          approvalStatus: "pending",
          reviewedAt: null,
          reviewedBy: null,
          submittedAt: now,
          updatedAt: now,
        },
      }
    );
    return NextResponse.json({
      ok: true,
      id: existing._id.toString(),
      updated: true,
      approvalStatus: "pending",
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.collection("girls").insertOne({
    name,
    age,
    location,
    images,
    gender: payload.gender ?? "girl",
    email,
    passwordHash,
    approvalStatus: "pending",
    reviewedAt: null,
    reviewedBy: null,
    submittedAt: now,
    userId: null,
    userEmail: null,
    createdAt: now,
  });

  return NextResponse.json({
    ok: true,
    id: result.insertedId.toString(),
    updated: false,
    approvalStatus: "pending",
  });
}
