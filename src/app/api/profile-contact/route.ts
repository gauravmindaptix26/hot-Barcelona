import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { buildWhatsAppHrefFromFields } from "@/lib/profile-contact";

const allowedCollections = new Set(["girls", "trans"]);

const readFormFields = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export async function GET(request: NextRequest) {
  const session = await getAppServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const type = (request.nextUrl.searchParams.get("type") ?? "").toLowerCase();
  const id = request.nextUrl.searchParams.get("id") ?? "";

  if (!allowedCollections.has(type)) {
    return NextResponse.json({ error: "Invalid type." }, { status: 400 });
  }

  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  }

  const db = await getDb();
  const profile = await db.collection(type).findOne({
    _id: new ObjectId(id),
    isDeleted: { $ne: true },
    $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  const whatsappHref = buildWhatsAppHrefFromFields(readFormFields(profile.formFields));

  return NextResponse.json({
    whatsappHref,
  });
}
