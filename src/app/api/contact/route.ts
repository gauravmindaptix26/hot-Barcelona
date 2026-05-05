import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";

const fallbackSupportEmail = "Support@hotbarcelona.com";

type ContactRequestRecord = {
  fullName: string;
  email: string;
  location: string;
  purpose: string;
  message: string;
  createdAt: Date;
  delivered: boolean;
  deliveryMode: string;
  deliveryError?: string;
};

function parseEmailList(raw: string) {
  return raw
    .split(/[;,]/g)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function readRecipientEmails() {
  const configured =
    process.env.CONTACT_TO_EMAIL?.trim() || process.env.ADMIN_EMAILS?.trim() || "";
  const emails = parseEmailList(configured);
  if (emails.length > 0) {
    return Array.from(new Set(emails)).slice(0, 5);
  }
  return [fallbackSupportEmail];
}

function readClientIpKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "local";
}

let contactIndexesPromise: Promise<void> | undefined;

async function getContactRequestsCollection() {
  const { getDb } = await import("@/lib/db");
  const db = await getDb();
  const collection = db.collection<ContactRequestRecord>("contact_requests");

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
  company: z.string().trim().optional(),
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

async function logContactRequest(record: ContactRequestRecord) {
  try {
    const collection = await getContactRequestsCollection();
    await collection.insertOne(record);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const ipKey = readClientIpKey(request);
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

  const { fullName, email, location, purpose, message, company } = parsed.data;
  if (typeof company === "string" && company.length > 0) {
    return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
  }

  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");
  const debugEnabled = process.env.NODE_ENV !== "production";
  const recipients = readRecipientEmails();

  try {
    const results: Array<{ sent: boolean; mode: string; error?: string }> = [];

    for (const recipient of recipients) {
      try {
        const emailResult = await sendEmail({
          to: recipient,
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
        results.push({ sent: emailResult.sent, mode: emailResult.mode });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.push({ sent: false, mode: "error", error: errorMessage });
      }
    }

    const delivered = results.some((result) => result.sent);
    const deliveryMode =
      results.find((result) => result.sent)?.mode ??
      results.find((result) => result.mode !== "error")?.mode ??
      "unconfigured";
    const deliveryError = results.find((result) => result.error)?.error;

    if (!delivered) {
      const logged = await logContactRequest({
        fullName,
        email,
        location,
        purpose,
        message,
        createdAt: new Date(),
        delivered: false,
        deliveryMode,
        ...(deliveryError ? { deliveryError: deliveryError.slice(0, 800) } : {}),
      });

      if (!logged) {
        return NextResponse.json(
          {
            error: "Unable to send your request right now. Please try again later.",
            ...(debugEnabled && deliveryError ? { debug: deliveryError } : {}),
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: "Your request has been received. Our concierge will reply soon.",
      });
    }

    void logContactRequest({
      fullName,
      email,
      location,
      purpose,
      message,
      createdAt: new Date(),
      delivered: true,
      deliveryMode,
      ...(deliveryError ? { deliveryError: deliveryError.slice(0, 800) } : {}),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[contact] email delivery failed:", errorMessage);
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
