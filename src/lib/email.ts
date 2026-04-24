type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

export async function sendEmailViaWebhook(params: SendEmailParams) {
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
