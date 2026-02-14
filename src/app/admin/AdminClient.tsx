"use client";

import { useMemo, useState } from "react";

type ProfileItem = {
  _id: string;
  name: string;
  age: number | null;
  location: string;
  images: string[];
  createdAt: string | null;
  createdAtLabel?: string;
};

type Props = {
  girls: ProfileItem[];
  trans: ProfileItem[];
};

type TabKey = "girls" | "trans";

export default function AdminClient({ girls, trans }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("girls");
  const [items, setItems] = useState<Record<TabKey, ProfileItem[]>>({
    girls,
    trans,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const activeItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items[activeTab].filter((item) => {
      if (!term) return true;
      const hay = `${item.name} ${item.location}`.toLowerCase();
      return hay.includes(term);
    });
  }, [items, activeTab, search]);

  const handleDelete = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this profile?");
    if (!ok) return;
    setIsDeleting(id);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/profiles/${id}?type=${activeTab}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Failed to delete profile.");
        return;
      }
      setItems((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((item) => item._id !== id),
      }));
    } catch {
      setError("Failed to delete profile.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-6 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
            Admin Console
          </p>
          <h1
            className="mt-3 text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Manage profiles
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/40 p-1 text-xs uppercase tracking-[0.3em] text-white/70">
            {(["girls", "trans"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-full px-5 py-2 transition ${
                  activeTab === key
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or location"
            className="w-full rounded-full border border-white/10 bg-black/40 px-5 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
          />
          <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xs uppercase tracking-[0.3em] text-white/40">
            Search
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">
          {activeItems.length} results
        </p>
      </div>

      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {activeItems.map((item) => (
          <div
            key={item._id}
            className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#0c0d10] shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
          >
            <div className="relative h-64 w-full overflow-hidden">
              {item.images[0] ? (
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,214,140,0.2),_rgba(10,11,13,0.9))] text-xs uppercase tracking-[0.4em] text-white/60">
                  No Image
                </div>
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_40%,rgba(10,11,13,0.85)_100%)]" />
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-white/60">
                    {item.age ?? "—"} • {item.location || "Unknown location"}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/60">
                  {activeTab}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
                <span>{item.createdAtLabel ?? "No date"}</span>
                <span>{item.images.length} photos</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(item._id)}
                  disabled={isDeleting === item._id}
                  className="rounded-full border border-red-400/40 bg-red-500/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-red-200 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting === item._id ? "Deleting..." : "Delete"}
                </button>
                <span className="text-[11px] uppercase tracking-[0.25em] text-white/40">
                  Permanent
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeItems.length === 0 && (
        <div className="mt-12 rounded-3xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-white/60">
          No profiles found in this category.
        </div>
      )}
    </div>
  );
}
