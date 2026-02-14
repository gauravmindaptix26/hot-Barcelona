import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import { getDb } from "@/lib/db";
import AdminClient from "./AdminClient";

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

  const mapItem = (item: any) => ({
    _id: item._id.toString(),
    name: item.name ?? "",
    age: item.age ?? null,
    location: item.location ?? "",
    images: Array.isArray(item.images) ? item.images : [],
    createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
    createdAtLabel: item.createdAt
      ? `${new Date(item.createdAt)
          .toISOString()
          .replace("T", " ")
          .slice(0, 16)} UTC`
      : "No date",
  });

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white pt-4">
      <AdminClient girls={girls.map(mapItem)} trans={trans.map(mapItem)} />
    </div>
  );
}
