import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";

type LookupPayload = {
  email?: string;
  password?: string;
  gender?: string;
};

const readFormFields = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readFieldText = (fields: Record<string, unknown>, key: string) => {
  const raw = fields[key];
  if (typeof raw === "string") return raw.trim();
  if (Array.isArray(raw)) {
    const first = raw.find(
      (item): item is string => typeof item === "string" && item.trim().length > 0
    );
    return first?.trim() ?? "";
  }
  return "";
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
      .findOne(
        { email, isDeleted: { $ne: true } },
        {
          projection: {
            _id: 0,
            gender: 1,
            name: 1,
            age: 1,
            location: 1,
            images: 1,
            formFields: 1,
            passwordHash: 1,
          },
        }
      );
    if (!doc) continue;

    const hash = typeof doc.passwordHash === "string" ? doc.passwordHash : "";
    const ok = hash ? await bcrypt.compare(password, hash) : false;
    if (!ok) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 }
      );
    }

    const formFields = readFormFields(doc.formFields);
    const savedAddress = readFieldText(formFields, "address");
    const fallbackLocation =
      typeof doc.location === "string" ? doc.location.trim() : "";

    return NextResponse.json({
      ok: true,
      profile: {
        gender: doc.gender ?? (collection === "trans" ? "trans" : "girl"),
        name: doc.name ?? "",
        age: doc.age ?? null,
        location: savedAddress || fallbackLocation,
        images: Array.isArray(doc.images) ? doc.images : [],
        email,
        formFields,
      },
    });
  }

  return NextResponse.json(
    { error: "Profile not found." },
    { status: 404 }
  );
}
