import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { getDb } from "@/lib/db";
import AdminClient from "./AdminClient";

type ApprovalStatus = "pending" | "approved" | "rejected";

const normalizeApprovalStatus = (value: unknown): ApprovalStatus => {
  if (value === "pending" || value === "rejected") {
    return value;
  }
  return "approved";
};

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

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/login");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/unauthorized");
  }

  const db = await getDb();
  const [girls, trans] = await Promise.all([
    db
      .collection("girls")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    db
      .collection("trans")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
  ]);

  const mapItem = (item: {
    _id: { toString: () => string };
    name?: unknown;
    age?: unknown;
    location?: unknown;
    images?: unknown;
    createdAt?: unknown;
    approvalStatus?: unknown;
  }) => {
    const createdAtIso = parseIsoDate(item.createdAt);
    return {
    _id: item._id.toString(),
    name: typeof item.name === "string" ? item.name : "",
    age: typeof item.age === "number" ? item.age : null,
    location: typeof item.location === "string" ? item.location : "",
    images: Array.isArray(item.images) ? item.images : [],
    approvalStatus: normalizeApprovalStatus(item.approvalStatus),
    createdAt: createdAtIso,
    createdAtLabel: createdAtIso
      ? `${createdAtIso.replace("T", " ").slice(0, 16)} UTC`
      : "No date",
    };
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white pt-4">
      <AdminClient girls={girls.map(mapItem)} trans={trans.map(mapItem)} />
    </div>
  );
}
