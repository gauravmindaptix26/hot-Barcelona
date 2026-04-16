import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ObjectId } from "mongodb";
import { getAppServerSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import PageShell from "@/components/PageShell";
import ProfileFavoritesSection from "./profile-favorites-section";

type AdCollection = "girls" | "trans";
type DisplayValue = string | string[];
type FavoriteCard = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  image: string | null;
  profileType: AdCollection;
  href: string;
};
const adDocProjection = {
  name: 1,
  age: 1,
  location: 1,
  email: 1,
  gender: 1,
  images: 1,
  formFields: 1,
  updatedAt: 1,
  createdAt: 1,
} as const;
const favoriteDocProjection = {
  _id: 1,
  name: 1,
  age: 1,
  location: 1,
  images: 1,
} as const;

const fieldLabelMap: Record<string, string> = {
  gender: "Gender",
  stageName: "Stage Name",
  email: "Email",
  phone: "Phone",
  whatsapp: "WhatsApp",
  telegramUsername: "Telegram",
  age: "Age",
  nationality: "Nationality",
  servicesOffered: "Services Offered",
  physicalAttributes: "Physical Attributes",
  attentionLevel: "Attention Level",
  specialFilters: "Special Filters",
  languages: "Languages",
  rate20: "Rate 20 Min",
  rate30: "Rate 30 Min",
  rate45: "Rate 45 Min",
  rate60: "Rate 60 Min",
  address: "Address",
  mapConfirmation: "Map Confirmation",
  subscriptionPlan: "Subscription Plan",
  subscriptionDuration: "Subscription Duration",
  paymentMethod: "Payment Method",
  specialOffer: "Special Offer",
  featuredBanner: "Featured Banner",
};

function labelForField(key: string) {
  if (fieldLabelMap[key]) return fieldLabelMap[key];
  const scheduleMatch = key.match(/^schedule-(.+)-(start|end)$/i);
  if (scheduleMatch) {
    const day = scheduleMatch[1];
    const part = scheduleMatch[2] === "start" ? "Start" : "End";
    return `Schedule ${day} ${part}`;
  }

  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function readEntryValue(
  entries: Array<[string, DisplayValue]>,
  key: string
): string {
  const match = entries.find(([entryKey]) => entryKey === key)?.[1];
  if (Array.isArray(match)) {
    return match.join(", ").trim();
  }
  return typeof match === "string" ? match.trim() : "";
}

function normalizeFieldEntries(
  formFields: unknown,
  fallback: {
    name?: unknown;
    age?: unknown;
    location?: unknown;
    email?: unknown;
    gender?: unknown;
  }
) {
  const entries: Array<[string, DisplayValue]> = [];

  if (formFields && typeof formFields === "object" && !Array.isArray(formFields)) {
    for (const [key, raw] of Object.entries(formFields as Record<string, unknown>)) {
      if (typeof raw === "string") {
        const value = raw.trim();
        if (value) entries.push([key, value]);
        continue;
      }
      if (Array.isArray(raw)) {
        const values = raw
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
        if (values.length > 0) entries.push([key, values]);
      }
    }
  }

  if (entries.length > 0) {
    return entries;
  }

  const fallbackEntries: Array<[string, DisplayValue]> = [];
  if (typeof fallback.name === "string" && fallback.name.trim()) {
    fallbackEntries.push(["stageName", fallback.name.trim()]);
  }
  if (Number.isFinite(Number(fallback.age))) {
    fallbackEntries.push(["age", String(Number(fallback.age))]);
  }
  if (typeof fallback.location === "string" && fallback.location.trim()) {
    fallbackEntries.push(["address", fallback.location.trim()]);
  }
  if (typeof fallback.email === "string" && fallback.email.trim()) {
    fallbackEntries.push(["email", fallback.email.trim()]);
  }
  if (typeof fallback.gender === "string" && fallback.gender.trim()) {
    fallbackEntries.push(["gender", fallback.gender.trim()]);
  }

  return fallbackEntries;
}

function readDocTimeMs(doc: unknown) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return 0;
  }
  const raw = doc as Record<string, unknown>;
  const parsed = new Date(
    (raw.updatedAt ?? raw.createdAt ?? 0) as string | number | Date
  ).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function pickLatest(girlsDoc: unknown, transDoc: unknown) {
  if (girlsDoc && !transDoc) return { doc: girlsDoc, type: "girls" as const };
  if (!girlsDoc && transDoc) return { doc: transDoc, type: "trans" as const };
  if (!girlsDoc && !transDoc) return null;

  const girlsTime = readDocTimeMs(girlsDoc);
  const transTime = readDocTimeMs(transDoc);
  return girlsTime >= transTime
    ? { doc: girlsDoc, type: "girls" as const }
    : { doc: transDoc, type: "trans" as const };
}

function getFavoriteHref(profile: Pick<FavoriteCard, "id" | "profileType">) {
  const basePath = profile.profileType === "trans" ? "/trans-escorts" : "/girls";
  return `${basePath}?profile=${encodeURIComponent(profile.id)}`;
}

export default async function ProfileMePage() {
  const session = await getAppServerSession();
  if (!session?.user) {
    redirect("/login");
  }

  const genderLabel =
    session.user.gender === "female"
      ? "Female"
      : session.user.gender === "male"
        ? "Male"
        : "Not specified";

  const db = await getDb();
  const userId =
    typeof session.user.id === "string" && ObjectId.isValid(session.user.id)
      ? new ObjectId(session.user.id)
      : null;
  const normalizedEmail = (session.user.email ?? "").trim().toLowerCase();

  const loadBy = async (collection: AdCollection, by: "userId" | "email") => {
    if (by === "userId") {
      if (!userId) return null;
      return db
        .collection(collection)
        .findOne({ userId, isDeleted: { $ne: true } }, { projection: adDocProjection });
    }
    if (!normalizedEmail) return null;
    return db.collection(collection).findOne(
      {
        email: normalizedEmail,
        isDeleted: { $ne: true },
      },
      { projection: adDocProjection }
    );
  };

  const [girlsByUserId, transByUserId] = await Promise.all([
    loadBy("girls", "userId"),
    loadBy("trans", "userId"),
  ]);

  let adResult = pickLatest(girlsByUserId, transByUserId);
  if (!adResult) {
    const [girlsByEmail, transByEmail] = await Promise.all([
      loadBy("girls", "email"),
      loadBy("trans", "email"),
    ]);
    adResult = pickLatest(girlsByEmail, transByEmail);
  }

  const adDoc = adResult?.doc as
    | {
        name?: unknown;
        age?: unknown;
        location?: unknown;
        email?: unknown;
        gender?: unknown;
        images?: unknown;
        formFields?: unknown;
      }
    | undefined;

  const images =
    adDoc && Array.isArray(adDoc.images)
      ? adDoc.images.filter(
          (item: unknown): item is string => typeof item === "string"
        )
      : [];

  const displayEntries = adDoc
    ? normalizeFieldEntries(adDoc.formFields, {
        name: adDoc.name,
        age: adDoc.age,
        location: adDoc.location,
        email: adDoc.email,
        gender: adDoc.gender,
      })
    : [];
  const subscriptionPlan = readEntryValue(displayEntries, "subscriptionPlan");
  const subscriptionDuration = readEntryValue(displayEntries, "subscriptionDuration");
  const visibleDisplayEntries = displayEntries.filter(
    ([key]) => key !== "subscriptionPlan" && key !== "subscriptionDuration"
  );

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

        {adResult ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-5 sm:mt-10 sm:p-8">
            <h2 className="text-lg font-semibold sm:text-2xl">
              Advertise Profile ({adResult.type})
            </h2>

            {(subscriptionPlan || subscriptionDuration) && (
              <div className="mt-5 rounded-[26px] border border-[#f5d68c]/35 bg-[linear-gradient(145deg,rgba(245,214,140,0.16),rgba(245,179,92,0.06)_20%,rgba(10,11,13,0.95)_60%)] p-5">
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
                  Advertiser Subscription
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {subscriptionPlan && (
                    <span className="rounded-full border border-[#f5d68c]/35 bg-black/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.3em]">
                      {subscriptionPlan}
                    </span>
                  )}
                  {subscriptionDuration && (
                    <span className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-white/80 sm:text-xs sm:tracking-[0.3em]">
                      {subscriptionDuration}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/65">
                  Yeh section sirf aapke own account area me visible hai. Public profile users ko subscription info nahi dikhai jayegi.
                </p>
              </div>
            )}

            {visibleDisplayEntries.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {visibleDisplayEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                      {labelForField(key)}
                    </p>
                    <p className="mt-2 text-sm text-white/85">
                      {Array.isArray(value) ? value.join(", ") : value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-white/70">
                No filled fields available for this profile.
              </p>
            )}

            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                  Photos
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {images.map((url) => (
                    <div
                      key={url}
                      className="relative h-40 overflow-hidden rounded-2xl border border-white/10"
                    >
                      <Image
                        src={url}
                        alt="Ad profile"
                        fill
                        sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70 sm:mt-10 sm:p-8">
            You have not filled the advertise form yet.
            <div className="mt-5">
              <Link
                href="/registro-escorts"
                className="inline-flex rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition hover:brightness-110 sm:text-xs sm:tracking-[0.35em]"
              >
                Fill Advertise Form
              </Link>
            </div>
          </div>
        )}
    </PageShell>
  );
}
