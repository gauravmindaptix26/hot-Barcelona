import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import PageShell from "@/components/PageShell";
import ProfileFavoritesSection from "./profile-favorites-section";

type AdCollection = "girls" | "trans";
type FavoriteCard = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  image: string | null;
  profileType: AdCollection;
  href: string;
};

const favoriteDocProjection = {
  _id: 1,
  name: 1,
  age: 1,
  location: 1,
  images: 1,
} as const;

function getFavoriteHref(profile: Pick<FavoriteCard, "id" | "profileType">) {
  const basePath = profile.profileType === "trans" ? "/trans-escorts" : "/girls";
  return `${basePath}?profile=${encodeURIComponent(profile.id)}`;
}

export default async function ProfileMePage() {
  const session = await getAppServerSession();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.accountType === "advertiser") {
    redirect("/my-ad");
  }

  const genderLabel =
    session.user.gender === "female"
      ? "Female"
      : session.user.gender === "male"
        ? "Male"
        : "Not specified";

  const db = await getDb();

  const favoritesRaw = session.user.id
    ? await db
        .collection("profile_favorites")
        .find(
          { userId: session.user.id },
          { projection: { _id: 0, profileId: 1, profileType: 1, createdAt: 1 } }
        )
        .sort({ createdAt: -1 })
        .toArray()
    : [];

  const favoriteIdsByType = favoritesRaw.reduce(
    (acc, item) => {
      const profileId =
        typeof item.profileId === "string" && ObjectId.isValid(item.profileId)
          ? item.profileId
          : null;
      const profileType =
        item.profileType === "girls" || item.profileType === "trans"
          ? item.profileType
          : null;
      if (profileId && profileType === "girls") {
        acc.girls.push(new ObjectId(profileId));
      }
      if (profileId && profileType === "trans") {
        acc.trans.push(new ObjectId(profileId));
      }
      return acc;
    },
    { girls: [] as ObjectId[], trans: [] as ObjectId[] }
  );

  const [favoriteGirlsDocs, favoriteTransDocs] = await Promise.all([
    favoriteIdsByType.girls.length > 0
      ? db
          .collection("girls")
          .find({
            _id: { $in: favoriteIdsByType.girls },
            isDeleted: { $ne: true },
            $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
          }, { projection: favoriteDocProjection })
          .toArray()
      : [],
    favoriteIdsByType.trans.length > 0
      ? db
          .collection("trans")
          .find({
            _id: { $in: favoriteIdsByType.trans },
            isDeleted: { $ne: true },
            $or: [{ approvalStatus: "approved" }, { approvalStatus: { $exists: false } }],
          }, { projection: favoriteDocProjection })
          .toArray()
      : [],
  ]);

  const favoriteLookup = new Map<string, FavoriteCard>();
  for (const doc of favoriteGirlsDocs) {
    favoriteLookup.set(`girls:${doc._id.toString()}`, {
      id: doc._id.toString(),
      name: typeof doc.name === "string" && doc.name.trim() ? doc.name.trim() : "Profile",
      age: typeof doc.age === "number" ? doc.age : null,
      location: typeof doc.location === "string" ? doc.location.trim() : "",
      image:
        Array.isArray(doc.images) && typeof doc.images[0] === "string" ? doc.images[0] : null,
      profileType: "girls",
      href: getFavoriteHref({ id: doc._id.toString(), profileType: "girls" }),
    });
  }
  for (const doc of favoriteTransDocs) {
    favoriteLookup.set(`trans:${doc._id.toString()}`, {
      id: doc._id.toString(),
      name: typeof doc.name === "string" && doc.name.trim() ? doc.name.trim() : "Profile",
      age: typeof doc.age === "number" ? doc.age : null,
      location: typeof doc.location === "string" ? doc.location.trim() : "",
      image:
        Array.isArray(doc.images) && typeof doc.images[0] === "string" ? doc.images[0] : null,
      profileType: "trans",
      href: getFavoriteHref({ id: doc._id.toString(), profileType: "trans" }),
    });
  }

  const favoriteProfiles = favoritesRaw
    .map((item) => {
      const profileId = typeof item.profileId === "string" ? item.profileId : null;
      const profileType =
        item.profileType === "girls" || item.profileType === "trans"
          ? item.profileType
          : null;
      if (!profileId || !profileType) return null;
      return favoriteLookup.get(`${profileType}:${profileId}`) ?? null;
    })
    .filter((item): item is FavoriteCard => Boolean(item));

  return (
    <PageShell>
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
            My Profile
          </p>
          <h1
            className="mt-3 text-2xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Account Details
          </h1>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-5 sm:mt-10 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                Name
              </p>
              <p className="mt-2 text-sm text-white/85">
                {session.user.name?.trim() || "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                Gender
              </p>
              <p className="mt-2 text-sm text-white/85">{genderLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                Email
              </p>
              <p className="mt-2 break-all text-sm text-white/85">
                {session.user.email?.trim() || "-"}
              </p>
            </div>
          </div>
        </div>

        <ProfileFavoritesSection initialFavorites={favoriteProfiles} />
    </PageShell>
  );
}
