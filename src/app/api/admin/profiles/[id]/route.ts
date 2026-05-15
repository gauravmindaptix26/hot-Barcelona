import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import {
  deriveCloudinaryPublicIds,
  extractCloudinaryPublicId,
} from "@/lib/cloudinary";
import {
  normalizeImageApprovals,
  type ImageApprovals,
} from "@/lib/profile-images";
import {
  sendProfileApprovedEmail,
  sendProfileRejectedEmail,
  sendPhotosRejectedEmail,
} from "@/lib/advertiser-emails";

const allowedCollections = new Set(["girls", "trans"]);
const allowedActions = new Set(["accept", "reject"]);

const readEmail = (value: unknown) =>
  typeof value === "string" && value.trim().includes("@")
    ? value.trim().toLowerCase()
    : "";

const readName = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : "Advertiser";

async function assertAdmin() {
  const session = await getAppServerSession();
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
  revalidateProfilePages();

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
  revalidateProfilePages();

  if (approvalStatus === "approved") {
    await sendProfileApprovedEmail({
      name: readName(result.name),
      email: readEmail(result.email),
    });
  } else if (approvalStatus === "rejected") {
    await sendProfileRejectedEmail({
      name: readName(result.name),
      email: readEmail(result.email),
    });
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
  imageApprovals?: unknown;
  formFields?: unknown;
};

type PersistedFormFields = Record<string, string | string[]>;

function revalidateProfilePages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/girls");
  revalidatePath("/trans-escorts");
  revalidatePath("/api/latest-profiles");
  revalidatePath("/api/premium-vip-profiles");
  revalidatePath("/api/premium-banner-profiles");
  revalidatePath("/api/premium-superior-profiles");
  revalidatePath("/profile/me");
  revalidatePath("/registro-escorts");
  revalidatePath("/my-ad");
  revalidateTag("girls-public-profiles", { expire: 0 });
  revalidateTag("trans-public-profiles", { expire: 0 });
}

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

const rateFieldKeys = new Set(["rate20", "rate30", "rate45", "rate60"]);
const euroPattern = new RegExp(String.fromCharCode(0x20ac), "g");
const normalizeRateValue = (key: string, value: string) =>
  rateFieldKeys.has(key) ? value.replace(euroPattern, "🌹") : value;

const sanitizeFormFields = (input: unknown): PersistedFormFields => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const fields: PersistedFormFields = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (key === "password" || key.toLowerCase().includes("email")) continue;

    if (typeof value === "string") {
      fields[key] = normalizeRateValue(key, value.trim());
      continue;
    }

    if (Array.isArray(value)) {
      fields[key] = value
        .filter((item): item is string => typeof item === "string")
        .map((item) => normalizeRateValue(key, item.trim()))
        .filter(Boolean);
    }
  }

  return fields;
};

const syncCanonicalFormFields = ({
  formFields,
  name,
  age,
  location,
  gender,
}: {
  formFields: PersistedFormFields;
  name: string;
  age: number;
  location: string;
  gender: string;
}): PersistedFormFields => {
  const next: PersistedFormFields = { ...formFields };

  next.stageName = name;
  next.age = String(age);
  next.address = location;

  delete next.email;

  if (gender) {
    next.gender = gender;
  } else {
    delete next.gender;
  }

  return next;
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
  const imageApprovals = normalizeImageApprovals(payload.imageApprovals);
  const formFields = syncCanonicalFormFields({
    formFields: sanitizeFormFields(payload.formFields),
    name,
    age,
    location,
    gender,
  });
  const imagePublicIds = deriveCloudinaryPublicIds(images);
  const syncedImageApprovals: ImageApprovals = {};
  for (const image of images) {
    syncedImageApprovals[image] = imageApprovals[image] ?? "pending";
  }

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

  // Fetch current approvals before update so we can detect newly-rejected photos
  const currentDoc = await db
    .collection(type)
    .findOne({ _id }, { projection: { imageApprovals: 1 } });
  const oldApprovals = normalizeImageApprovals(currentDoc?.imageApprovals);

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
        imageApprovals: syncedImageApprovals,
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
  revalidateProfilePages();

  // Notify advertiser about newly-rejected photos (photo number = position in images array)
  const newlyRejectedNumbers = images
    .map((url, i) => ({ url, position: i + 1 }))
    .filter(
      ({ url }) =>
        syncedImageApprovals[url] === "rejected" && oldApprovals[url] !== "rejected"
    )
    .map(({ position }) => position);

  if (newlyRejectedNumbers.length > 0) {
    await sendPhotosRejectedEmail({
      name: readName(result.name),
      email: readEmail(result.email),
      rejectedPhotoNumbers: newlyRejectedNumbers,
      totalPhotos: images.length,
    });
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
      imageApprovals: normalizeImageApprovals(result.imageApprovals),
      formFields: sanitizeFormFields(result.formFields),
    },
  });
}
