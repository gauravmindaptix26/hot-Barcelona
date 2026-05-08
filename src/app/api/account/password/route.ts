import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { ensureUsersIndexes, getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm the new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match.",
    path: ["confirmPassword"],
  });

const passwordCollections = ["users", "girls", "trans"] as const;
type PasswordAccountDoc = {
  _id: ObjectId;
  passwordHash?: unknown;
};

export async function POST(request: Request) {
  const session = await getAppServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limiter = rateLimit(`account:password:${session.user.id}`, 5, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = changePasswordSchema.safeParse(rawBody);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: "New password must be different from current password." },
      { status: 400 }
    );
  }

  if (!ObjectId.isValid(session.user.id)) {
    return NextResponse.json({ error: "Invalid user session." }, { status: 400 });
  }

  void ensureUsersIndexes();
  const db = await getDb();
  const userId = new ObjectId(session.user.id);
  const sessionEmail = session.user.email?.trim().toLowerCase() ?? "";
  let account:
    | {
        collection: (typeof passwordCollections)[number];
        doc: PasswordAccountDoc;
      }
    | null = null;

  for (const collection of passwordCollections) {
    const doc = await db.collection(collection).findOne({
      isDeleted: { $ne: true },
      $or: sessionEmail ? [{ _id: userId }, { email: sessionEmail }] : [{ _id: userId }],
    });
    if (doc?._id instanceof ObjectId) {
      account = { collection, doc };
      break;
    }
  }

  const passwordHash = typeof account?.doc?.passwordHash === "string" ? account.doc.passwordHash : "";
  if (!account?.doc || !passwordHash) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, passwordHash);
  if (!isCurrentPasswordValid) {
    return NextResponse.json(
      { error: "Current password is incorrect." },
      { status: 400 }
    );
  }

  const nextHash = await bcrypt.hash(newPassword, 12);
  await db.collection(account.collection).updateOne(
    { _id: account.doc._id },
    {
      $set: {
        passwordHash: nextHash,
        passwordUpdatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ ok: true });
}
