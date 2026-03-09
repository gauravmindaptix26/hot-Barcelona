import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import ProfileReviews from "@/components/ProfileReviews";
import PageShell from "@/components/PageShell";

export default async function ProfileViewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const db = await getDb();
  const profileId = ObjectId.isValid(params.id)
    ? new ObjectId(params.id)
    : null;

  if (!profileId) {
    notFound();
  }

  const profile = await db.collection("profiles").findOne({ _id: profileId });
  if (!profile || !profile.isComplete) {
    notFound();
  }

  const images = await db
    .collection("profile_images")
    .find({ profileId: profile._id })
    .sort({ order: 1 })
    .toArray();

  return (
    <PageShell>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
          Profile
        </p>
        <h1
          className="mt-3 text-2xl font-semibold sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {profile.fullName}
        </h1>
        <div className="mt-8 grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-4 sm:mt-10 sm:gap-8 sm:p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-3 text-sm text-white/70 sm:space-y-4">
            <p>Age: {profile.age}</p>
            <p>Location: {profile.location}</p>
            <p>
              Interests:{" "}
              {Array.isArray(profile.interests) ? profile.interests.join(", ") : ""}
            </p>
            <p className="leading-relaxed">{profile.bio}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((image) => (
              <div
                key={image._id.toString()}
                className="relative h-32 overflow-hidden rounded-2xl border border-white/10 sm:h-40"
              >
                <Image src={image.url} alt="Profile" fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 sm:mt-10 lg:ml-auto lg:max-w-[52%]">
          <ProfileReviews profileId={profile._id.toString()} profileType="profiles" />
        </div>
    </PageShell>
  );
}
