import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email."),
});

export async function POST(request: Request) {
  const ipKey = request.headers.get("x-forwarded-for") ?? "local";
  const limiter = rateLimit(`forgot-password:${ipKey}`, 5, 60_000);
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

  const parsed = forgotPasswordSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const db = await getDb();
  const user = await db.collection("users").findOne({ email });

  // Always return a generic success response to prevent account enumeration.
  if (!user?._id) {
    return NextResponse.json({
      ok: true,
      message:
        "If this email exists, a password reset link has been sent.",
    });
  }

  const { rawToken, tokenHash, expiresAt } = createPasswordResetToken();

  await db.collection("password_reset_tokens").deleteMany({
    userId: user._id,
    usedAt: null,
  });

  await db.collection("password_reset_tokens").insertOne({
    userId: user._id,
    email,
    tokenHash,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  });

  const resetUrl = buildPasswordResetUrl(rawToken);
  let debugResetUrl: string | undefined;
  try {
    const emailResult = await sendPasswordResetEmail({ toEmail: email, resetUrl });
    if (emailResult.mode === "debug" && process.env.NODE_ENV !== "production") {
      debugResetUrl = resetUrl;
    }
  } catch {
    return NextResponse.json(
      { error: "Unable to send reset email right now. Please try again later." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "If this email exists, a password reset link has been sent.",
    ...(debugResetUrl ? { debugResetUrl } : {}),
  });
}
