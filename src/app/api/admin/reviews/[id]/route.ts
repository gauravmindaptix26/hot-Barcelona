import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isAdminEmail } from "@/lib/admin";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";

const allowedActions = new Set(["accept", "reject"]);

async function assertAdmin() {
  const session = await getAppServerSession();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}

function revalidateReviewPages() {
  revalidatePath("/admin");
  revalidatePath("/girls");
  revalidatePath("/trans-escorts");
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

  const now = new Date();
  const approvalStatus = action === "accept" ? "approved" : "rejected";
  const db = await getDb();
  const result = await db.collection("profile_reviews").findOneAndUpdate(
    {
      _id: new ObjectId(id),
      isDeleted: { $ne: true },
    },
    {
      $set: {
        approvalStatus,
        reviewedAt: now,
        reviewedBy: session.user.email,
        isDeleted: action === "reject",
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateReviewPages();

  return NextResponse.json({
    ok: true,
    approvalStatus,
    reviewedAt: now.toISOString(),
    reviewedBy: session.user.email,
  });
}
