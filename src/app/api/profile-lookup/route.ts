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
  const user = await db.collection("users").findOne(
    { email },
    { projection: { passwordHash: 1 } }
  );
  const userHash = typeof user?.passwordHash === "string" ? user.passwordHash : "";
  const userPasswordMatches = userHash ? await bcrypt.compare(password, userHash) : false;
  const preferredCollection =
    gender === "girl" ? "girls" : gender === "trans" ? "trans" : null;
  const collections = preferredCollection
    ? [preferredCollection, ...["girls", "trans"].filter((item) => item !== preferredCollection)]
    : ["girls", "trans"];
  let foundProfileForEmail = false;

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
    foundProfileForEmail = true;

    const hash = typeof doc.passwordHash === "string" ? doc.passwordHash : "";
    const ok = hash ? await bcrypt.compare(password, hash) : userPasswordMatches;
    if (!ok) continue;

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

  if (foundProfileForEmail) {
    return NextResponse.json(
      { error: "Email or password is incorrect." },
      { status: 401 }
    );
  }

  return NextResponse.json(
    { error: "Profile not found." },
    { status: 404 }
  );
}
