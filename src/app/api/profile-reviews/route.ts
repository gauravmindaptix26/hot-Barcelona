import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

type ProfileType = "girls" | "trans" | "profiles";
type ReviewApprovalStatus = "pending" | "approved" | "rejected";

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

const toApprovalStatus = (value: unknown): ReviewApprovalStatus => {
  if (value === "approved" || value === "rejected") return value;
  return "pending";
};

const buildReviewSummary = async (
  profileId: string,
  profileType: ProfileType,
  currentUserId?: string
) => {
  const db = await getDb();
  const [ratingDocs, reviewDocs] = await Promise.all([
    db
      .collection("profile_ratings")
      .find(
        {
          profileId,
          profileType,
          isDeleted: { $ne: true },
        },
        {
          projection: {
            rating: 1,
          },
        }
      )
      .toArray(),
    db
    .collection("profile_reviews")
    .find({
      profileId,
      profileType,
      isDeleted: { $ne: true },
      approvalStatus: "approved",
    }, {
      projection: {
        _id: 1,
        userName: 1,
        rating: 1,
        comment: 1,
        createdAt: 1,
      },
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray(),
  ]);

  let totalRating = 0;
  for (const doc of ratingDocs) {
    totalRating += toSafeRating(doc.rating) ?? 0;
  }

  const reviews: SummaryReview[] = reviewDocs.map((doc) => {
    const rating = toSafeRating(doc.rating) ?? 0;
    return {
      id: doc._id.toString(),
      userName: toSafeText(doc.userName, 80) || "User",
      rating,
      comment: toSafeText(doc.comment, 500),
      createdAt:
        doc.createdAt instanceof Date ? doc.createdAt.toISOString() : null,
    };
  });

  const totalRatings = ratingDocs.length;
  const totalReviews = reviews.length;
  const averageRating =
    totalRatings > 0 ? Number((totalRating / totalRatings).toFixed(1)) : 0;

  const [myDoc, myRatingDoc] = await Promise.all([
    currentUserId
      ? db.collection("profile_reviews").findOne(
        {
          profileId,
          profileType,
          userId: currentUserId,
          isDeleted: { $ne: true },
        },
        {
          projection: {
            rating: 1,
            comment: 1,
            approvalStatus: 1,
          },
        }
      )
      : null,
    currentUserId
      ? db.collection("profile_ratings").findOne(
          {
            profileId,
            profileType,
            userId: currentUserId,
            isDeleted: { $ne: true },
          },
          {
            projection: {
              rating: 1,
            },
          }
        )
      : null,
  ]);

  const myReview = myDoc
    ? {
        rating: toSafeRating(myDoc.rating) ?? 0,
        comment: toSafeText(myDoc.comment, 500),
        approvalStatus: toApprovalStatus(myDoc.approvalStatus),
      }
    : null;

  return {
    averageRating,
    totalRatings,
    totalReviews,
    reviews,
    myReview,
    myRating: myRatingDoc ? toSafeRating(myRatingDoc.rating) : null,
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

  const session = await getAppServerSession();
  const summary = await buildReviewSummary(
    profileId,
    profileType,
    session?.user?.accountType === "user" ? session.user.id : undefined
  );

  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const session = await getAppServerSession();
  let payload: {
    mode?: string;
    profileId?: string;
    profileType?: string;
    rating?: number;
    comment?: string;
  };
  try {
    payload = (await req.json()) as {
      mode?: string;
      profileId?: string;
      profileType?: string;
      rating?: number;
      comment?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const mode = payload.mode === "review" ? "review" : "rating";
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

  if (!session?.user?.id || !session.user.email || session.user.accountType !== "user") {
    return NextResponse.json(
      { error: "Please register and login as a user to submit feedback." },
      { status: 401 }
    );
  }

  const db = await getDb();
  const user = ObjectId.isValid(session.user.id)
    ? await db.collection("users").findOne(
        { _id: new ObjectId(session.user.id) },
        { projection: { _id: 1 } }
      )
    : null;
  if (!user) {
    return NextResponse.json(
      { error: "Please register and login as a user to submit feedback." },
      { status: 403 }
    );
  }

  if (mode === "review") {
    if (comment.length < 3) {
      return NextResponse.json(
        { error: "Comment must be at least 3 characters." },
        { status: 400 }
      );
    }

    const limiter = rateLimit(`profile-review:${session.user.id}`, 20, 60_000);
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }
  } else {
    if (!rating) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    const limiter = rateLimit(`profile-rating:${session.user.id}`, 20, 60_000);
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429 }
      );
    }
  }

  try {
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
    const target = await db
      .collection(profileType)
      .findOne(targetQuery, { projection: { _id: 1 } });
    if (!target) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    const now = new Date();

    if (mode === "rating") {
      if (!rating) {
        return NextResponse.json(
          { error: "Rating must be between 1 and 5." },
          { status: 400 }
        );
      }

      await db.collection("profile_ratings").updateOne(
        {
          profileId,
          profileType,
          userId: session.user.id,
          isDeleted: { $ne: true },
        },
        {
          $set: {
            rating,
            updatedAt: now,
            isDeleted: false,
          },
          $setOnInsert: {
            profileId,
            profileType,
            userId: session.user.id,
            userEmail: session.user.email,
            createdAt: now,
          },
        },
        { upsert: true }
      );

      const summary = await buildReviewSummary(
        profileId,
        profileType,
        session.user.id
      );
      return NextResponse.json({ ok: true, ...summary });
    }

    const userName = toSafeText(session.user.name, 80) || "User";

    await db.collection("profile_reviews").updateOne(
      {
        profileId,
        profileType,
        userId: session.user.id,
        isDeleted: { $ne: true },
      },
      {
        $set: {
          ...(rating ? { rating } : {}),
          comment,
          approvalStatus: "pending",
          userName,
          userEmail: session.user.email,
          updatedAt: now,
          reviewedAt: null,
          reviewedBy: null,
          isDeleted: false,
        },
        $setOnInsert: {
          profileId,
          profileType,
          userId: session.user.id,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const summary = await buildReviewSummary(
      profileId,
      profileType,
      session.user.id
    );
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    console.error("Failed to save profile feedback", error);
    return NextResponse.json(
      { error: "Failed to save feedback. Please try again." },
      { status: 500 }
    );
  }
}
