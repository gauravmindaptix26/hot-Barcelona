"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

const infoLinks = [
  { label: "Home", href: "/" },
  { label: "Girls", href: "/girls" },
  { label: "Trans", href: "/trans-escorts" },
  { label: "Contact", href: "/contact" },
  { label: "Advertise", href: "/registro-escorts" },
];

const instagramImages = [
  "/images/Frauen%20in%20Limousine.jpeg",
  "/images/Frau%20mit%20Koffer%20Kopie%202.jpeg",
  "/images/Frau%20im%20Auto%20.jpg",
  "/images/Frau%20auf%20Sessel.jpg",
  "/images/Frau%20in%20Dessous.jpg",
  "/images/Frau%20in%20Body.jpg",
];

export default function Footer() {
  const router = useRouter();
  const visibleInfoLinks = infoLinks.slice(0, 5);

  return (
    <footer className="relative z-10 bg-[#151018] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,214,140,0.08),_rgba(21,16,24,0)_60%)]" />
      <div className="relative z-10 mx-auto w-full max-w-[88rem] px-4 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.9fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f5d68c]/40 text-[#f5d68c]">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <h3 className="text-2xl font-semibold">About</h3>
            </div>
            <p className="mt-6 text-lg text-white/70">
              Hot-Barcelona
              <br />
              Catalonia, Spain
            </p>
            <div className="mt-5 space-y-2 text-lg text-white/70">
              <p>+34 620 112 889</p>
              <p>support@hotbarcelona.com</p>
            </div>
            <div className="mt-7 flex w-full max-w-[28rem] items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3.5">
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full bg-transparent text-lg text-white/80 placeholder:text-white/40 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] text-black"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 12h16" />
                  <path d="M14 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f5d68c]/40 text-[#f5d68c]">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M8 5h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                  <path d="M9 9h6M9 13h6" />
                </svg>
              </span>
              <h3 className="text-2xl font-semibold">Information</h3>
            </div>
            <ul
              className="mt-6 space-y-3 pl-6 text-lg text-white/70 sm:pl-8"
              translate="no"
            >
              {visibleInfoLinks.map((item) => (
                <li key={item.href} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f5d68c]" />
                  <button
                    type="button"
                    onClick={() => router.push(item.href)}
                    className="notranslate shrink-0 text-left text-white/70 outline-none"
                    translate="no"
                    style={{ color: "rgba(255,255,255,0.7)", WebkitTextFillColor: "rgba(255,255,255,0.7)" }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f5d68c]/40 text-[#f5d68c]">
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="4" y="4" width="16" height="16" rx="5" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="17.5" cy="6.5" r="1" />
                </svg>
              </span>
              <h3 className="text-2xl font-semibold">Instagram</h3>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {instagramImages.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border border-white/10">
                  <Image src={src} alt="Instagram preview" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)]" />

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.25em] text-white/50">
          <p>(c) 2026 Hot Barcelona. All rights reserved.</p>
          <p>Crafted for private, curated experiences.</p>
        </div>
      </div>
    </footer>
  );
}
