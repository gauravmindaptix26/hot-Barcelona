import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

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
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
          Profile
        </p>
        <h1
          className="mt-3 text-3xl font-semibold sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {profile.fullName}
        </h1>
        <div className="mt-10 grid gap-8 rounded-3xl border border-white/10 bg-black/40 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4 text-sm text-white/70">
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
                className="h-40 overflow-hidden rounded-2xl border border-white/10"
              >
                <img src={image.url} alt="Profile" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
