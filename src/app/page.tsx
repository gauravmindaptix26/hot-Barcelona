"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Navbar from "../components/Navbar";

const HomeDeferredSections = dynamic(
  () => import("../components/home/HomeDeferredSections"),
  { ssr: false }
);

const heroHeadline = ["Where", "Desire", "Meets", "Elegance"];
const heroSubheadline =
  "Hot Barcelona es un portal de escorts y acompanantes independiente que ofrece su acompanamiento exclusivo.";

export default function Home() {
  const heroRef = useRef<HTMLDivElement | null>(null);
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
          className="relative h-[100svh] overflow-hidden"
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
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>

          <Navbar logoPriority />

          <motion.div
            style={{ scale: heroScale, opacity: heroFade, x: driftX, y: driftY }}
            className="relative z-10 mx-auto flex h-[calc(100svh-4.5rem)] w-full max-w-[88rem] flex-col items-center justify-center px-4 pb-8 pt-3 text-center sm:h-[calc(100svh-6rem)] sm:px-6 sm:pb-10 sm:pt-8 lg:-mt-40 lg:h-[calc(100svh-7rem)] lg:items-start lg:justify-start lg:pb-16 lg:pl-[11rem] lg:pr-8 lg:pt-28 lg:text-left xl:-mt-44 xl:pl-[13rem] xl:pr-12"
          >
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[#f5d68c] sm:gap-4 sm:text-base sm:tracking-[0.45em] lg:justify-start"
            >
              <span className="h-px w-8 bg-[#f5d68c]/70 sm:w-10" />
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
              className="mt-5 max-w-[11ch] text-[2.2rem] font-semibold leading-[0.95] text-white sm:mt-6 sm:max-w-3xl sm:text-6xl sm:leading-[1.03] lg:text-6xl xl:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {heroHeadline.map((word) => (
                <motion.span
                  key={word}
                  className="mr-2 inline-block sm:mr-3"
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
                      <span className="inline-block text-[#f3a0ab] sm:bg-gradient-to-r sm:from-[#f5d68c] sm:via-[#f090a1] sm:to-[#d46a7a] sm:bg-clip-text sm:text-transparent sm:[-webkit-text-fill-color:transparent]">
                        {word}
                      </span>
                      <span className="absolute -bottom-1.5 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f090a1] to-[#d46a7a] sm:-bottom-2" />
                      <span className="absolute -right-3 top-0 h-2.5 w-2.5 rounded-full bg-[#f090a1] sm:-right-6 sm:h-3 sm:w-3" />
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
              className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:mt-5 sm:max-w-xl sm:text-xl sm:leading-[1.25] lg:text-xl"
            >
              {heroSubheadline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 flex w-full flex-wrap justify-center gap-3 sm:mt-8 lg:justify-start"
            >
              <Link
                href="/girls"
                className="group relative inline-flex min-w-[15rem] justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_22px_38px_rgba(245,179,92,0.4)] transition sm:min-w-0 sm:px-10 sm:py-3 sm:text-xs sm:tracking-[0.35em]"
              >
                <span className="relative z-10">Discover More -</span>
                <span className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <span className="absolute inset-0 scale-0 rounded-full bg-white/30 blur-xl transition duration-700 group-hover:scale-150" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <HomeDeferredSections />
      </main>
    </div>
  );
}
