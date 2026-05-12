import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import {
  createPasswordChangeCode,
  sendPasswordChangeCodeEmail,
} from "@/lib/password-change-code";

const accountCollections = new Set(["users", "girls", "trans"]);

function getSessionAccountCollection(session: Awaited<ReturnType<typeof getAppServerSession>>) {
  if (
    session?.user.accountType === "advertiser" &&
    (session.user.advertiserType === "girls" || session.user.advertiserType === "trans")
  ) {
    return session.user.advertiserType;
  }
  return "users";
}

export async function POST() {
  const session = await getAppServerSession();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const limiter = rateLimit(`account:password-code:${session.user.id}`, 3, 60_000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many code requests. Try again in a minute." },
      { status: 429 }
    );
  }

  if (!ObjectId.isValid(session.user.id)) {
    return NextResponse.json({ error: "Invalid user session." }, { status: 400 });
  }

  const accountType = getSessionAccountCollection(session);
  if (!accountCollections.has(accountType)) {
    return NextResponse.json({ error: "Invalid account session." }, { status: 400 });
  }

  const db = await getDb();
  const userId = new ObjectId(session.user.id);
  const email = session.user.email.trim().toLowerCase();
  const account = await db.collection(accountType).findOne(
    {
      _id: userId,
      email,
      isDeleted: { $ne: true },
    },
    { projection: { _id: 1 } }
  );

  if (!account?._id) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const { rawCode, codeHash, expiresAt } = createPasswordChangeCode();

  await db.collection("password_change_codes").deleteMany({
    userId,
    accountType,
    usedAt: null,
  });

  await db.collection("password_change_codes").insertOne({
    userId,
    accountType,
    email,
    codeHash,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  });

  let debugCode: string | undefined;
  try {
    const emailResult = await sendPasswordChangeCodeEmail({
      toEmail: email,
      code: rawCode,
    });
    if (emailResult.mode === "debug" && process.env.NODE_ENV !== "production") {
      debugCode = rawCode;
    }
  } catch {
    return NextResponse.json(
      { error: "Unable to send code right now. Please try again later." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Password change code sent to your email.",
    ...(debugCode ? { debugCode } : {}),
  });
}
