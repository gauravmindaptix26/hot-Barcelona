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

  if (session.user.gender !== "female" && !session.user.isAdmin) {
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
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
              My Profile
            </p>
            <h1
              className="mt-3 text-2xl font-semibold sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {profile.fullName}
            </h1>
          </div>
          <Link
            href="/profile/create"
            className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition hover:brightness-110 sm:px-6 sm:text-xs sm:tracking-[0.35em]"
          >
            Edit Profile
          </Link>
        </div>

        <div className="mt-8 grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-4 sm:mt-10 sm:gap-8 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#f5d68c] sm:text-sm sm:tracking-[0.35em]">
              Details
            </h2>
            <div className="mt-4 space-y-3 text-sm text-white/70 sm:mt-5 sm:space-y-4">
              <p>Age: {profile.age}</p>
              <p>Location: {profile.location}</p>
              <p>Interests: {Array.isArray(profile.interests) ? profile.interests.join(", ") : ""}</p>
              <p className="leading-relaxed">{profile.bio}</p>
            </div>
          </div>
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-[#f5d68c] sm:text-sm sm:tracking-[0.35em]">
              Images
            </h2>
            <div className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2">
              {images.map((image) => (
                <div
                  key={image._id.toString()}
                  className="h-32 overflow-hidden rounded-2xl border border-white/10 sm:h-40"
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
