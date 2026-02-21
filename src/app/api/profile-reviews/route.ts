import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type ProfileType = "girls" | "trans" | "profiles";

type SummaryReview = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string | null;
};

const allowedTypes = new Set<ProfileType>(["girls", "trans", "profiles"]);

const toProfileType = (value: string | null): ProfileType | null => {
  if (value === "girls" || value === "trans" || value === "profiles") {
    return value;
  }
  return null;
};

const toSafeRating = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }
  return parsed;
};

const toSafeText = (value: unknown, maxLength = 500) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const buildReviewSummary = async (
  profileId: string,
  profileType: ProfileType,
  currentUserId?: string
) => {
  const db = await getDb();
  const docs = await db
    .collection("profile_reviews")
    .find({
      profileId,
      profileType,
      isDeleted: { $ne: true },
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  let totalRating = 0;
  const reviews: SummaryReview[] = docs.map((doc) => {
    const rating = toSafeRating(doc.rating) ?? 0;
    totalRating += rating;
    return {
      id: doc._id.toString(),
      userName: toSafeText(doc.userName, 80) || "User",
      rating,
      comment: toSafeText(doc.comment, 500),
      createdAt:
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    };
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(1)) : 0;

  const myDoc =
    currentUserId
      ? docs.find((doc) => toSafeText(doc.userId, 100) === currentUserId)
      : null;

  const myReview = myDoc
    ? {
        rating: toSafeRating(myDoc.rating) ?? 0,
        comment: toSafeText(myDoc.comment, 500),
      }
    : null;

  return {
    averageRating,
    totalReviews,
    reviews,
    myReview,
  };
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const profileId = (url.searchParams.get("profileId") ?? "").trim();
  const profileType = toProfileType(url.searchParams.get("profileType"));

  if (!ObjectId.isValid(profileId) || !profileType) {
    return NextResponse.json(
      { error: "Invalid profileId or profileType." },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const summary = await buildReviewSummary(profileId, profileType, session?.user?.id);

  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json(
      { error: "Login required to post a review." },
      { status: 401 }
    );
  }

  const limiter = rateLimit(`profile-review:${session.user.id}`, 20, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let payload: {
    profileId?: string;
    profileType?: string;
    rating?: number;
    comment?: string;
  };
  try {
    payload = (await req.json()) as {
      profileId?: string;
      profileType?: string;
      rating?: number;
      comment?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const profileId = toSafeText(payload.profileId, 64);
  const profileType = toProfileType(payload.profileType ?? null);
  const rating = toSafeRating(payload.rating);
  const comment = toSafeText(payload.comment, 500);

  if (!ObjectId.isValid(profileId) || !profileType || !allowedTypes.has(profileType)) {
    return NextResponse.json(
      { error: "Invalid profile target." },
      { status: 400 }
    );
  }
  if (!rating) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5." },
      { status: 400 }
    );
  }
  if (comment.length < 3) {
    return NextResponse.json(
      { error: "Comment must be at least 3 characters." },
      { status: 400 }
    );
  }

  const db = await getDb();
  const targetQuery =
    profileType === "profiles"
      ? { _id: new ObjectId(profileId), isComplete: true }
      : {
          _id: new ObjectId(profileId),
          isDeleted: { $ne: true },
          $or: [
            { approvalStatus: "approved" },
            { approvalStatus: { $exists: false } },
          ],
        };
  const target = await db.collection(profileType).findOne(targetQuery);
  if (!target) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const now = new Date();
  const query = {
    profileId,
    profileType,
    userId: session.user.id,
    isDeleted: { $ne: true },
  };

  const existing = await db.collection("profile_reviews").findOne(query);
  if (existing) {
    await db.collection("profile_reviews").updateOne(
      { _id: existing._id },
      {
        $set: {
          rating,
          comment,
          userName: session.user.name ?? "User",
          userEmail: session.user.email,
          updatedAt: now,
        },
      }
    );
  } else {
    await db.collection("profile_reviews").insertOne({
      profileId,
      profileType,
      userId: session.user.id,
      userName: session.user.name ?? "User",
      userEmail: session.user.email,
      rating,
      comment,
      createdAt: now,
      updatedAt: now,
    });
  }

  const summary = await buildReviewSummary(profileId, profileType, session.user.id);
  return NextResponse.json({ ok: true, ...summary });
}
