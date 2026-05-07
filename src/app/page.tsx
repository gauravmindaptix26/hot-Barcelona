import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import HomeDeferredMount from "../components/home/HomeDeferredMount";

const heroHeadline = ["Where", "Desire", "Meets", "Elegance"];
const heroSubheadline =
  "Hot Barcelona es un portal de escorts y acompanantes independiente que ofrece su acompanamiento exclusivo.";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-80 w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.35),_rgba(245,179,92,0)_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -left-40 top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.22),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.2),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <section className="relative h-screen h-svh overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/Frau%20in%20Dessous%20mit%20Schleife.jpeg"
              alt="Barcelona nightlife"
              fill
              priority
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
              quality={68}
              className="object-cover object-center"
            />
          </div>

          <Navbar logoPriority />

          <div className="relative z-10 mx-auto flex h-[calc(100vh-4.5rem)] h-[calc(100svh-4.5rem)] w-full max-w-[80rem] flex-col items-center justify-center px-4 pb-8 pt-3 text-center sm:h-[calc(100vh-6rem)] sm:h-[calc(100svh-6rem)] sm:px-6 sm:pb-10 sm:pt-8 lg:-mt-40 lg:h-[calc(100vh-7rem)] lg:h-[calc(100svh-7rem)] lg:items-start lg:justify-start lg:pb-16 lg:pl-[8rem] lg:pr-8 lg:pt-12 lg:text-left xl:-mt-44 xl:pl-[9rem] xl:pr-10">
            <p className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-[#f5d68c] sm:gap-4 sm:text-base sm:tracking-[0.45em] lg:justify-start">
              <span className="h-px w-8 bg-[#f5d68c]/70 sm:w-10" />
              Elite Companionship
            </p>
            <h1
              className="mt-5 max-w-[11ch] text-[2.2rem] font-semibold leading-[0.95] text-white sm:mt-6 sm:max-w-3xl sm:text-6xl sm:leading-[1.03] lg:text-6xl xl:text-7xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {heroHeadline.map((word) => (
                <span key={word} className="mr-2 inline-block sm:mr-3">
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
                </span>
              ))}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:mt-5 sm:max-w-xl sm:text-xl sm:leading-[1.25] lg:text-xl">
              {heroSubheadline}
            </p>
            <div className="mt-6 flex w-full flex-wrap justify-center gap-3 sm:mt-8 lg:justify-start">
              <Link
                href="/girls"
                className="group relative inline-flex min-w-[15rem] justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-black shadow-[0_22px_38px_rgba(245,179,92,0.4)] transition sm:min-w-0 sm:px-10 sm:py-3 sm:text-xs sm:tracking-[0.35em]"
              >
                <span className="relative z-10">Discover More -</span>
                <span className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <span className="absolute inset-0 scale-0 rounded-full bg-white/30 blur-xl transition duration-700 group-hover:scale-150" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <HomeDeferredMount />
      </main>
    </div>
  );
}
