import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

type LookupPayload = {
  email?: string;
  password?: string;
  gender?: string;
};

export async function POST(req: Request) {
  const limiter = rateLimit("profile:lookup", 30, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let payload: LookupPayload;
  try {
    payload = (await req.json()) as LookupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const password = (payload.password ?? "").trim();
  const gender = (payload.gender ?? "").trim();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const collections =
    gender === "girl"
      ? ["girls"]
      : gender === "trans"
        ? ["trans"]
        : ["girls", "trans"];

  for (const collection of collections) {
    const doc = await db
      .collection(collection)
      .findOne({ email, isDeleted: { $ne: true } });
    if (!doc) continue;

    const hash = typeof doc.passwordHash === "string" ? doc.passwordHash : "";
    const ok = hash ? await bcrypt.compare(password, hash) : false;
    if (!ok) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      ok: true,
      profile: {
        gender: doc.gender ?? (collection === "trans" ? "trans" : "girl"),
        name: doc.name ?? "",
        age: doc.age ?? null,
        location: doc.location ?? "",
        images: Array.isArray(doc.images) ? doc.images : [],
        email,
      },
    });
  }

  return NextResponse.json(
    { error: "Profile not found." },
    { status: 404 }
  );
}
