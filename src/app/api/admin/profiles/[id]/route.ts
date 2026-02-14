import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

const allowedCollections = new Set(["girls", "trans"]);

async function assertAdmin(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return null;
  }
  return session;
}

function getType(req: Request) {
  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "").toLowerCase();
  return allowedCollections.has(type) ? type : null;
}

function extractPublicId(url: string) {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    let publicParts = parts.slice(uploadIndex + 1);
    if (publicParts.length === 0) return null;
    if (/^v\d+$/.test(publicParts[0])) {
      publicParts = publicParts.slice(1);
    }
    if (publicParts.length === 0) return null;
    const withExt = publicParts.join("/");
    return withExt.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

async function deleteFromCloudinary(urls: string[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  for (const url of urls) {
    const publicId = extractPublicId(url);
    if (!publicId) continue;
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);

    try {
      await fetch(endpoint, { method: "POST", body: formData });
    } catch {
      // ignore cloudinary errors
    }
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await assertAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const type = getType(req);
  if (!type) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const db = await getDb();
  const _id = new ObjectId(id);
  const doc = await db.collection(type).findOne({ _id });
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const images = Array.isArray(doc.images)
    ? doc.images.filter((item: unknown) => typeof item === "string")
    : [];

  await db.collection(type).deleteOne({ _id });
  if (images.length > 0) {
    await deleteFromCloudinary(images);
  }

  return NextResponse.json({ ok: true });
}
