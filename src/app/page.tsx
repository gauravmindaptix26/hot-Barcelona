"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import NavIcon from "../components/NavIcon";

const heroHeadline = ["Where", "Desire", "Meets", "Elegance"];
const heroSubheadline =
  "Exclusive. Sophisticated. Unforgettable. Experience companionship redefined.";

const lifestyleShowcase = [
  "/images/Frau%20in%20Dessous%20mit%20Schleife.jpeg",
  "/images/Frau%20mit%20Koffer%20Kopie%202.jpeg",
  "/images/Frau%20sitzt%20auf%20Mann.png",
  "/images/K%C3%BCssendesPaarStartbild.jpeg",
];

const prestigeSlider = [

   "/images/high-class-berlin1.png",
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
  "/images/high-class-berlin1.png",
   "/images/hot1.webp",
  "/images/Frauen%20in%20Limousine.jpeg",
  "/images/hot2.webp",
  "/images/Frau%20im%20schwarzen%20Kleid.jpg",
  "/images/Frau%20im%20Auto%20.jpg",
  "/images/Frau%20auf%20Sessel.jpg",
   "/images/hot7.jpg",
  "/images/Frau%20in%20Body.jpg",
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
    "/images/high-class-berlin1.png",
  ],
  [
    "/images/Frau%20in%20Dessous%20mit%20Schleife.jpeg",
    "/images/Frau%20mit%20Koffer%20Kopie%202.jpeg",
    "/images/Frau%20sitzt%20auf%20Mann.png",
    "/images/Frauen%20in%20Limousine.jpeg",
    "/images/Frau%20im%20schwarzen%20Kleid.jpg",
    "/images/Frau%20im%20Auto%20.jpg",
    "/images/Frau%20auf%20Sessel.jpg",
    "/images/Frau%20in%20Body.jpg",
    "/images/Frau%20in%20Dessous.jpg",
    "/images/Paar.jpeg",
  ],
];

const allShowcaseImages = Array.from(
  new Set([...prestigeSlider, ...galleryImages, ...lifestyleShowcase])
);

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const lifestyleRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 120, damping: 20 });
  const driftX = useTransform(smoothX, [-0.5, 0.5], ["-10px", "10px"]);
  const driftY = useTransform(smoothY, [-0.5, 0.5], ["-6px", "6px"]);

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.96]);
  const heroFade = useTransform(heroProgress, [0, 1], [1, 0]);

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.35),_rgba(245,179,92,0)_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-40 top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.22),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.2),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <section
          ref={heroRef}
          onMouseMove={(event) => {
            const { left, top, width, height } =
              event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - left) / width - 0.5;
            const y = (event.clientY - top) / height - 0.5;
            mouseX.set(x);
            mouseY.set(y);
          }}
          className="relative min-h-[100svh] overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1.12 }}
            transition={{ duration: 18, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src="/images/Frau%20in%20Dessous%20mit%20Schleife.jpeg"
              alt="Barcelona nightlife"
              fill
              priority
              className="object-cover object-center"
            />
          </motion.div>

          <Navbar />

          <motion.div
            style={{ scale: heroScale, opacity: heroFade, x: driftX, y: driftY }}
            className="relative z-10 mx-auto -mt-4 flex h-full w-full max-w-6xl flex-col justify-center px-6 pt-14 sm:pt-16 lg:pt-20"
          >
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-[#f5d68c] sm:gap-4 sm:text-base sm:tracking-[0.45em]"
            >
              <span className="h-px w-10 bg-[#f5d68c]/70" />
              Elite Companionship
            </motion.p>
            <motion.h1
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.08, delayChildren: 0.15 },
                },
              }}
              className="mt-6 max-w-3xl text-3xl font-semibold leading-[1.15] text-white sm:text-6xl lg:text-7xl xl:text-8xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {heroHeadline.map((word) => (
                <motion.span
                  key={word}
                  className="mr-3 inline-block"
                  variants={{
                    hidden: { opacity: 0, y: 22, rotateX: 35 },
                    show: {
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  {word === "Desire" ? (
                    <span className="relative inline-flex items-center">
                      <span className="bg-gradient-to-r from-[#f5d68c] via-[#f090a1] to-[#d46a7a] bg-clip-text text-transparent">
                        {word}
                      </span>
                      <span className="absolute -bottom-2 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f090a1] to-[#d46a7a]" />
                      <span className="absolute -right-6 top-0 h-3 w-3 rounded-full bg-[#f090a1]" />
                    </span>
                  ) : (
                    word
                  )}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 max-w-xl text-sm text-white/70 sm:mt-5 sm:text-xl lg:text-2xl"
            >
              {heroSubheadline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex flex-wrap gap-4 sm:mt-10"
            >
              <button className="group relative overflow-hidden rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_22px_38px_rgba(245,179,92,0.4)] transition sm:px-10 sm:py-3 sm:text-xs sm:tracking-[0.35em]">
                <span className="relative z-10">Discover More →</span>
                <span className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <span className="absolute inset-0 scale-0 rounded-full bg-white/30 blur-xl transition duration-700 group-hover:scale-150" />
                </span>
              </button>
            </motion.div>
          </motion.div>
        </section>

        <section
          ref={lifestyleRef}
          className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 lg:min-h-screen lg:grid-cols-[0.95fr_1.05fr]"
        >
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, amount: 0.4 }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-[#f5d68c] sm:text-sm sm:tracking-[0.5em]">
              Experience & Lifestyle
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:mt-6 sm:text-5xl lg:text-6xl">
              A curated world of late-night elegance.
            </h2>
            <p className="mt-4 text-base text-white/70 sm:mt-5 sm:text-xl lg:text-2xl">
              Private arrivals, luxury stays, and discreet introductions crafted
              with confidence and impeccable detail.
            </p>
            <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/60 sm:mt-10 sm:text-xs sm:tracking-[0.35em]">
              <span className="h-px w-12 bg-white/25" />
              Limited Availability
            </div>
          </motion.div>
          <motion.div
            style={{ y: lifestyleY }}
            className="grid gap-6 sm:grid-cols-2"
          >
            {lifestyleShowcase.slice(0, 4).map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -6 }}
                className="group relative h-[240px] overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-[0_24px_50px_rgba(0,0,0,0.35)] sm:h-[280px] md:h-[320px] lg:h-[340px]"
              >
                <Image src={src} alt="Lifestyle moment" fill className="object-cover" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_0%,rgba(10,11,13,0.55)_100%)] transition group-hover:opacity-90" />
                <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(245,214,140,0.35),rgba(10,11,13,0)_55%)]" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="relative z-10 flex flex-col justify-center bg-[#0c0d10] py-16 lg:min-h-screen">
          <div className="mx-auto w-full max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, amount: 0.4 }}
              className="max-w-2xl"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-[#f5d68c] sm:tracking-[0.45em]">
                Signature Moments
              </p>
              <h2 className="mt-4 text-2xl font-semibold sm:text-5xl lg:text-6xl">
                Luxury visuals, in motion.
              </h2>
              <p className="mt-3 text-sm text-white/60 sm:mt-4 sm:text-base lg:text-lg">
                A private collection of evening imagery, curated for a refined
                gaze.
              </p>
            </motion.div>
          </div>
          <div className="mt-12 overflow-hidden">
            <motion.div
              className="flex gap-8 px-6"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            >
              {[...prestigeSlider, ...prestigeSlider].map((src, index) => (
                <motion.div
                  key={`${src}-${index}`}
                  whileHover={{ y: -6 }}
                className="group relative h-[320px] w-[240px] flex-shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#111216] sm:h-[380px] sm:w-[280px] lg:h-[440px] lg:w-[320px]"
              >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_10%,rgba(10,11,13,0.75)_100%)] opacity-90" />
                  <Image src={src} alt="Premium showcase" fill className="object-cover" />
                  <div className="absolute inset-0 ring-1 ring-white/10 transition duration-500 group-hover:ring-[#f5d68c]/40" />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(10,11,13,0)_0%,rgba(10,11,13,0.9)_100%)]" />
                  <span className="pointer-events-none absolute bottom-6 left-6 text-[11px] uppercase tracking-[0.35em] text-[#f5d68c]/80">
                    Private Edition
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 bg-[#0b0c10] py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-[#f5d68c] sm:tracking-[0.5em]">
                  Infinite Visuals
                </p>
                <h2 className="mt-4 text-3xl font-semibold sm:mt-5 sm:text-4xl lg:text-5xl">
                  A luxury image installation in motion.
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">
                Curated flow
              </span>
            </div>
          </div>

          <div className="mt-12 space-y-6 overflow-hidden">
            {[
              { direction: 1, duration: 42 },
              { direction: -1, duration: 48 },
              { direction: 1, duration: 54 },
            ].map((row, rowIndex) => (
              <motion.div
                key={`row-${rowIndex}`}
                className="flex gap-6 px-6"
                animate={{
                  x: row.direction === 1 ? ["0%", "-50%"] : ["-50%", "0%"],
                }}
                transition={{
                  duration: row.duration,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                {[
                  ...infiniteVisualsRows[rowIndex],
                  ...infiniteVisualsRows[rowIndex],
                ].map((src, index) => (
                  <motion.div
                    key={`${src}-${rowIndex}-${index}`}
                    whileHover={{ scale: 1.03 }}
                className="group relative h-[200px] w-[240px] flex-shrink-0 overflow-hidden rounded-[26px] border border-white/10 bg-[#111216] shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition sm:h-[230px] sm:w-[300px] lg:h-[260px] lg:w-[380px]"
              >
                    <Image
                      src={src}
                      alt="Luxury gallery"
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_0%,rgba(10,11,13,0.6)_100%)] opacity-70 transition group-hover:opacity-90" />
                    <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,rgba(245,214,140,0.35),rgba(10,11,13,0)_55%)]" />
                    </div>
                    <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 rotate-6 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-0 transition duration-700 group-hover:left-full group-hover:opacity-100" />
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative z-10 bg-[#0c0d10] py-16 sm:py-20">
          <div className="mx-auto w-full max-w-5xl px-6 text-center">
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
              className="mt-4 text-xl font-semibold sm:mt-5 sm:text-3xl lg:text-4xl"
            >
              Privacy-led service, held to the highest standards.
            </motion.h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70"
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

        <section ref={ctaRef} className="relative z-10">
          <div className="relative overflow-hidden">
            <motion.div style={{ y: ctaY }} className="absolute inset-0">
              <Image
                src="/images/Frauen%20in%20Limousine.jpeg"
                alt="Evening elegance"
                fill
                className="object-cover object-center"
              />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(5,6,8,0.88)_20%,rgba(10,11,13,0.7)_60%,rgba(10,11,13,0.92)_95%)]" />
            <div className="relative mx-auto flex min-h-[55vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center sm:min-h-[60vh] sm:py-24">
              <motion.h2
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.4 }}
                className="text-2xl font-semibold sm:text-3xl lg:text-5xl"
              >
                Ready to explore Barcelona in confidence and style?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.4 }}
                className="mt-4 max-w-xl text-sm text-white/70 sm:text-base lg:text-lg"
              >
                Discover an elite circle of companions for private, curated
                experiences.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, amount: 0.4 }}
                className="mt-6 rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-7 py-2.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.3)] transition hover:brightness-110 sm:mt-8 sm:px-10 sm:py-3 sm:text-xs sm:tracking-[0.3em]"
              >
                View Profiles
              </motion.button>
            </div>
          </div>
        </section>

        <section className="relative z-10 py-20 sm:py-24">
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-[#f5d68c] sm:tracking-[0.5em]">
                  Visual Showcase
                </p>
                <h2 className="mt-4 text-3xl font-semibold sm:mt-5 sm:text-4xl lg:text-5xl">
                  A cinematic glimpse into the lifestyle.
                </h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">
                Curated frames
              </span>
            </div>
          </div>
          <div className="mx-auto mt-10 grid w-full max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryImages.map((src, index) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                viewport={{ once: true, amount: 0.35 }}
                className={`group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/5 ${
                  index % 3 === 0
                    ? "h-[260px] sm:h-[320px] lg:h-[420px]"
                    : index % 3 === 1
                      ? "h-[230px] sm:h-[300px] lg:h-[360px]"
                      : "h-[280px] sm:h-[340px] lg:h-[460px]"
                }`}
                whileHover={{ y: -6 }}
              >
                <Image
                  src={src}
                  alt="Lifestyle gallery"
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_0%,rgba(10,11,13,0.6)_100%)] opacity-60 transition group-hover:opacity-80" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,214,140,0.35),rgba(10,11,13,0)_50%)] opacity-0 transition duration-700 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 rotate-6 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] opacity-0 transition duration-700 group-hover:left-full group-hover:opacity-100" />
                <span className="pointer-events-none absolute bottom-6 left-6 text-xs uppercase tracking-[0.35em] text-white/70">
                  Private moments
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <Footer />
        </motion.div>
      </main>
    </div>
  );
}
