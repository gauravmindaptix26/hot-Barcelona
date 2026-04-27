type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST?.trim());
}

async function sendViaSmtp(params: SendEmailParams) {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    return { sent: false, mode: "unconfigured" as const };
  }

  const rawPort = process.env.SMTP_PORT?.trim() || "587";
  const port = Number(rawPort);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error("SMTP_PORT must be a valid port number");
  }

  const secureFromEnv = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureFromEnv === "true" || (secureFromEnv !== "false" && port === 465);

  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if ((user && !pass) || (!user && pass)) {
    throw new Error("SMTP_USER and SMTP_PASS must be set together");
  }

  const from = process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("EMAIL_FROM is not set");
  }

  // Use `require` to avoid needing TS types and keep this lib server-only.
  // Next.js will still need the dependency installed to bundle it.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodemailer = require("nodemailer") as {
    createTransport: (config: unknown) => {
      sendMail: (mail: unknown) => Promise<unknown>;
    };
  };

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo,
  });

  return { sent: true, mode: "smtp" as const };
}

async function sendViaWebhook(params: SendEmailParams) {
  const webhookUrl =
    process.env.EMAIL_WEBHOOK_URL?.trim() ||
    process.env.PASSWORD_RESET_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return { sent: false, mode: "unconfigured" as const };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Email webhook failed (${response.status})`);
  }

  return { sent: true, mode: "webhook" as const };
}

export async function sendEmail(params: SendEmailParams) {
  // Prefer SMTP (Nodemailer) when configured.
  if (hasSmtpConfig()) {
    return sendViaSmtp(params);
  }

  // Prefer the existing webhook when configured.
  if (
    process.env.EMAIL_WEBHOOK_URL?.trim() ||
    process.env.PASSWORD_RESET_WEBHOOK_URL?.trim()
  ) {
    return sendViaWebhook(params);
  }

  return { sent: false, mode: "unconfigured" as const };
}

// Backwards-compatible export for existing imports.
export async function sendEmailViaWebhook(params: SendEmailParams) {
  return sendEmail(params);
}
