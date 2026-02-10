"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { rateLimit } from "@/lib/rate-limit";

function parseImages(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string");
    }
    return [];
  } catch {
    return [];
  }
}

export async function createOrUpdateProfile(
  _prevState: {
    ok: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  },
  formData: FormData
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false, error: "Unauthorized" };
  }

  if (session.user.gender !== "female") {
    return { ok: false, error: "Forbidden" };
  }

  const limiter = rateLimit(`profile:${session.user.id}`, 10, 60_000);
  if (!limiter.allowed) {
    return { ok: false, error: "Too many attempts. Try again later." };
  }

  const payload = {
    fullName: formData.get("fullName"),
    age: formData.get("age"),
    location: formData.get("location"),
    bio: formData.get("bio"),
    interests: formData.get("interests"),
    images: parseImages(formData.get("images")),
  };

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const db = await getDb();
  const userId = new ObjectId(session.user.id);
  const now = new Date();

  const interests = parsed.data.interests
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const profileDoc = {
    userId,
    fullName: parsed.data.fullName,
    age: parsed.data.age,
    location: parsed.data.location,
    bio: parsed.data.bio,
    interests,
    isComplete: true,
    updatedAt: now,
  };

  const existing = await db.collection("profiles").findOne({ userId });
  if (!existing) {
    const created = await db.collection("profiles").insertOne({
      ...profileDoc,
      createdAt: now,
    });

    await db.collection("profile_images").insertMany(
      parsed.data.images.map((url, index) => ({
        profileId: created.insertedId,
        userId,
        url,
        order: index,
        createdAt: now,
      }))
    );

    return { ok: true, profileId: created.insertedId.toString() };
  }

  await db.collection("profiles").updateOne(
    { _id: existing._id },
    { $set: profileDoc }
  );

  await db.collection("profile_images").deleteMany({ profileId: existing._id });
  await db.collection("profile_images").insertMany(
    parsed.data.images.map((url, index) => ({
      profileId: existing._id,
      userId,
      url,
      order: index,
      createdAt: now,
    }))
  );

  return { ok: true, profileId: existing._id.toString() };
}
