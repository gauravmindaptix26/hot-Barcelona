import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";

type ApprovalStatus = "pending" | "approved" | "rejected";

const normalizeApprovalStatus = (value: unknown): ApprovalStatus => {
  if (value === "pending" || value === "rejected") {
    return value;
  }
  return "approved";
};

type AdDoc = {
  _id: { toString: () => string };
  name?: unknown;
  age?: unknown;
  location?: unknown;
  images?: unknown;
  approvalStatus?: unknown;
};

export default async function MyAdPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const db = await getDb();
  const userId = new ObjectId(session.user.id);

  const [girlsAd, transAd] = await Promise.all([
    db.collection("girls").findOne({ userId, isDeleted: { $ne: true } }),
    db.collection("trans").findOne({ userId, isDeleted: { $ne: true } }),
  ]);

  const mapAd = (doc: AdDoc, type: "girls" | "trans") => ({
    _id: doc._id.toString(),
    type,
    name: typeof doc.name === "string" ? doc.name : "",
    age: typeof doc.age === "number" ? doc.age : null,
    location: typeof doc.location === "string" ? doc.location : "",
    images: Array.isArray(doc.images)
      ? doc.images.filter((item: unknown) => typeof item === "string")
      : [],
    approvalStatus: normalizeApprovalStatus(doc.approvalStatus),
  });

  const ad = girlsAd
    ? mapAd(girlsAd, "girls")
    : transAd
      ? mapAd(transAd, "trans")
      : null;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
              My Ad
            </p>
            <h1
              className="mt-3 text-3xl font-semibold sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Manage your listing
            </h1>
          </div>
          <Link
            href="/registro-escorts"
            className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition hover:brightness-110"
          >
            {ad ? "Edit Ad" : "Create Ad"}
          </Link>
        </div>

        {!ad ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-black/40 p-8 text-sm text-white/70">
            You do not have an active ad yet. Click Create Ad to publish one.
          </div>
        ) : (
          <div className="mt-10 grid gap-8 rounded-3xl border border-white/10 bg-black/40 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h2 className="text-sm uppercase tracking-[0.35em] text-[#f5d68c]">
                Details
              </h2>
              <div className="mt-5 space-y-4 text-sm text-white/70">
                <p>Name: {ad.name || "-"}</p>
                <p>Age: {ad.age ?? "-"}</p>
                <p>Location: {ad.location || "-"}</p>
                <p>Type: {ad.type}</p>
                <p>
                  Status:{" "}
                  {ad.approvalStatus === "pending"
                    ? "Pending approval"
                    : ad.approvalStatus === "rejected"
                      ? "Rejected"
                      : "Approved"}
                </p>
                {ad.approvalStatus === "pending" && (
                  <p className="text-amber-200">
                    Your ad is under review by admin.
                  </p>
                )}
                {ad.approvalStatus === "rejected" && (
                  <p className="text-red-300">
                    Your ad was rejected. Update details and submit again.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-[0.35em] text-[#f5d68c]">
                Images
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(Array.isArray(ad.images) ? ad.images : []).map((url) => (
                  <div
                    key={url}
                    className="h-40 overflow-hidden rounded-2xl border border-white/10"
                  >
                    <img src={url} alt="Ad" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
