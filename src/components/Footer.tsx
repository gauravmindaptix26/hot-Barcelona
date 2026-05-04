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
const whatsappNumber = "+34 621 385 161";
const whatsappHref = "https://wa.me/34621385161";

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

          <div className="flex flex-wrap items-end justify-between gap-4 text-xs uppercase tracking-[0.25em] text-white/50">
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

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label={`Chat on WhatsApp at ${whatsappNumber}`}
        className="fixed bottom-4 left-4 z-[70] inline-flex h-[4.15rem] w-[4.15rem] items-center justify-center rounded-full bg-[#2bc21f] shadow-[0_16px_28px_rgba(43,194,31,0.26)] transition hover:scale-105 sm:bottom-5 sm:left-5 sm:h-[4.35rem] sm:w-[4.35rem]"
      >
        <svg viewBox="0 0 24 24" className="h-[2.15rem] w-[2.15rem] sm:h-[2.25rem] sm:w-[2.25rem]" fill="none" aria-hidden="true">
          <path
            d="M12 4.25c-4.24 0-7.69 3.33-7.69 7.44c0 1.38.39 2.72 1.13 3.89L4.5 19.75l4.35-1.13a7.83 7.83 0 0 0 3.08.63h.01c4.25 0 7.7-3.33 7.7-7.44a7.3 7.3 0 0 0-2.25-5.27A7.76 7.76 0 0 0 12 4.25Zm0 13.15h-.01a6.52 6.52 0 0 1-3.32-.91l-.24-.14-2.57.67l.69-2.49-.16-.25a6.44 6.44 0 0 1-1.01-3.45c0-3.57 2.99-6.47 6.66-6.47c1.81 0 3.5.69 4.76 1.92a6.3 6.3 0 0 1 1.96 4.59c0 3.57-2.99 6.47-6.66 6.47Zm3.66-4.85c-.2-.1-1.17-.57-1.35-.64c-.18-.07-.31-.1-.44.1c-.13.2-.51.64-.63.77c-.11.13-.23.15-.43.05c-.2-.1-.83-.3-1.58-.95c-.58-.51-.98-1.14-1.09-1.34c-.11-.2-.01-.31.08-.41c.08-.08.18-.2.26-.31c.08-.1.11-.18.18-.29c.06-.1.03-.2-.02-.3c-.05-.1-.44-1.03-.6-1.41c-.16-.38-.32-.33-.44-.33h-.37c-.13 0-.34.05-.52.24c-.18.2-.69.67-.69 1.64c0 .97.72 1.91.81 2.04c.1.13 1.4 2.08 3.39 2.92c.47.2.83.32 1.11.4c.47.14.89.12 1.23.07c.37-.06 1.17-.46 1.34-.91c.16-.46.16-.84.11-.91c-.05-.08-.18-.12-.38-.22Z"
            fill="#fff"
          />
        </svg>
      </a>
    </>
  );
}
