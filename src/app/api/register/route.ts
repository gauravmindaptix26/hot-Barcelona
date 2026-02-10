import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limiter = rateLimit(`register:${request.headers.get("x-forwarded-for") ?? "local"}`, 5, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { name, email, password, gender } = parsed.data;
  const db = await getDb();
  const normalizedEmail = email.toLowerCase();

  const existing = await db.collection("users").findOne({ email: normalizedEmail });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await db.collection("users").insertOne({
    name,
    email: normalizedEmail,
    passwordHash,
    gender,
    createdAt: new Date(),
  });

  return NextResponse.json({ id: result.insertedId.toString() }, { status: 201 });
}
