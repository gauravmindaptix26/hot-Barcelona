import { createHash, randomInt } from "crypto";
import { sendEmail } from "./email";

export const PASSWORD_CHANGE_CODE_TTL_MS = 1000 * 60 * 10;

export function createPasswordChangeCode() {
  const rawCode = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = hashPasswordChangeCode(rawCode);
  const expiresAt = new Date(Date.now() + PASSWORD_CHANGE_CODE_TTL_MS);
  return { rawCode, codeHash, expiresAt };
}

export function hashPasswordChangeCode(code: string) {
  return createHash("sha256").update(code.trim()).digest("hex");
}

export async function sendPasswordChangeCodeEmail(params: {
  toEmail: string;
  code: string;
}) {
  const { toEmail, code } = params;

  const emailResult = await sendEmail({
    to: toEmail,
    subject: "Your Hot Barcelona password change code",
    html: `
      <p>Your password change code is:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 6px;">${code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, change your password immediately or contact support.</p>
    `,
    text: `Your Hot Barcelona password change code is ${code}. It expires in 10 minutes.`,
  });

  if (emailResult.sent) {
    return emailResult;
  }

  return { sent: false, mode: "debug" as const };
}
