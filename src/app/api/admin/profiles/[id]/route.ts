import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import {
  deriveCloudinaryPublicIds,
  extractCloudinaryPublicId,
} from "@/lib/cloudinary";

const allowedCollections = new Set(["girls", "trans"]);
const allowedActions = new Set(["accept", "reject"]);

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}

function getType(req: Request) {
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "").toLowerCase();
  return allowedCollections.has(type) ? type : null;
}

async function deleteFromCloudinary(urls: string[], imagePublicIds: string[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const publicIds = Array.from(
    new Set([
      ...imagePublicIds,
      ...urls
        .map((url) => extractCloudinaryPublicId(url))
        .filter((id): id is string => Boolean(id)),
    ])
  );

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  for (const publicId of publicIds) {
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    try {
      await fetch(endpoint, { method: "POST", body: formData });
    } catch {
      // ignore cloudinary errors
    }
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const type = getType(req);
  if (!type) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const db = await getDb();
  const _id = new ObjectId(id);
  const doc = await db.collection(type).findOne({ _id });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const images = Array.isArray(doc.images)
    ? doc.images.filter((item: unknown) => typeof item === "string")
    : [];
  const imagePublicIds = Array.isArray(doc.imagePublicIds)
    ? doc.imagePublicIds.filter((item: unknown): item is string => typeof item === "string")
    : deriveCloudinaryPublicIds(images);

  await db.collection(type).deleteOne({ _id });
  if (images.length > 0 || imagePublicIds.length > 0) {
    await deleteFromCloudinary(images, imagePublicIds);
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertAdmin();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const type = getType(req);
  if (!type) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  let payload: { action?: string };
  try {
    payload = (await req.json()) as { action?: string };
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const action = (payload.action ?? "").toLowerCase();
  if (!allowedActions.has(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const approvalStatus = action === "accept" ? "approved" : "rejected";
  const db = await getDb();
  const _id = new ObjectId(id);

  const result = await db.collection(type).findOneAndUpdate(
    { _id },
    {
      $set: {
        approvalStatus,
        reviewedAt: new Date(),
        reviewedBy: session.user.email,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    approvalStatus,
    reviewedAt: result.reviewedAt ?? null,
    reviewedBy: result.reviewedBy ?? null,
  });
}

type AdminProfileUpdatePayload = {
  name?: unknown;
  age?: unknown;
  location?: unknown;
  email?: unknown;
  gender?: unknown;
  images?: unknown;
  formFields?: unknown;
};

type PersistedFormFields = Record<string, string | string[]>;

const sanitizeText = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const sanitizeImages = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
};

const sanitizeEmail = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const sanitizeGender = (value: unknown) => {
  const normalized = sanitizeText(value).toLowerCase();
  return normalized === "girl" || normalized === "trans" ? normalized : "";
};

const sanitizeFormFields = (input: unknown): PersistedFormFields => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const fields: PersistedFormFields = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (key === "password") continue;

    if (typeof value === "string") {
      fields[key] = value.trim();
      continue;
    }

    if (Array.isArray(value)) {
      fields[key] = value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return fields;
};

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertAdmin();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const type = getType(req);
  if (!type) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  let payload: AdminProfileUpdatePayload;
  try {
    payload = (await req.json()) as AdminProfileUpdatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = sanitizeText(payload.name);
  const location = sanitizeText(payload.location);
  const email = sanitizeEmail(payload.email);
  const gender = sanitizeGender(payload.gender);
  const age = Number(payload.age);
  const images = sanitizeImages(payload.images);
  const formFields = sanitizeFormFields(payload.formFields);
  const imagePublicIds = deriveCloudinaryPublicIds(images);

  if (!name || !location || !Number.isFinite(age)) {
    return NextResponse.json(
      { error: "Name, age, and location are required." },
      { status: 400 }
    );
  }

  if (images.length < 1) {
    return NextResponse.json(
      { error: "At least 1 image is required." },
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
  const _id = new ObjectId(id);

  const result = await db.collection(type).findOneAndUpdate(
    { _id },
    {
      $set: {
        name,
        age,
        location,
        ...(email ? { email } : {}),
        ...(gender ? { gender } : {}),
        images,
        imagePublicIds,
        formFields,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    profile: {
      _id: result._id.toString(),
      name: typeof result.name === "string" ? result.name : "",
      age: typeof result.age === "number" ? result.age : null,
      location: typeof result.location === "string" ? result.location : "",
      email: typeof result.email === "string" ? result.email : "",
      gender: typeof result.gender === "string" ? result.gender : "",
      images: Array.isArray(result.images)
        ? result.images.filter((item: unknown) => typeof item === "string")
        : [],
      formFields: sanitizeFormFields(result.formFields),
    },
  });
}
