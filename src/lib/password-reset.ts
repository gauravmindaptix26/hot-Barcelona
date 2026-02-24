import { createHash, randomBytes } from "crypto";

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

  const webhookUrl = process.env.PASSWORD_RESET_WEBHOOK_URL?.trim();

  // Optional webhook integration for real email sending.
  if (webhookUrl) {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: toEmail,
        subject: "Reset your Hot Barcelona password",
        html: `
          <p>You requested a password reset.</p>
          <p><a href="${resetUrl}">Click here to reset your password</a></p>
          <p>This link expires in 30 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
        text: `Reset your password: ${resetUrl} (expires in 30 minutes)`,
      }),
    });

    if (!response.ok) {
      throw new Error(`Password reset webhook failed (${response.status})`);
    }

    return { sent: true, mode: "webhook" as const };
  }

  // Dev fallback when no email service is configured.
  console.info("[password-reset] Send this link to user:", {
    toEmail,
    resetUrl,
  });

  return { sent: false, mode: "debug" as const };
}
