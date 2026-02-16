"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform, type Variants } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import NavIcon from "../../components/NavIcon";

const filters = ["Age 20-30", "Barcelona", "4.7+ Rating", "Verified", "Tonight"];

type Profile = {
  id: string;
  name: string;
  age: number;
  location: string;
  rating: number;
  reviews: number;
  status: string;
  image: string;
  tag: string;
  about: string;
  details: {
    height: string;
    body: string;
    hair: string;
    eyes: string;
    nationality: string;
    languages: string;
  };
  style: {
    fashion: string;
    personality: string[];
    vibe: string[];
  };
  services: string[];
  availability: {
    days: string;
    hours: string;
    travel: string;
  };
  gallery: string[];
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function GirlsClient({
  initialProfiles,
}: {
  initialProfiles: Profile[];
}) {
  const [liveProfiles] = useState<Profile[]>(initialProfiles);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useMotionValue(0);
  const heroParallax = useTransform(scrollProgress, [0, 1], [0, 80]);

  const displayProfiles = useMemo(() => liveProfiles, [liveProfiles]);

  const selectedProfile = useMemo(
    () => displayProfiles.find((profile) => profile.id === selectedId) || null,
    [displayProfiles, selectedId]
  );

  useEffect(() => {
    // Client-only hook reserved if you want to add filters/interactions later.
  }, []);

  // Dynamic only: no localStorage fallback.

  useEffect(() => {
    if (!selectedProfile) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProfile]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.35),_rgba(245,179,92,0)_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.25),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.2),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <section className="relative overflow-hidden pb-10 pt-4 sm:pb-12 sm:pt-6">
          <Navbar />
          <div className="mx-auto mt-4 w-full max-w-6xl px-4 sm:mt-6 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
                Elite Discovery
              </p>
              <h1
                className="mt-3 text-3xl font-semibold sm:mt-4 sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Girls Collection
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70 sm:mt-4 sm:text-lg">
                A curated selection of refined companions. Explore profiles,
                compare ratings, and reserve a private introduction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex items-center gap-2 overflow-x-auto rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_18px_38px_rgba(0,0,0,0.35)] backdrop-blur sm:mt-8 sm:flex-wrap sm:gap-3 sm:px-6 sm:py-4"
            >
              <button className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:text-white sm:text-xs sm:tracking-[0.35em]">
                Filters
                <NavIcon path="M4 6h16M7 12h10M10 18h4" />
              </button>
              {filters.map((filter) => (
                <span
                  key={filter}
                  className="whitespace-nowrap rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-white/60 sm:text-xs sm:tracking-[0.3em]"
                >
                  {filter}
                </span>
              ))}
              <span className="ml-2 text-[10px] uppercase tracking-[0.28em] text-white/50 sm:ml-auto sm:text-xs sm:tracking-[0.3em]">
                {displayProfiles.length} profiles
              </span>
            </motion.div>
            {displayProfiles.length === 0 && (
              <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">
                No profiles found yet.
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {displayProfiles.map((profile) => (
              <motion.div
                key={profile.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(profile.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedId(profile.id);
                  }
                }}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5 text-left shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={profile.image}
                    alt={profile.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_20%,rgba(10,11,13,0.7)_100%)] opacity-70 transition duration-500 group-hover:opacity-90" />
                  <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(245,214,140,0.35),rgba(10,11,13,0)_55%)]" />
                  </div>
                  <button
                    type="button"
                    aria-label="Save profile"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 transition hover:border-[#f5d68c]/60 hover:text-[#f5d68c]"
                  >
                    <NavIcon path="M12 20.5s-6.5-4.3-9-8.2C1.4 9 3 6 6.4 6c2.1 0 3.6 1.2 4.6 2.7C12 7.2 13.5 6 15.6 6 19 6 20.6 9 21 12.3c-2.5 3.9-9 8.2-9 8.2Z" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          {profile.name}, {profile.age}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60">
                          <NavIcon path="M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z" />
                          {profile.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#f5d68c]">
                        <NavIcon path="M12 3.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 3.5Z" />
                        <span className="text-white/80">{profile.rating}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.35em] text-white/70">
                        {profile.tag}
                      </span>
                      <span className="translate-y-2 rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-black opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        View Profile
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-12 flex flex-col items-center gap-5 sm:mt-16 sm:gap-6">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/50 sm:gap-4 sm:text-xs sm:tracking-[0.3em]">
              <span className="h-px w-12 bg-white/20" />
              Infinite discovery
              <span className="h-px w-12 bg-white/20" />
            </div>
            <button className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.3)] transition hover:brightness-110 sm:px-10 sm:py-3 sm:text-xs sm:tracking-[0.35em]">
              Load More
            </button>
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.3em] text-white/50 transition hover:text-white sm:text-xs sm:tracking-[0.35em]"
            >
              Back to home
            </Link>
          </div>
        </section>

        <Footer />
      </main>

      {selectedProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
        >
          <motion.button
            type="button"
            aria-label="Close profile"
            onClick={() => setSelectedId(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={modalRef}
            onScroll={(event) => {
              const target = event.currentTarget;
              const maxScroll = target.scrollHeight - target.clientHeight;
              scrollProgress.set(maxScroll > 0 ? target.scrollTop / maxScroll : 0);
            }}
            initial={{ opacity: 0, scale: 0.98, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 24 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="no-scrollbar relative z-10 max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/10 bg-[#0b0c10]/95 shadow-[0_40px_90px_rgba(0,0,0,0.55)]"
          >
            <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
              <motion.div style={{ y: heroParallax }} className="absolute inset-0">
                <Image
                  src={selectedProfile.image}
                  alt={selectedProfile.name}
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0.15)_0%,rgba(10,11,13,0.75)_70%,rgba(10,11,13,0.98)_100%)]" />
              <div className="absolute left-10 top-10 flex items-center gap-3 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/80">
                <NavIcon path="M4 7h16M4 12h10M4 17h7" />
                Elite profile
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 transition hover:border-[#f5d68c]/60 hover:text-[#f5d68c]"
              >
                <NavIcon path="M6 6l12 12M18 6l-12 12" />
              </button>
              <div className="absolute inset-x-0 bottom-0 px-10 pb-10">
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                      {selectedProfile.status}
                    </p>
                    <h2
                      className="mt-4 text-4xl font-semibold sm:text-5xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {selectedProfile.name}, {selectedProfile.age}
                    </h2>
                    <div className="mt-3 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-white/70">
                      <NavIcon path="M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z" />
                      {selectedProfile.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-black/50 px-6 py-4">
                    <div className="flex items-center gap-2 text-[#f5d68c]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            index < Math.round(selectedProfile.rating)
                              ? "text-[#f5d68c]"
                              : "text-white/20"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-white/70">
                      {selectedProfile.rating} · {selectedProfile.reviews} reviews
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-10 px-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-10">
                <section>
                  <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                    About Her
                  </p>
                  <p className="mt-4 text-lg text-white/75">
                    {selectedProfile.about}
                  </p>
                </section>

                <section>
                  <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                    Style & Personality
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <span className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                      {selectedProfile.style.fashion}
                    </span>
                    {selectedProfile.style.personality.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedProfile.style.vibe.map((item) => (
                      <span
                        key={item}
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60"
                      >
                        <span className="h-2 w-2 rounded-full bg-[#f5d68c]" />
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                    Services & Preferences
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {selectedProfile.services.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-[#f5d68c]/60 hover:text-[#f5d68c]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                    Gallery
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {selectedProfile.gallery.map((src) => (
                      <div
                        key={src}
                        className="group relative h-56 overflow-hidden rounded-2xl border border-white/10"
                      >
                        <Image
                          src={src}
                          alt={`${selectedProfile.name} gallery`}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
                  <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                    Personal Details
                  </p>
                  <div className="mt-6 grid gap-4 text-sm text-white/70">
                    {Object.entries(selectedProfile.details).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                      >
                        <span className="text-xs uppercase tracking-[0.35em] text-white/50">
                          {key}
                        </span>
                        <span className="text-white/80">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-black/40 p-6">
                  <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                    Availability
                  </p>
                  <div className="mt-6 space-y-4 text-sm text-white/70">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.35em] text-white/50">
                        Days
                      </span>
                      <span className="text-white/80">
                        {selectedProfile.availability.days}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.35em] text-white/50">
                        Time
                      </span>
                      <span className="text-white/80">
                        {selectedProfile.availability.hours}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                      <span className="text-xs uppercase tracking-[0.35em] text-white/50">
                        Travel
                      </span>
                      <span className="text-white/80">
                        {selectedProfile.availability.travel}
                      </span>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-black/50 p-6">
                  <p className="text-xs uppercase tracking-[0.45em] text-[#f5d68c]">
                    Actions
                  </p>
                  <div className="mt-6 grid gap-3">
                    <button className="flex items-center justify-between rounded-full border border-white/15 bg-black/50 px-5 py-3 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#f5d68c]/60 hover:text-[#f5d68c]">
                      Like / Save
                      <NavIcon path="M12 20.5s-6.5-4.3-9-8.2C1.4 9 3 6 6.4 6c2.1 0 3.6 1.2 4.6 2.7C12 7.2 13.5 6 15.6 6 19 6 20.6 9 21 12.3c-2.5 3.9-9 8.2-9 8.2Z" />
                    </button>
                    <button className="flex items-center justify-between rounded-full border border-white/15 bg-black/50 px-5 py-3 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:border-[#f5d68c]/60 hover:text-[#f5d68c]">
                      Add to Favorites
                      <NavIcon path="M12 3.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 3.5Z" />
                    </button>
                    <button className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110">
                      Contact / Connect
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
