import { createHash, randomBytes } from "crypto";
import { sendEmail } from "./email";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes

export function createPasswordResetToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  return { rawToken, tokenHash, expiresAt };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function buildPasswordResetUrl(token: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    "http://localhost:3000";

  const baseUrl = siteUrl.replace(/\/+$/, "");
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail(params: {
  toEmail: string;
  resetUrl: string;
}) {
  const { toEmail, resetUrl } = params;

  const emailResult = await sendEmail({
    to: toEmail,
    subject: "Reset your Hot Barcelona password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 30 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    `,
    text: `Reset your password: ${resetUrl} (expires in 30 minutes)`,
  });

  if (emailResult.sent) {
    return emailResult;
  }

  // Dev fallback when no email service is configured.
  return { sent: false, mode: "debug" as const };
}
