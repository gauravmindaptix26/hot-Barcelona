import { sendEmail } from "@/lib/email";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractEmailAddress(value: string) {
  const match = value.match(/<([^<>@\s]+@[^<>@\s]+)>/);
  return match?.[1]?.trim() || value.trim();
}

function getRegistrationSupportEmail() {
  return (
    process.env.REGISTRATION_SUPPORT_EMAIL?.trim() ||
    (process.env.EMAIL_FROM ? extractEmailAddress(process.env.EMAIL_FROM) : "") ||
    "Support@hotbarcelona.com"
  );
}

export async function sendRegistrationWelcomeEmail(params: {
  name: string;
  email: string;
}) {
  const safeName = escapeHtml(params.name);
  const supportEmail = getRegistrationSupportEmail();
  const safeSupportEmail = escapeHtml(supportEmail);

  return sendEmail({
    to: params.email,
    subject: "Welcome to Hot Barcelona",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#171717">
        <h2>Welcome to Hot Barcelona</h2>
        <p>Hello ${safeName},</p>
        <p>Your account has been created successfully.</p>
        <p>This email confirms that your address was used to register on Hot Barcelona.</p>
        <p>If you did not create this account, please contact us at <a href="mailto:${safeSupportEmail}">${safeSupportEmail}</a>.</p>
        <p>Hot Barcelona</p>
      </div>
    `,
    text: [
      "Welcome to Hot Barcelona",
      "",
      `Hello ${params.name},`,
      "",
      "Your account has been created successfully.",
      "This email confirms that your address was used to register on Hot Barcelona.",
      "",
      `If you did not create this account, please contact us at ${supportEmail}.`,
      "",
      "Hot Barcelona",
    ].join("\n"),
  });
}
