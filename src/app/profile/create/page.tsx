import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import ProfileCreateForm from "./profile-create-form";

export default async function ProfileCreatePage() {
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
  const images = profile
    ? await db
        .collection("profile_images")
        .find({ profileId: profile._id })
        .sort({ order: 1 })
        .toArray()
    : [];

  return (
    <ProfileCreateForm
      initialProfile={
        profile
          ? {
              fullName: profile.fullName ?? "",
              age: profile.age ?? "",
              location: profile.location ?? "",
              bio: profile.bio ?? "",
              interests: Array.isArray(profile.interests)
                ? profile.interests.join(", ")
                : "",
              images: images.map((img) => img.url),
            }
          : null
      }
    />
  );
}
