import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { isAdminEmail } from "@/lib/admin";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function DELETE(
  _req: NextRequest,
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

  const db = await getDb();
  const deleteResult = await db
    .collection("profile_reviews")
    .deleteOne({ _id: new ObjectId(id) });

  if (deleteResult.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateReviewPages();
  return NextResponse.json({ ok: true });
}

const allowedActions = new Set(["accept", "reject"]);

const readEmail = (value: unknown) =>
  typeof value === "string" && value.trim().includes("@")
    ? value.trim().toLowerCase()
    : "";

const readName = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : "User";

const supportEmail =
  process.env.REGISTRATION_SUPPORT_EMAIL?.trim() ||
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
  "support@hot-barcelone.co";

async function sendReviewApprovalEmail(review: unknown) {
  if (!review || typeof review !== "object" || Array.isArray(review)) return;

  const record = review as Record<string, unknown>;
  const to = readEmail(record.userEmail);
  if (!to) return;

  const name = readName(record.userName);
  try {
    await sendEmail({
      to,
      subject: "Your Hot Barcelona feedback has been approved",
      html: `
        <p>Hello ${name},</p>
        <p>Your feedback has been approved by the Hot Barcelona admin team.</p>
        <p>It can now appear in the public review section for the profile you reviewed.</p>
      `,
      text: `Hello ${name}, your feedback has been approved by the Hot Barcelona admin team and can now appear publicly.`,
      replyTo: supportEmail,
    });
  } catch (error) {
    console.error(
      "[admin review approval] email failed:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

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

  if (action === "reject") {
    const deleteResult = await db.collection("profile_reviews").deleteOne({
      _id: new ObjectId(id),
      isDeleted: { $ne: true },
    });

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    revalidateReviewPages();

    return NextResponse.json({
      ok: true,
      approvalStatus,
      deleted: true,
      reviewedAt: now.toISOString(),
      reviewedBy: session.user.email,
    });
  }

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
        isDeleted: false,
      },
    },
    { returnDocument: "after" }
  );

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  revalidateReviewPages();
  await sendReviewApprovalEmail(result);

  return NextResponse.json({
    ok: true,
    approvalStatus,
    reviewedAt: now.toISOString(),
    reviewedBy: session.user.email,
  });
}
