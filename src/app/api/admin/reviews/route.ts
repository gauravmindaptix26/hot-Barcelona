import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/admin";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

type ApprovalStatus = "pending" | "approved" | "rejected";

const normalizeReviewApprovalStatus = (value: unknown): ApprovalStatus => {
  if (value === "approved" || value === "rejected") {
    return value;
  }
  return "pending";
};

const parseIsoDate = (value: unknown): string | null => {
  if (
    !(value instanceof Date) &&
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

export async function GET() {
  const session = await getAppServerSession();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const db = await getDb();
  const reviews = await db
    .collection("profile_reviews")
    .find(
      { isDeleted: { $ne: true } },
      {
        projection: {
          profileId: 1,
          profileType: 1,
          userName: 1,
          userEmail: 1,
          rating: 1,
          comment: 1,
          approvalStatus: 1,
          createdAt: 1,
        },
      }
    )
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  return NextResponse.json({
    reviews: reviews.map((item) => {
      const createdAtIso = parseIsoDate(item.createdAt);
      return {
        _id: item._id.toString(),
        profileId: typeof item.profileId === "string" ? item.profileId : "",
        profileType: typeof item.profileType === "string" ? item.profileType : "",
        userName: typeof item.userName === "string" ? item.userName : "User",
        userEmail: typeof item.userEmail === "string" ? item.userEmail : "",
        rating: typeof item.rating === "number" ? item.rating : 0,
        comment: typeof item.comment === "string" ? item.comment : "",
        approvalStatus: normalizeReviewApprovalStatus(item.approvalStatus),
        createdAt: createdAtIso,
        createdAtLabel: createdAtIso
          ? `${createdAtIso.replace("T", " ").slice(0, 16)} UTC`
          : "No date",
      };
    }),
  });
}
