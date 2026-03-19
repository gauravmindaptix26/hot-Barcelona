"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import NavIcon from "../NavIcon";

const premiumVipFallbackImages = [
  "/images/hot1.webp",
  "/images/hot2.webp",
  "/images/hot3.webp",
  "/images/hot4.webp",
  "/images/hot5.webp",
  "/images/hot6.jpeg",
];

const prestigeSlider = [
  "/images/high-class-berlin1.jpg",
  "/images/Frauen%20in%20Limousine.jpeg",
  "/images/Frau%20im%20schwarzen%20Kleid.jpg",
  "/images/Frau%20im%20Auto%20.jpg",
  "/images/Frau%20auf%20Sessel.jpg",
  "/images/Frau%20in%20Body.jpg",
  "/images/Frau%20in%20Dessous.jpg",
  "/images/hot8.webp",
  "/images/hot9.webp",
  "/images/hot10.webp",
  "/images/hot11.webp",
  "/images/hot12.webp",
  "/images/hot13.webp",
  "/images/hot14.jpeg",
  "/images/hot15.jpeg",
  "/images/hot17.jpg",
  "/images/hot18.jpg",
  "/images/hot19.jpg",
  "/images/hot20.jpg",
];

const galleryImages = [
  "/images/high-class-berlin1.jpg",
  "/images/hot1.webp",
  "/images/Frauen%20in%20Limousine.jpeg",
  "/images/hot2.webp",
  "/images/Frau%20im%20schwarzen%20Kleid.jpg",
  "/images/Frau%20im%20Auto%20.jpg",
  "/images/Frau%20auf%20Sessel.jpg",
  "/images/hot7.jpg",
  "/images/Frau%20in%20Body.jpg",
  "/images/hot8.webp",
  "/images/hot9.webp",
  "/images/hot10.webp",
];

const infiniteVisualsRows = [
  [
    "/images/Frau%20im%20schwarzen%20Kleid.jpg",
    "/images/Frau%20im%20Auto%20.jpg",
    "/images/Frau%20auf%20Sessel.jpg",
    "/images/Frau%20in%20Body.jpg",
    "/images/Frau%20in%20Dessous.jpg",
    "/images/hot8.webp",
    "/images/hot9.webp",
    "/images/hot8.webp",
    "/images/hot9.webp",
    "/images/hot10.webp",
  ],
  [
    "/images/hot11.webp",
    "/images/hot12.webp",
    "/images/hot13.webp",
    "/images/hot14.jpeg",
    "/images/hot15.jpeg",
    "/images/hot17.jpg",
    "/images/hot18.jpg",
    "/images/hot19.jpg",
    "/images/hot20.jpg",
    "/images/high-class-berlin1.jpg",
  ],
  [
    "/images/Frau%20in%20Dessous%20mit%20Schleife.jpeg",
    "/images/Frau%20mit%20Koffer%20Kopie%202.jpeg",
    "/images/Frau%20sitzt%20auf%20Mann.jpg",
    "/images/Frauen%20in%20Limousine.jpeg",
    "/images/Frau%20im%20schwarzen%20Kleid.jpg",
    "/images/Frau%20im%20Auto%20.jpg",
    "/images/Frau%20auf%20Sessel.jpg",
    "/images/Frau%20in%20Body.jpg",
    "/images/Frau%20in%20Dessous.jpg",
    "/images/Paar.jpeg",
  ],
];

type LatestProfile = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  image: string | null;
  gender?: string | null;
  profileType?: "girls" | "trans" | null;
};

type PremiumVipProfile = {
  id: string;
  name: string;
  age: number | null;
  location: string;
  image: string | null;
  gender?: string | null;
  profileType?: "girls" | "trans" | null;
};

const fallbackPremiumVipProfiles: PremiumVipProfile[] =
  premiumVipFallbackImages.map((src, index) => ({
    id: `vip-fallback-${index}`,
    name: "VIP Profile",
    age: null,
    location: "Barcelona",
    image: src,
    profileType: null,
  }));

const fallbackProfiles: LatestProfile[] = galleryImages.slice(0, 12).map((src, index) => ({
  id: `fallback-${index}`,
  name: "New profile",
  age: null,
  location: "Barcelona",
  image: src,
  profileType: null,
}));

const getPublicProfileHref = (profile: {
  id: string;
  profileType?: "girls" | "trans" | null;
  gender?: string | null;
}) => {
  const typeHint =
    profile.profileType ??
    (typeof profile.gender === "string" ? profile.gender : null);
  const normalized = (typeHint ?? "").toLowerCase();
  const basePath = normalized.includes("trans") ? "/trans-escorts" : "/girls";
  return `${basePath}?profile=${encodeURIComponent(profile.id)}`;
};

export default function HomeDeferredSections() {
  const lifestyleRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const premiumBannerScrollerRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const [latestProfiles, setLatestProfiles] =
    useState<LatestProfile[]>(fallbackProfiles);
  const [premiumVipProfiles, setPremiumVipProfiles] =
    useState<PremiumVipProfile[]>(fallbackPremiumVipProfiles);

  const latestProfilesSafe = useMemo(
    () => latestProfiles.slice(0, 12),
    [latestProfiles]
  );

  const premiumVipProfilesSafe = useMemo(() => {
    const merged = [...premiumVipProfiles];
    if (merged.length < 6) {
      const fillers = fallbackPremiumVipProfiles.filter(
        (item) => !merged.some((profile) => profile.id === item.id)
      );
      merged.push(...fillers);
    }
    return merged.slice(0, 6);
  }, [premiumVipProfiles]);

  const { scrollYProgress: lifestyleProgress } = useScroll({
    target: lifestyleRef,
    offset: ["start end", "end start"],
  });
  const lifestyleY = useTransform(lifestyleProgress, [0, 1], [60, -40]);

  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "end start"],
  });
  const ctaY = useTransform(ctaProgress, [0, 1], [50, -30]);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let idleId: number | null = null;

    const loadLatestProfiles = async () => {
      try {
        const response = await fetch("/api/latest-profiles");
        if (!response.ok) return;
        const data = (await response.json()) as LatestProfile[];
        if (active && Array.isArray(data) && data.length > 0) {
          const merged = [...data];
          if (merged.length < 12) {
            const fillers = fallbackProfiles.filter(
              (item) => !merged.some((profile) => profile.id === item.id)
            );
            merged.push(...fillers);
          }
          setLatestProfiles(merged.slice(0, 12));
        }
      } catch {
        // Keep fallback profiles on error.
      }
    };

    const loadPremiumVipProfiles = async () => {
      try {
        const response = await fetch("/api/premium-vip-profiles");
        if (!response.ok) return;
        const data = (await response.json()) as PremiumVipProfile[];
        if (active && Array.isArray(data) && data.length > 0) {
          setPremiumVipProfiles(data.slice(0, 6));
        }
      } catch {
        // Keep fallback VIP profiles on error.
      }
    };

    const loadDeferredContent = () => {
      loadLatestProfiles();
      loadPremiumVipProfiles();
    };

    const scheduleDeferredLoad = () => {
      if ("requestIdleCallback" in globalThis) {
        idleId = globalThis.requestIdleCallback(() => {
          if (active) {
            loadDeferredContent();
          }
        });
        return;
      }

      timeoutId = globalThis.setTimeout(() => {
        if (active) {
          loadDeferredContent();
        }
      }, 900);
    };

    if (document.readyState === "complete") {
      scheduleDeferredLoad();
    } else {
      const onLoad = () => scheduleDeferredLoad();
      globalThis.addEventListener("load", onLoad, { once: true });
      return () => {
        active = false;
        globalThis.removeEventListener("load", onLoad);
        if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
        if (idleId !== null && "cancelIdleCallback" in globalThis) {
          globalThis.cancelIdleCallback(idleId);
        }
      };
    }

    return () => {
      active = false;
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
      if (idleId !== null && "cancelIdleCallback" in globalThis) {
        globalThis.cancelIdleCallback(idleId);
      }
    };
  }, []);

  const scrollPremiumBanner = (direction: "left" | "right") => {
    const node = premiumBannerScrollerRef.current;
    if (!node) return;

    const step = Math.max(280, Math.round(node.clientWidth * 0.78));
    node.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <>
      <section
        ref={lifestyleRef}
        className="deferred-section relative z-10 overflow-hidden bg-[#060a11] py-12 sm:py-16 lg:py-20"
      >
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.18),_rgba(245,214,140,0)_72%)] blur-2xl" />
        <div className="pointer-events-none absolute -right-24 top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.14),_rgba(212,106,122,0)_75%)] blur-2xl" />
        <div className="relative mx-auto grid w-full max-w-[88rem] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.25fr] lg:gap-10">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, x: -40 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={
              shouldReduceMotion
                ? undefined
                : { duration: 1, ease: [0.16, 1, 0.3, 1] }
            }
            viewport={{ once: true, amount: 0.4 }}
            className="mx-auto max-w-[42rem] text-center lg:mx-0 lg:text-left"
          >
            <p className="font-cinzel text-[1.8rem] uppercase tracking-[0.16em] text-[#f5d68c] sm:text-5xl sm:tracking-[0.3em] lg:text-6xl">
              Premium VIP Collection
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72 sm:mt-6 sm:text-[1.05rem] lg:text-lg">
              Discover Hot Barcelona&apos;s Top Premium VIP profiles, carefully
              selected for those who value exclusivity, elegance, and high
              standards. These six premium VIP companions represent the finest in
              style, confidence, and professionalism. Verified, discreet, and in
              high demand, they offer a truly luxury experience for clients
              seeking quality, privacy, and unforgettable moments in Barcelona.
            </p>
            <div className="mt-5 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.28em] text-white/58 sm:text-[11px] sm:tracking-[0.36em] lg:justify-start">
              <span className="h-px w-14 bg-white/28" />
              Limited Availability
            </div>
          </motion.div>

          <motion.div style={shouldReduceMotion ? undefined : { y: lifestyleY }} className="w-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
              {premiumVipProfilesSafe.map((profile, index) => {
                const isFallback = profile.id.startsWith("vip-fallback-");
                const card = (
                  <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={
                      shouldReduceMotion
                        ? undefined
                        : {
                            duration: 0.8,
                            delay: index * 0.08,
                            ease: [0.16, 1, 0.3, 1],
                          }
                    }
                    viewport={{ once: true, amount: 0.25 }}
                    whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                    className="group relative mx-auto aspect-[3/4.2] w-full max-w-[22rem] overflow-hidden rounded-[26px] border border-white/15 bg-[#11141b] shadow-[0_24px_48px_rgba(0,0,0,0.45)] sm:max-w-none sm:aspect-[3/4.65]"
                  >
                    <Image
                      src={
                        profile.image ??
                        premiumVipFallbackImages[
                          index % premiumVipFallbackImages.length
                        ]
                      }
                      alt={profile.name}
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1279px) 42vw, 28vw"
                      quality={70}
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,10,14,0.18)_8%,rgba(8,10,14,0.88)_100%)]" />
                    <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(245,214,140,0.25),rgba(8,10,14,0)_52%)]" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                      <p className="text-xl font-semibold text-white sm:text-2xl">
                        {profile.name}
                        {profile.age ? `, ${profile.age}` : ""}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/68 sm:text-sm sm:tracking-[0.26em]">
                        <NavIcon path="M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z" />
                        {profile.location || "Barcelona"}
                      </div>
                      <div className="mt-3 inline-flex items-center rounded-full border border-[#f5d68c]/30 bg-black/45 px-4 py-2 text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-[11px]">
                        Top Premium VIP
                      </div>
                    </div>
                  </motion.div>
                );

                if (isFallback) {
                  return (
                    <div key={profile.id} className="cursor-default">
                      {card}
                    </div>
                  );
                }

                return (
                  <Link key={profile.id} href={getPublicProfileHref(profile)}>
                    {card}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="deferred-section relative z-10 bg-[#1b1b1b] py-6 sm:py-8">
        <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Home Attention", accent: "bg-red-500/80", icon: "play" },
              { label: "Show your face", accent: "bg-white/80", icon: "face" },
              { label: "Video call", accent: "bg-[#b27cff]", icon: "call" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#232323] px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:gap-4 sm:px-6"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.accent} text-white shadow-[0_8px_18px_rgba(0,0,0,0.35)]`}
                >
                  {item.icon === "play" && (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
                    </svg>
                  )}
                  {item.icon === "face" && (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9 10h.01M15 10h.01" />
                      <path d="M8.5 14.2c.9-1 2.1-1.6 3.5-1.6s2.6.6 3.5 1.6" />
                    </svg>
                  )}
                  {item.icon === "call" && (
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="3.5" y="7" width="12" height="10" rx="2" />
                      <path d="M17 9l4-2v10l-4-2" />
                    </svg>
                  )}
                </span>
                <span
                  className="text-base font-semibold text-white sm:text-lg"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="deferred-section relative z-10 flex flex-col justify-center bg-[#0c0d10] py-14 lg:min-h-screen">
        <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.4 }}
              className="max-w-2xl text-left"
            >
              <p className="font-cinzel text-[1.45rem] leading-tight uppercase tracking-[0.12em] text-[#f5d68c] sm:whitespace-nowrap sm:text-5xl sm:tracking-[0.3em] lg:text-6xl">
                Premium Banner Showcase
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60 sm:mt-4 sm:text-base lg:text-lg">
                Explore our Top Premium banner showcasing exclusive VIP profiles,
                luxury services, verified companions, and premium experiences
                designed for elite clients.
              </p>
            </motion.div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => scrollPremiumBanner("left")}
                aria-label="Scroll premium banner left"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/75 shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#f5d68c]/45 hover:text-[#f5d68c]"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 transition group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M15 6 9 12l6 6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollPremiumBanner("right")}
                aria-label="Scroll premium banner right"
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-[#f5d68c]/30 bg-[#f5d68c]/10 text-[#f5d68c] shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur transition hover:border-[#f5d68c]/55 hover:bg-[#f5d68c]/14"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 transition group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="relative mt-8 sm:mt-12">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[#0c0d10] to-transparent sm:w-12" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#0c0d10] to-transparent sm:w-12" />
          <div
            ref={premiumBannerScrollerRef}
            className="no-scrollbar snap-x snap-mandatory overflow-x-auto scroll-smooth px-4 pb-2 sm:px-6"
          >
            <div className="flex w-max gap-4 pr-4 sm:gap-6 sm:pr-6">
              {prestigeSlider.map((src, index) => (
                <motion.div
                  key={`${src}-${index}`}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  className="snap-start"
                >
                  <div className="group relative h-[280px] w-[200px] flex-shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-[#111216] sm:h-[380px] sm:w-[280px] lg:h-[440px] lg:w-[320px]">
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_10%,rgba(10,11,13,0.75)_100%)] opacity-90" />
                    <Image
                      src={src}
                      alt="Premium showcase"
                      fill
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 280px, 320px"
                      quality={68}
                      className="object-cover"
                    />
                    <div className="absolute inset-0 ring-1 ring-white/10 transition duration-500 group-hover:ring-[#f5d68c]/40" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(10,11,13,0)_0%,rgba(10,11,13,0.9)_100%)]" />
                    <span className="pointer-events-none absolute bottom-5 left-5 text-[10px] uppercase tracking-[0.24em] text-[#f5d68c]/80 sm:bottom-6 sm:left-6 sm:text-[11px] sm:tracking-[0.35em]">
                      Private Edition
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="deferred-section relative z-10 bg-[#0b0c10] pb-20 pt-12 sm:pb-24">
        <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="w-full">
              <p className="font-cinzel text-[1.8rem] uppercase tracking-[0.16em] text-[#f5d68c] sm:text-5xl sm:tracking-[0.3em] lg:text-6xl">
                Premium Collection
              </p>
              <p className="mt-4 w-full text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-lg lg:text-xl">
                The Top Premium section features carefully selected profiles
                offering a refined, stylish, and high-quality experience.
                Designed for those who appreciate class, privacy, and
                professionalism, these premium profiles represent the perfect
                balance of elegance, discretion, and exclusivity.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4 overflow-hidden sm:mt-12 sm:space-y-6">
          {[
            { direction: 1, duration: 42 },
            { direction: -1, duration: 48 },
            { direction: 1, duration: 54 },
          ].map((row, rowIndex) => (
            <motion.div
              key={`row-${rowIndex}`}
              className="flex gap-3 px-4 sm:gap-6 sm:px-6"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      x: row.direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"],
                    }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: row.duration,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }
              }
            >
              {[...infiniteVisualsRows[rowIndex], ...infiniteVisualsRows[rowIndex]].map(
                (src, index) => (
                  <motion.div
                    key={`${src}-${rowIndex}-${index}`}
                    whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                    className="group relative h-[150px] w-[180px] flex-shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-[#111216] shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition sm:h-[230px] sm:w-[300px] lg:h-[260px] lg:w-[380px]"
                  >
                    <Image
                      src={src}
                      alt="Luxury gallery"
                      fill
                      sizes="(max-width: 640px) 180px, (max-width: 1024px) 300px, 380px"
                      quality={66}
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_0%,rgba(10,11,13,0.6)_100%)] opacity-70 transition group-hover:opacity-90" />
                    <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(245,214,140,0.35),rgba(10,11,13,0)_55%)]" />
                    </div>
                    <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 rotate-6 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-0 transition duration-700 group-hover:left-full group-hover:opacity-100" />
                  </motion.div>
                )
              )}
            </motion.div>
          ))}
        </div>
      </section>

      <section className="deferred-section relative z-10 bg-[#0c0d10] py-14 sm:py-20">
        <div className="mx-auto w-full max-w-[88rem] px-4 text-center sm:px-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.4 }}
            className="text-xs uppercase tracking-[0.3em] text-[#f5d68c] sm:text-sm sm:tracking-[0.4em]"
          >
            Trust & Discretion
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.4 }}
            className="mt-4 text-lg font-semibold leading-tight sm:mt-5 sm:text-3xl lg:text-4xl"
          >
            Privacy-led service, held to the highest standards.
          </motion.h2>
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {[
              "Confidential service",
              "Discreet communication",
              "Professional standards",
              "Verified companions",
            ].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70 sm:p-6"
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#141519] text-[#f5d68c] shadow-[0_8px_18px_rgba(245,179,92,0.15)]">
                  <NavIcon path="M12 3l7 4v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4Z" />
                </span>
                <p>{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="deferred-section relative z-10">
        <div className="relative overflow-hidden">
          <motion.div style={shouldReduceMotion ? undefined : { y: ctaY }} className="absolute inset-0">
            <Image
              src="/images/Frauen%20in%20Limousine.jpeg"
              alt="Evening elegance"
              fill
              sizes="100vw"
              quality={70}
              className="object-cover object-center"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(5,6,8,0.88)_20%,rgba(10,11,13,0.7)_60%,rgba(10,11,13,0.92)_95%)]" />
          <div className="relative mx-auto flex min-h-[50vh] w-full max-w-[88rem] flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[60vh] sm:px-6 sm:py-24">
            <motion.h2
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.4 }}
              className="text-xl font-semibold leading-tight sm:text-3xl lg:text-5xl"
            >
              Ready to explore Barcelona in confidence and style?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.4 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base lg:text-lg"
            >
              Discover an elite circle of companions for private, curated
              experiences.
            </motion.p>
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={
                shouldReduceMotion
                  ? undefined
                  : { duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }
              }
              viewport={{ once: true, amount: 0.4 }}
            >
              <Link
                href="/girls"
                aria-label="View profiles"
                className="mt-6 inline-flex min-w-[14rem] justify-center rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.3)] transition hover:brightness-110 sm:mt-8 sm:min-w-0 sm:px-10 sm:py-3 sm:text-xs sm:tracking-[0.3em]"
              >
                View Profiles
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="deferred-section relative z-10 pb-20 pt-10 sm:pb-24 sm:pt-12">
        <div className="mx-auto w-full max-w-[88rem] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="w-full">
              <p className="font-cinzel text-[1.8rem] uppercase tracking-[0.16em] text-[#f5d68c] sm:text-5xl sm:tracking-[0.3em] lg:text-6xl">
                New Comers-Latest Addition
              </p>
              <p className="mb-4 mt-4 max-w-4xl text-sm leading-relaxed text-white/75 sm:mb-5 sm:mt-6 sm:text-lg lg:text-xl">
                Discover our newest arrivals featuring fresh faces, verified
                profiles, and exciting premium experiences, carefully curated for
                style, quality, and discretion.
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 grid w-full max-w-[88rem] gap-4 px-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 sm:px-6 lg:grid-cols-4">
          {latestProfilesSafe.map((profile, index) => {
            const isFallback = profile.id.startsWith("fallback-");
            const card = (
              <motion.div
                key={profile.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : {
                        duration: 0.8,
                        delay: index * 0.08,
                        ease: [0.16, 1, 0.3, 1],
                      }
                }
                viewport={{ once: true, amount: 0.35 }}
                className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5 text-left shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
                whileHover={shouldReduceMotion ? undefined : { y: -6 }}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={profile.image ?? "/images/hot1.webp"}
                    alt={profile.name}
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw"
                    quality={70}
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_15%,rgba(10,11,13,0.75)_100%)] opacity-80 transition duration-500 group-hover:opacity-90" />
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/80 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M12 20.5s-6.5-4.3-9-8.2C1.4 9 3 6 6.4 6c2.1 0 3.6 1.2 4.6 2.7C12 7.2 13.5 6 15.6 6 19 6 20.6 9 21 12.3c-2.5 3.9-9 8.2-9 8.2Z" />
                    </svg>
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                      New
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {profile.name}
                      {profile.age ? `, ${profile.age}` : ""}
                    </p>
                    {profile.location && (
                      <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path d="M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z" />
                        </svg>
                        {profile.location}
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1 text-xs text-[#f5d68c]">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3.5 w-3.5"
                          fill="currentColor"
                        >
                          <path d="M12 3.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 3.5Z" />
                        </svg>
                        4.7
                      </div>
                      <span className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-black opacity-100 transition duration-500 sm:translate-y-2 sm:opacity-0 sm:tracking-[0.3em] sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        View Profile
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );

            if (isFallback) {
              return (
                <div key={profile.id} className="cursor-default">
                  {card}
                </div>
              );
            }

            return (
              <Link key={profile.id} href={getPublicProfileHref(profile)}>
                {card}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
