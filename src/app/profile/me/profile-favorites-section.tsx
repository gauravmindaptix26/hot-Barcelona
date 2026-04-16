"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type FavoriteCard = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  image: string | null;
  profileType: "girls" | "trans";
  href: string;
};

export default function ProfileFavoritesSection({
  initialFavorites,
}: {
  initialFavorites: FavoriteCard[];
}) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const handleRemove = async (profile: FavoriteCard) => {
    const key = `${profile.profileType}:${profile.id}`;
    setRemovingKey(key);

    const previous = favorites;
    setFavorites((current) =>
      current.filter(
        (item) => !(item.id === profile.id && item.profileType === profile.profileType)
      )
    );

    try {
      const response = await fetch("/api/profile-favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile.id,
          profileType: profile.profileType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove favorite");
      }
    } catch {
      setFavorites(previous);
    } finally {
      setRemovingKey(null);
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-white/10 bg-black/40 p-5 sm:mt-10 sm:p-8">
      <h2 className="text-lg font-semibold sm:text-2xl">My Favorites</h2>
      {favorites.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((profile) => {
            const key = `${profile.profileType}:${profile.id}`;
            const isRemoving = removingKey === key;

            return (
              <div
                key={key}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="relative h-52">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 1024px) 88vw, 30vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(245,214,140,0.16),rgba(10,11,13,0.96)_68%)]" />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0.06),rgba(10,11,13,0.78)_100%)]" />
                  <div className="absolute left-4 top-4 rounded-full border border-[#f5d68c]/30 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#f5d68c]">
                    {profile.profileType === "trans" ? "Trans" : "Girls"}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-lg font-semibold text-white">
                      {profile.name}
                      {typeof profile.age === "number" ? `, ${profile.age}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {profile.location || "Barcelona"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-white/10 p-4">
                  <Link
                    href={profile.href}
                    className="flex-1 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 transition hover:border-[#f5d68c]/35 hover:text-white"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleRemove(profile)}
                    disabled={isRemoving}
                    className="rounded-full border border-red-400/25 bg-red-400/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-red-200 transition hover:border-red-300/40 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isRemoving ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 text-sm text-white/70">
          You have not added any favorite profiles yet.
        </p>
      )}
    </div>
  );
}
