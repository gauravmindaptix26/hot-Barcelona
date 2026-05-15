import { NextRequest, NextResponse } from "next/server";
import { getAppServerSession } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { getDb } from "@/lib/db";
import { normalizeImageApprovals, readImageArray } from "@/lib/profile-images";

const allowedCollections = new Set(["girls", "trans"]);
const PAGE_SIZE = 50;

type PersistedFormFields = Record<string, string | string[]>;

const parseIsoDate = (value: unknown): string | null => {
  if (
    !(value instanceof Date) &&
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

const normalizeFormFields = (value: unknown): PersistedFormFields => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const next: PersistedFormFields = {};
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === "string") {
      next[key] = raw.trim();
      continue;
    }
    if (Array.isArray(raw)) {
      next[key] = raw
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return next;
};

const normalizeApprovalStatus = (
  value: unknown
): "pending" | "approved" | "rejected" => {
  if (value === "pending" || value === "rejected") return value;
  return "approved";
};

export async function GET(req: NextRequest) {
  const session = await getAppServerSession();
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const type = (url.searchParams.get("type") ?? "").toLowerCase();
  if (!allowedCollections.has(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const skip = Math.max(
    0,
    parseInt(url.searchParams.get("skip") ?? "0", 10) || 0
  );

  const adminProjection = {
    projection: {
      name: 1,
      age: 1,
      location: 1,
      email: 1,
      gender: 1,
      images: 1,
      imageApprovals: 1,
      formFields: 1,
      createdAt: 1,
      approvalStatus: 1,
    },
  } as const;

  const db = await getDb();
  const [items, total] = await Promise.all([
    db
      .collection(type)
      .find({}, adminProjection)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray(),
    db.collection(type).countDocuments(),
  ]);

  const mapped = items.map((item) => {
    const createdAtIso = parseIsoDate(item.createdAt);
    return {
      _id: item._id.toString(),
      name: typeof item.name === "string" ? item.name : "",
      age: typeof item.age === "number" ? item.age : null,
      location: typeof item.location === "string" ? item.location : "",
      email: typeof item.email === "string" ? item.email : "",
      gender: typeof item.gender === "string" ? item.gender : "",
      images: readImageArray(item.images),
      imageApprovals: normalizeImageApprovals(item.imageApprovals),
      formFields: normalizeFormFields(item.formFields),
      approvalStatus: normalizeApprovalStatus(item.approvalStatus),
      createdAt: createdAtIso,
      createdAtLabel: createdAtIso
        ? `${createdAtIso.replace("T", " ").slice(0, 16)} UTC`
        : "No date",
    };
  });

  return NextResponse.json({ items: mapped, total, skip, limit: PAGE_SIZE });
}
