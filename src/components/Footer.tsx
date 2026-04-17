import Image from "next/image";
import Link from "next/link";

const infoLinks = [
  { label: "Home", href: "/" },
  { label: "Girls", href: "/girls" },
  { label: "Trans", href: "/trans-escorts" },
  { label: "Contact", href: "/contact" },
  { label: "Advertise", href: "/registro-escorts" },
];

const brandLogoSrc = "/images/hot-loho3.png";

const instagramImages = [
  "/images/Frauen%20in%20Limousine.jpeg",
  "/images/Frau%20mit%20Koffer%20Kopie%202.jpeg",
  "/images/Frau%20im%20Auto%20.jpg",
  "/images/Frau%20auf%20Sessel.jpg",
  "/images/Frau%20in%20Dessous.jpg",
  "/images/Frau%20in%20Body.jpg",
];

const legalDisclaimerParagraphs = [
  "Hot Barcelona es un portal de perfiles de escorts y acompañantes independiente que ofrece su acompañamiento exclusivo, y solo de personas independientes mayores de edad actuando por si misma prestando una asistencia de compañia. En este portal la expresión escort refiere a acompañante y no obligatoriamente implica servicios sexuales.",
  "Hot Barcelona es un portal que NO se promociona a la prostutucion sino EXCLUSIVAMENTE acompañantes de lujo (escorts) sin implicaciones sexuales. Este portal tampoco y bajo ninguna circumstancia se dedidica a promover locales nocturnos, burdeles, pisos relax, clubs de alterne, prostíbulos y saunas eróticas o similar.",
  "En todos casos cualquier contacto entre los usuario y de los anunciantes serán responsabilidad de los dos partes mencionados (usuario y anuncuiante), un acuerdo entre terceros y privado, y bajo nunguna circumstancia la responsablidad sera del portal de Hot Barcelona.",
  "El portal de Hot Baecelona se dedidica EXCLUSIVAMENTE a ofrecer un portal con un espacio a personas independientes y mayor de edad a crear contacto entre terceros adultos.",
];

export default function Footer() {
  const visibleInfoLinks = infoLinks.slice(0, 5);

  return (
    <>
      <section className="deferred-section relative bg-[#100b13] px-4 pb-4 pt-7 text-white sm:px-6 sm:pt-8">
        <div className="mx-auto w-full max-w-[80rem]">
          <div className="rounded-2xl border border-[#f5d68c]/25 bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-4 shadow-[0_16px_44px_rgba(0,0,0,0.38)] backdrop-blur-sm sm:p-6">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f5d68c]/35 bg-[#f5d68c]/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f5d68c]">
              Aviso Importante
            </div>
            <h3 className="font-cinzel text-lg text-[#fff8e7] sm:text-xl">Condiciones Del Portal Hot Barcelona</h3>
            <div className="mt-4 grid gap-3 text-xs leading-relaxed text-white/80 sm:text-[0.83rem] md:grid-cols-2">
              {legalDisclaimerParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="deferred-section relative z-10 bg-[#151018] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,214,140,0.08),_rgba(21,16,24,0)_60%)]" />
        <div className="relative z-10 mx-auto w-full max-w-[80rem] px-4 pb-14 pt-14 sm:px-6 sm:pb-16 sm:pt-18">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.9fr_1fr]">
            <div>
              <div>
                <div className="relative h-36 w-72 sm:h-40 sm:w-80">
                  <Image
                    src={brandLogoSrc}
                    alt="Hot Barcelona"
                    fill
                    sizes="(max-width: 640px) 18rem, 20rem"
                    quality={78}
                    className="object-contain object-left"
                  />
                </div>
              </div>
              <div className="mt-5 space-y-2 text-lg text-white/70">
                <p>
                  <a href="tel:+34621385161" className="underline decoration-white/25 underline-offset-4 hover:text-white">
                    +34 621 385 161
                  </a>
                </p>
                <p>support@hotbarcelona.com</p>
              </div>
              <div className="mt-7 flex w-full max-w-[28rem] items-center gap-3 rounded-full border border-white/10 bg-white/5 px-6 py-3.5">
                <input
                  type="email"
                  aria-label="Email address"
                  autoComplete="email"
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
              <ul className="mt-6 space-y-3 pl-6 text-lg text-white/70 sm:pl-8">
                {visibleInfoLinks.map((item) => (
                  <li key={item.href} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#f5d68c]" />
                    <Link
                      href={item.href}
                      className="shrink-0 text-left text-white/70 outline-none"
                      style={{ color: "rgba(255,255,255,0.7)", WebkitTextFillColor: "rgba(255,255,255,0.7)" }}
                    >
                      {item.label}
                    </Link>
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
                    <Image
                      src={src}
                      alt="Instagram preview"
                      fill
                      sizes="(max-width: 640px) 28vw, (max-width: 1024px) 18vw, 10vw"
                      quality={68}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="my-10 h-px w-full bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)]" />

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs uppercase tracking-[0.25em] text-white/50">
            <p>(c) 2026 Hot Barcelona. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <Link href="/legal-notice" className="text-white/55 transition hover:text-white/80">
                Legal Notice
              </Link>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden="true" />
              <Link href="/privacy-policy" className="text-white/55 transition hover:text-white/80">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
