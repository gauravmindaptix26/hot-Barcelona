"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import NavIcon from "../../components/NavIcon";

const profiles = [
  {
    id: "jil",
    name: "Jil",
    age: 31,
    location: "Barcelona",
    rating: 4.8,
    reviews: 24,
    status: "Available today",
    image: "/images/hot1.webp",
    tag: "Elite",
    about:
      "An elegant companion with a calm presence and a taste for refined evenings. Discreet, attentive, and effortlessly captivating.",
    details: {
      height: "168 cm",
      body: "Slim",
      hair: "Brunette",
      eyes: "Hazel",
      nationality: "Spanish",
      languages: "Spanish, English",
    },
    style: {
      fashion: "Elegant / Classy",
      personality: ["Soft-spoken", "Confident", "Playful"],
      vibe: ["Candlelight", "Champagne", "Luxe"],
    },
    services: ["Dinner date", "Travel", "Events", "Overnight"],
    availability: {
      days: "Mon - Sun",
      hours: "18:00 - 02:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot1.webp",
      "/images/hot9.webp",
      "/images/hot10.webp",
      "/images/hot12.webp",
    ],
  },
  {
    id: "nike",
    name: "Nike",
    age: 35,
    location: "Berlin",
    rating: 4.8,
    reviews: 19,
    status: "Online now",
    image: "/images/hot2.webp",
    tag: "VIP",
    about:
      "Sophisticated, warm, and magnetic. She blends playful charm with high-class refinement for unforgettable nights.",
    details: {
      height: "170 cm",
      body: "Curvy",
      hair: "Brown",
      eyes: "Brown",
      nationality: "German",
      languages: "German, English",
    },
    style: {
      fashion: "Glam / Bold",
      personality: ["Confident", "Dominant", "Witty"],
      vibe: ["City lights", "Rooftop", "Velvet"],
    },
    services: ["Private time", "Events", "Travel", "Weekend"],
    availability: {
      days: "Thu - Sun",
      hours: "20:00 - 03:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot2.webp",
      "/images/hot11.webp",
      "/images/hot14.jpeg",
      "/images/hot15.jpeg",
    ],
  },
  {
    id: "jolie",
    name: "Jolie",
    age: 33,
    location: "Madrid",
    rating: 4.7,
    reviews: 16,
    status: "Available tonight",
    image: "/images/hot3.webp",
    tag: "Select",
    about:
      "Graceful and poised with a taste for fine dining and intimate conversation. Always composed, always discreet.",
    details: {
      height: "166 cm",
      body: "Athletic",
      hair: "Auburn",
      eyes: "Green",
      nationality: "Spanish",
      languages: "Spanish, English, French",
    },
    style: {
      fashion: "Classy / Chic",
      personality: ["Elegant", "Calm", "Attentive"],
      vibe: ["Opera", "Silk", "Jazz"],
    },
    services: ["Dinner date", "Cultural events", "Travel"],
    availability: {
      days: "Wed - Sun",
      hours: "19:00 - 01:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot3.webp",
      "/images/hot8.webp",
      "/images/hot13.webp",
      "/images/hot17.jpg",
    ],
  },
  {
    id: "mika",
    name: "Mika",
    age: 27,
    location: "Barcelona",
    rating: 4.7,
    reviews: 22,
    status: "Available today",
    image: "/images/hot4.webp",
    tag: "Private",
    about:
      "A sparkling presence with a warm smile. Perfect for elegant evenings, private moments, and curated adventures.",
    details: {
      height: "165 cm",
      body: "Petite",
      hair: "Blonde",
      eyes: "Blue",
      nationality: "Swedish",
      languages: "English, Spanish",
    },
    style: {
      fashion: "Elegant / Soft",
      personality: ["Playful", "Gentle", "Charming"],
      vibe: ["Sunset", "Gold", "Soft light"],
    },
    services: ["Dinner date", "Private time", "Weekend"],
    availability: {
      days: "Tue - Sat",
      hours: "18:00 - 02:00",
      travel: "No",
    },
    gallery: [
      "/images/hot4.webp",
      "/images/hot7.jpg",
      "/images/hot9.webp",
      "/images/hot18.jpg",
    ],
  },
  {
    id: "anya",
    name: "Anya",
    age: 29,
    location: "Valencia",
    rating: 4.9,
    reviews: 28,
    status: "Online now",
    image: "/images/hot5.webp",
    tag: "Elite",
    about:
      "Alluring and refined with a confident aura. Her evenings are tailored, elegant, and unforgettable.",
    details: {
      height: "172 cm",
      body: "Slim",
      hair: "Black",
      eyes: "Brown",
      nationality: "Ukrainian",
      languages: "English, Spanish, Russian",
    },
    style: {
      fashion: "Glam / Elegant",
      personality: ["Confident", "Seductive", "Graceful"],
      vibe: ["Velvet", "Black tie", "Midnight"],
    },
    services: ["Events", "Travel", "Overnight"],
    availability: {
      days: "Fri - Sun",
      hours: "19:00 - 03:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot5.webp",
      "/images/hot10.webp",
      "/images/hot11.webp",
      "/images/hot19.jpg",
    ],
  },
  {
    id: "nina",
    name: "Nina",
    age: 26,
    location: "Barcelona",
    rating: 4.8,
    reviews: 14,
    status: "Available today",
    image: "/images/hot6.jpeg",
    tag: "Signature",
    about:
      "Bright, attentive, and effortlessly chic. She is known for her calm energy and classy presence.",
    details: {
      height: "164 cm",
      body: "Petite",
      hair: "Chestnut",
      eyes: "Brown",
      nationality: "French",
      languages: "French, English, Spanish",
    },
    style: {
      fashion: "Classic / Chic",
      personality: ["Soft-spoken", "Warm", "Elegant"],
      vibe: ["Paris", "Pearl", "Soft glow"],
    },
    services: ["Dinner date", "Events", "Weekend"],
    availability: {
      days: "Mon - Thu",
      hours: "18:00 - 01:00",
      travel: "No",
    },
    gallery: [
      "/images/hot6.jpeg",
      "/images/hot12.webp",
      "/images/hot14.jpeg",
      "/images/hot20.jpg",
    ],
  },
  {
    id: "elise",
    name: "Elise",
    age: 28,
    location: "Nice",
    rating: 4.9,
    reviews: 21,
    status: "Available tonight",
    image: "/images/hot7.jpg",
    tag: "VIP",
    about:
      "A luminous presence with impeccable manners and a confident, sensual aura.",
    details: {
      height: "169 cm",
      body: "Slim",
      hair: "Blonde",
      eyes: "Blue",
      nationality: "French",
      languages: "French, English",
    },
    style: {
      fashion: "Glam / Elegant",
      personality: ["Confident", "Charming", "Poised"],
      vibe: ["Riviera", "Gold", "Sea breeze"],
    },
    services: ["Events", "Travel", "Overnight"],
    availability: {
      days: "Thu - Sun",
      hours: "19:00 - 03:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot7.jpg",
      "/images/hot8.webp",
      "/images/hot13.webp",
      "/images/hot17.jpg",
    ],
  },
  {
    id: "sofia",
    name: "Sofia",
    age: 30,
    location: "Sevilla",
    rating: 4.8,
    reviews: 17,
    status: "Available today",
    image: "/images/hot8.webp",
    tag: "Private",
    about:
      "Warm and magnetic, with a taste for elegant experiences and private dinners.",
    details: {
      height: "167 cm",
      body: "Curvy",
      hair: "Brown",
      eyes: "Brown",
      nationality: "Spanish",
      languages: "Spanish, English",
    },
    style: {
      fashion: "Bold / Classy",
      personality: ["Playful", "Confident", "Bold"],
      vibe: ["Flamenco", "Rose gold", "Candlelight"],
    },
    services: ["Dinner date", "Events", "Weekend"],
    availability: {
      days: "Wed - Sun",
      hours: "18:00 - 02:00",
      travel: "No",
    },
    gallery: [
      "/images/hot8.webp",
      "/images/hot10.webp",
      "/images/hot15.jpeg",
      "/images/hot18.jpg",
    ],
  },
  {
    id: "lara",
    name: "Lara",
    age: 24,
    location: "Barcelona",
    rating: 4.6,
    reviews: 11,
    status: "Online now",
    image: "/images/hot9.webp",
    tag: "New",
    about:
      "Fresh, bright, and effortlessly chic. Perfect for tasteful evenings and gentle company.",
    details: {
      height: "163 cm",
      body: "Petite",
      hair: "Blonde",
      eyes: "Green",
      nationality: "Italian",
      languages: "Italian, Spanish, English",
    },
    style: {
      fashion: "Soft / Chic",
      personality: ["Playful", "Sweet", "Warm"],
      vibe: ["Ivory", "Light", "Whisper"],
    },
    services: ["Dinner date", "Events"],
    availability: {
      days: "Fri - Sun",
      hours: "18:00 - 00:00",
      travel: "No",
    },
    gallery: [
      "/images/hot9.webp",
      "/images/hot11.webp",
      "/images/hot14.jpeg",
      "/images/hot19.jpg",
    ],
  },
  {
    id: "clara",
    name: "Clara",
    age: 32,
    location: "Milan",
    rating: 4.8,
    reviews: 20,
    status: "Available tonight",
    image: "/images/hot10.webp",
    tag: "Elite",
    about:
      "Timeless elegance with a confident, sophisticated touch. Ideal for gala nights and refined gatherings.",
    details: {
      height: "171 cm",
      body: "Slim",
      hair: "Brown",
      eyes: "Brown",
      nationality: "Italian",
      languages: "Italian, English",
    },
    style: {
      fashion: "Elegant / Couture",
      personality: ["Poised", "Confident", "Elegant"],
      vibe: ["Couture", "Gold", "Opera"],
    },
    services: ["Events", "Travel", "Weekend"],
    availability: {
      days: "Thu - Sun",
      hours: "19:00 - 03:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot10.webp",
      "/images/hot12.webp",
      "/images/hot17.jpg",
      "/images/hot20.jpg",
    ],
  },
  {
    id: "vera",
    name: "Vera",
    age: 29,
    location: "Paris",
    rating: 4.7,
    reviews: 15,
    status: "Available today",
    image: "/images/hot11.webp",
    tag: "Select",
    about:
      "Parisian charm with a calm, sensual energy. She adores fine art, candlelight, and intimate evenings.",
    details: {
      height: "168 cm",
      body: "Slim",
      hair: "Black",
      eyes: "Brown",
      nationality: "French",
      languages: "French, English",
    },
    style: {
      fashion: "Chic / Elegant",
      personality: ["Soft-spoken", "Romantic", "Refined"],
      vibe: ["Paris", "Champagne", "Velvet"],
    },
    services: ["Dinner date", "Events", "Travel"],
    availability: {
      days: "Tue - Sun",
      hours: "18:00 - 01:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot11.webp",
      "/images/hot14.jpeg",
      "/images/hot15.jpeg",
      "/images/hot18.jpg",
    ],
  },
  {
    id: "lea",
    name: "Lea",
    age: 27,
    location: "Barcelona",
    rating: 4.8,
    reviews: 18,
    status: "Available today",
    image: "/images/hot12.webp",
    tag: "Signature",
    about:
      "A subtle, sophisticated presence with a warm smile and discreet charm.",
    details: {
      height: "165 cm",
      body: "Slim",
      hair: "Brown",
      eyes: "Hazel",
      nationality: "Spanish",
      languages: "Spanish, English",
    },
    style: {
      fashion: "Elegant / Soft",
      personality: ["Gentle", "Attentive", "Playful"],
      vibe: ["Ivory", "Soft gold", "Luxury"],
    },
    services: ["Private time", "Dinner date"],
    availability: {
      days: "Mon - Fri",
      hours: "18:00 - 01:00",
      travel: "No",
    },
    gallery: [
      "/images/hot12.webp",
      "/images/hot8.webp",
      "/images/hot13.webp",
      "/images/hot19.jpg",
    ],
  },
  {
    id: "mara",
    name: "Mara",
    age: 25,
    location: "Ibiza",
    rating: 4.9,
    reviews: 12,
    status: "Online now",
    image: "/images/hot13.webp",
    tag: "VIP",
    about:
      "Ibiza nights with a glamorous muse. High energy, warm smile, and unforgettable presence.",
    details: {
      height: "167 cm",
      body: "Athletic",
      hair: "Blonde",
      eyes: "Blue",
      nationality: "Dutch",
      languages: "English, Spanish",
    },
    style: {
      fashion: "Bold / Glam",
      personality: ["Playful", "Confident", "Energetic"],
      vibe: ["Ibiza", "Neon", "Pulse"],
    },
    services: ["Events", "Weekend", "Travel"],
    availability: {
      days: "Thu - Sun",
      hours: "20:00 - 04:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot13.webp",
      "/images/hot15.jpeg",
      "/images/hot17.jpg",
      "/images/hot18.jpg",
    ],
  },
  {
    id: "noa",
    name: "Noa",
    age: 30,
    location: "Lisbon",
    rating: 4.7,
    reviews: 17,
    status: "Available tonight",
    image: "/images/hot14.jpeg",
    tag: "Private",
    about:
      "Minimal, elegant, and captivating. A refined companion for slow dinners and private escapes.",
    details: {
      height: "169 cm",
      body: "Slim",
      hair: "Brown",
      eyes: "Brown",
      nationality: "Portuguese",
      languages: "Portuguese, English, Spanish",
    },
    style: {
      fashion: "Classy / Minimal",
      personality: ["Calm", "Attentive", "Poised"],
      vibe: ["Lisbon", "Satin", "Quiet"],
    },
    services: ["Dinner date", "Travel"],
    availability: {
      days: "Wed - Sun",
      hours: "18:00 - 02:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot14.jpeg",
      "/images/hot10.webp",
      "/images/hot12.webp",
      "/images/hot20.jpg",
    ],
  },
  {
    id: "ari",
    name: "Ari",
    age: 28,
    location: "Barcelona",
    rating: 4.8,
    reviews: 19,
    status: "Available today",
    image: "/images/hot15.jpeg",
    tag: "Elite",
    about:
      "Warm, confident, and attentive. Ideal for refined company and sophisticated evening plans.",
    details: {
      height: "168 cm",
      body: "Athletic",
      hair: "Brown",
      eyes: "Hazel",
      nationality: "Spanish",
      languages: "Spanish, English",
    },
    style: {
      fashion: "Elegant / Sporty",
      personality: ["Confident", "Playful", "Warm"],
      vibe: ["Gold", "Night", "Lounge"],
    },
    services: ["Events", "Travel", "Private time"],
    availability: {
      days: "Tue - Sat",
      hours: "19:00 - 02:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot15.jpeg",
      "/images/hot11.webp",
      "/images/hot17.jpg",
      "/images/hot18.jpg",
    ],
  },
  {
    id: "iris",
    name: "Iris",
    age: 26,
    location: "Monaco",
    rating: 4.9,
    reviews: 23,
    status: "Online now",
    image: "/images/hot17.jpg",
    tag: "Signature",
    about:
      "Monaco elegance with a magnetic aura. High-class, discreet, and unforgettable.",
    details: {
      height: "170 cm",
      body: "Slim",
      hair: "Brunette",
      eyes: "Green",
      nationality: "Italian",
      languages: "Italian, English, French",
    },
    style: {
      fashion: "Couture / Glam",
      personality: ["Confident", "Seductive", "Poised"],
      vibe: ["Monaco", "Gold", "Midnight"],
    },
    services: ["Events", "Travel", "Overnight"],
    availability: {
      days: "Fri - Sun",
      hours: "19:00 - 03:00",
      travel: "Yes",
    },
    gallery: [
      "/images/hot17.jpg",
      "/images/hot8.webp",
      "/images/hot10.webp",
      "/images/hot19.jpg",
    ],
  },
];

const filters = ["Age 20-30", "Barcelona", "4.7+ Rating", "Verified", "Tonight"];

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function GirlsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useMotionValue(0);
  const heroParallax = useTransform(scrollProgress, [0, 1], [0, 80]);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedId) || null,
    [selectedId]
  );

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
        <section className="relative overflow-hidden pb-12 pt-6">
          <Navbar />
          <div className="mx-auto mt-6 w-full max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
                Elite Discovery
              </p>
              <h1
                className="mt-4 text-4xl font-semibold sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Girls Collection
              </h1>
              <p className="mt-4 max-w-2xl text-base text-white/70 sm:text-lg">
                A curated selection of refined companions. Explore profiles,
                compare ratings, and reserve a private introduction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-[0_18px_38px_rgba(0,0,0,0.35)] backdrop-blur"
            >
              <button className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/80 transition hover:text-white">
                Filters
                <NavIcon path="M4 6h16M7 12h10M10 18h4" />
              </button>
              {filters.map((filter) => (
                <span
                  key={filter}
                  className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/60"
                >
                  {filter}
                </span>
              ))}
              <span className="ml-auto text-xs uppercase tracking-[0.3em] text-white/50">
                16 profiles
              </span>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 pb-20">
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {profiles.map((profile) => (
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

          <div className="mt-16 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/50">
              <span className="h-px w-12 bg-white/20" />
              Infinite discovery
              <span className="h-px w-12 bg-white/20" />
            </div>
            <button className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-10 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.3)] transition hover:brightness-110">
              Load More
            </button>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.35em] text-white/50 transition hover:text-white"
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
