import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAppServerSession } from "@/lib/auth";
import { deriveCloudinaryPublicIds } from "@/lib/cloudinary";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  normalizeImageApprovals,
  type ImageApprovals,
} from "@/lib/profile-images";

type AdUpdatePayload = {
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

const sanitizeEmail = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const sanitizeImages = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
};

const sanitizeGender = (value: unknown) => {
  const normalized = sanitizeText(value).toLowerCase();
  return normalized === "trans" ? "trans" : "girl";
};

const sanitizeFormFields = (input: unknown): PersistedFormFields => {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const fields: PersistedFormFields = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (key === "password" || key.toLowerCase().includes("email")) continue;

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
}) => ({
  ...formFields,
  stageName: name,
  age: String(age),
  address: location,
  gender,
});

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

async function sendAwaitingApprovalEmail({
  to,
  name,
}: {
  to: string;
  name: string;
}) {
  if (!to) return;

  try {
    await sendEmail({
      to,
      subject: "Awaiting Approval from Admin",
      html: `
        <p>Hello ${name || "Advertiser"},</p>
        <p>Your profile changes have been received and are awaiting approval from the Hot Barcelona admin team.</p>
        <p>Once approved, the updated information will be available on the website.</p>
      `,
      text: `Hello ${name || "Advertiser"}, your profile changes have been received and are awaiting approval from the Hot Barcelona admin team. Once approved, the updated information will be available on the website.`,
    });
  } catch (error) {
    console.error(
      "[advertiser edit approval] email failed:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function PUT(req: Request) {
  const session = await getAppServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: AdUpdatePayload;
  try {
    payload = (await req.json()) as AdUpdatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const name = sanitizeText(payload.name);
  const email = sanitizeEmail(payload.email) || sanitizeEmail(session.user.email);
  const location = sanitizeText(payload.location);
  const age = Number(payload.age);
  const gender = sanitizeGender(payload.gender);
  const images = sanitizeImages(payload.images);
  const formFields = syncCanonicalFormFields({
    formFields: sanitizeFormFields(payload.formFields),
    name,
    age,
    location,
    gender,
  });
  const imagePublicIds = deriveCloudinaryPublicIds(images);

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
  const userId = ObjectId.isValid(session.user.id)
    ? new ObjectId(session.user.id)
    : null;
  const sessionEmail = sanitizeEmail(session.user.email);
  const collectionName =
    session.user.accountType === "advertiser" && session.user.advertiserType
      ? session.user.advertiserType
      : gender === "trans"
        ? "trans"
        : "girls";

  const existing =
    session.user.accountType === "advertiser" && userId
      ? await db.collection(collectionName).findOne({
          _id: userId,
          isDeleted: { $ne: true },
        })
      : userId
        ? await db.collection(collectionName).findOne({
            userId,
            isDeleted: { $ne: true },
          })
        : sessionEmail
          ? await db.collection(collectionName).findOne({
              email: sessionEmail,
              isDeleted: { $ne: true },
            })
          : null;

  if (!existing?._id) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const previousImageApprovals = normalizeImageApprovals(existing.imageApprovals);
  const syncedImageApprovals: ImageApprovals = {};
  for (const image of images) {
    syncedImageApprovals[image] = previousImageApprovals[image] ?? "pending";
  }

  const now = new Date();
  const result = await db.collection(collectionName).findOneAndUpdate(
    { _id: existing._id },
    {
      $set: {
        name,
        age,
        location,
        email,
        gender,
        images,
        imageApprovals: syncedImageApprovals,
        imagePublicIds,
        formFields,
        approvalStatus: "pending",
        reviewedAt: null,
        reviewedBy: null,
        submittedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  revalidateProfilePages();
  await sendAwaitingApprovalEmail({ to: email, name });

  return NextResponse.json({
    ok: true,
    id: result._id.toString(),
    type: collectionName,
    approvalStatus: "pending",
  });
}
