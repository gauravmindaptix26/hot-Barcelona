type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

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

async function sendViaResend(params: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, mode: "unconfigured" as const };
  }

  const from = process.env.RESEND_FROM?.trim() || process.env.EMAIL_FROM?.trim();
  if (!from) {
    throw new Error("RESEND_FROM (or EMAIL_FROM) is not set");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      reply_to: params.replyTo ? [params.replyTo] : undefined,
    }),
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 400);
    throw new Error(
      `Resend failed (${response.status})${details ? `: ${details}` : ""}`
    );
  }

  return { sent: true, mode: "resend" as const };
}

export async function sendEmail(params: SendEmailParams) {
  // Prefer the existing webhook when configured.
  if (
    process.env.EMAIL_WEBHOOK_URL?.trim() ||
    process.env.PASSWORD_RESET_WEBHOOK_URL?.trim()
  ) {
    return sendViaWebhook(params);
  }

  // Otherwise use Resend if configured.
  if (process.env.RESEND_API_KEY?.trim()) {
    return sendViaResend(params);
  }

  return { sent: false, mode: "unconfigured" as const };
}

// Backwards-compatible export for existing imports.
export async function sendEmailViaWebhook(params: SendEmailParams) {
  return sendEmail(params);
}
