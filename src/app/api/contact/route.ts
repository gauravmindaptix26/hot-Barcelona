import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmailViaWebhook } from "@/lib/email";

const supportEmail = "support@hot-barcelona.com";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("A valid email is required."),
  location: z.string().trim().min(2, "Location is required."),
  purpose: z.string().trim().min(2, "Please select a contact purpose."),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must consent to discreet communication before sending.",
    }),
  }),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const ipKey = request.headers.get("x-forwarded-for") ?? "local";
  const limiter = rateLimit(`contact:${ipKey}`, 5, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many contact requests. Try again later." },
      { status: 429 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid form submission." },
      { status: 400 }
    );
  }

  const { fullName, email, location, purpose, message } = parsed.data;
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  try {
    const emailResult = await sendEmailViaWebhook({
      to: supportEmail,
      replyTo: email,
      subject: `Contact Form: ${purpose} - ${fullName}`,
      html: `
        <h2>New contact request</h2>
        <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Location:</strong> ${escapeHtml(location)}</p>
        <p><strong>Purpose:</strong> ${escapeHtml(purpose)}</p>
        <p><strong>Message:</strong><br />${safeMessage}</p>
      `,
      text: [
        "New contact request",
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Location: ${location}`,
        `Purpose: ${purpose}`,
        "Message:",
        message,
      ].join("\n"),
    });

    if (!emailResult.sent) {
      return NextResponse.json(
        {
          error:
            "Contact email is not configured yet. Add EMAIL_WEBHOOK_URL to enable form delivery.",
        },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Unable to send your request right now. Please try again later." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Your details have been sent to our support team.",
  });
}
