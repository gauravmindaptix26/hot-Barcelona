import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import { getDb } from "@/lib/db";

const fallbackSupportEmail = "support@hot-barcelona.com";

function readFirstAdminEmail() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  const first = raw
    .split(",")
    .map((value) => value.trim())
    .find(Boolean);
  return first ?? "";
}

const supportEmail =
  process.env.CONTACT_TO_EMAIL?.trim() || readFirstAdminEmail() || fallbackSupportEmail;

let contactIndexesPromise: Promise<void> | undefined;

async function getContactRequestsCollection() {
  const db = await getDb();
  const collection = db.collection("contact_requests");

  contactIndexesPromise ??= collection
    .createIndex(
      { createdAt: 1 },
      {
        name: "contact_requests_createdAt_ttl_180d",
        expireAfterSeconds: 60 * 60 * 24 * 180,
      }
    )
    .then(() => undefined);

  await contactIndexesPromise;
  return collection;
}

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
  const debugEnabled = process.env.NODE_ENV !== "production";

  try {
    const emailResult = await sendEmail({
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
      const collection = await getContactRequestsCollection();
      await collection.insertOne({
        fullName,
        email,
        location,
        purpose,
        message,
        createdAt: new Date(),
        delivered: false,
        deliveryMode: emailResult.mode,
      });

      return NextResponse.json({
        ok: true,
        message: "Your request has been received. Our concierge will reply soon.",
      });
    }

    const collection = await getContactRequestsCollection();
    await collection.insertOne({
      fullName,
      email,
      location,
      purpose,
      message,
      createdAt: new Date(),
      delivered: true,
      deliveryMode: emailResult.mode,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[contact] email delivery failed:", errorMessage);
    try {
      const collection = await getContactRequestsCollection();
      await collection.insertOne({
        fullName,
        email,
        location,
        purpose,
        message,
        createdAt: new Date(),
        delivered: false,
        deliveryMode: "error",
        deliveryError: errorMessage.slice(0, 800),
      });

      return NextResponse.json({
        ok: true,
        message: "Your request has been received. Our concierge will reply soon.",
        ...(debugEnabled ? { debug: errorMessage } : {}),
      });
    } catch {
      // Ignore secondary logging failures.
    }
    return NextResponse.json(
      {
        error: "Unable to send your request right now. Please try again later.",
        ...(debugEnabled ? { debug: errorMessage } : {}),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Your details have been sent to our support team.",
  });
}
