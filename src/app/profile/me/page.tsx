import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import Link from "next/link";

export default async function ProfileMePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.gender !== "female") {
    redirect("/unauthorized");
  }

  const db = await getDb();
  const userId = new ObjectId(session.user.id);
  const profile = await db.collection("profiles").findOne({ userId });

  if (!profile) {
    redirect("/profile/create");
  }

  const images = await db
    .collection("profile_images")
    .find({ profileId: profile._id })
    .sort({ order: 1 })
    .toArray();

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
              My Profile
            </p>
            <h1
              className="mt-3 text-3xl font-semibold sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {profile.fullName}
            </h1>
          </div>
          <Link
            href="/profile/create"
            className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition hover:brightness-110"
          >
            Edit Profile
          </Link>
        </div>

        <div className="mt-10 grid gap-8 rounded-3xl border border-white/10 bg-black/40 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-sm uppercase tracking-[0.35em] text-[#f5d68c]">
              Details
            </h2>
            <div className="mt-5 space-y-4 text-sm text-white/70">
              <p>Age: {profile.age}</p>
              <p>Location: {profile.location}</p>
              <p>Interests: {Array.isArray(profile.interests) ? profile.interests.join(", ") : ""}</p>
              <p className="leading-relaxed">{profile.bio}</p>
            </div>
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-[0.35em] text-[#f5d68c]">
              Images
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {images.map((image) => (
                <div
                  key={image._id.toString()}
                  className="h-40 overflow-hidden rounded-2xl border border-white/10"
                >
                  <img src={image.url} alt="Profile" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
