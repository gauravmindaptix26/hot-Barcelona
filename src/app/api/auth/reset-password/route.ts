import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { hashPasswordResetToken } from "@/lib/password-reset";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export async function POST(request: Request) {
  const ipKey = request.headers.get("x-forwarded-for") ?? "local";
  const limiter = rateLimit(`reset-password:${ipKey}`, 10, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const tokenHash = hashPasswordResetToken(token);
  const now = new Date();

  const db = await getDb();
  const tokenDoc = await db.collection("password_reset_tokens").findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: now },
  });

  if (!tokenDoc?.userId || !(tokenDoc.userId instanceof ObjectId)) {
    return NextResponse.json(
      { error: "Reset link is invalid or expired." },
      { status: 400 }
    );
  }

  const user = await db.collection("users").findOne({ _id: tokenDoc.userId });
  if (!user || typeof user.passwordHash !== "string") {
    return NextResponse.json({ error: "User account not found." }, { status: 404 });
  }

  const sameAsCurrent = await bcrypt.compare(password, user.passwordHash);
  if (sameAsCurrent) {
    return NextResponse.json(
      { error: "Please choose a new password different from the old one." },
      { status: 400 }
    );
  }

  const nextHash = await bcrypt.hash(password, 12);

  await db.collection("users").updateOne(
    { _id: tokenDoc.userId },
    {
      $set: {
        passwordHash: nextHash,
        passwordUpdatedAt: now,
      },
    }
  );

  await db.collection("password_reset_tokens").updateOne(
    { _id: tokenDoc._id },
    {
      $set: {
        usedAt: now,
      },
    }
  );

  await db.collection("password_reset_tokens").deleteMany({
    userId: tokenDoc.userId,
    usedAt: null,
  });

  return NextResponse.json({ ok: true });
}
