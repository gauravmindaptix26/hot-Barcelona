import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MongoServerError } from "mongodb";
import { ensureUsersIndexes, getDb } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { sendRegistrationWelcomeEmail } from "@/lib/registration-email";

function getFirstFieldError(fieldErrors: Record<string, string[] | undefined>) {
  for (const messages of Object.values(fieldErrors)) {
    if (messages?.[0]) {
      return messages[0];
    }
  }

  return "Registration failed";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request: Request) {
  const limiter = rateLimit(`register:${request.headers.get("x-forwarded-for") ?? "local"}`, 5, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: getFirstFieldError(fieldErrors) },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  await ensureUsersIndexes();
  const db = await getDb();
  const users = db.collection("users");
  const trimmedName = name.trim();
  const normalizedName = trimmedName.toLowerCase();
  const normalizedEmail = email.toLowerCase();

  const [existingEmail, existingUsername] = await Promise.all([
    users.findOne({ email: normalizedEmail }, { projection: { _id: 1 } }),
    users.findOne(
      {
        $or: [
          { nameKey: normalizedName },
          { name: { $regex: `^${escapeRegex(trimmedName)}$`, $options: "i" } },
        ],
      },
      { projection: { _id: 1 } }
    ),
  ]);

  if (existingEmail) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  if (existingUsername) {
    return NextResponse.json({ error: "Username already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await users.insertOne({
      name: trimmedName,
      nameKey: normalizedName,
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date(),
    });

    try {
      await sendRegistrationWelcomeEmail({
        name: trimmedName,
        email: normalizedEmail,
      });
    } catch (error) {
      console.error(
        "[register] welcome email failed:",
        error instanceof Error ? error.message : String(error)
      );
    }

    return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      if (error.message.includes("nameKey")) {
        return NextResponse.json({ error: "Username already in use" }, { status: 409 });
      }

      if (error.message.includes("email")) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    throw error;
  }
}
