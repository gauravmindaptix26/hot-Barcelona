"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#F5D68C] pb-6 pt-4 text-black font-semibold">
      <div className="mx-auto w-full max-w-[92rem] px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex flex-col items-start">
              <div className="relative h-[170px] w-[200px]">
                <Image
                  src="/images/HOT-BARCELONA-FINAL-Black.jpg"
                  alt="Hot Barcelona"
                  width={200}
                  height={170}
                  className="h-full w-full object-contain"
                />
              </div>
              <p className="mt-4 text-xl uppercase tracking-[0.4em] text-black">
                Hot Barcelona
              </p>
              <p className="mt-2 max-w-sm text-xl text-black">
                Discreet, premium companionship curated with refined elegance.
              </p>
            </div>
            <p className="mt-4 text-lg uppercase tracking-[0.3em] text-black">
              Available in Barcelona & select cities
            </p>
            <div className="mt-4 flex items-center gap-3">
              {[
                {
                  label: "Email",
                  path: "M4 6h16v12H4zM4 6l8 6 8-6",
                },
                {
                  label: "WhatsApp",
                  path: "M12 4a8 8 0 0 0-7.2 11.6L4 20l4.6-0.8A8 8 0 1 0 12 4Z",
                },
                {
                  label: "Phone",
                  path: "M6 3h4l1 5-3 2a10 10 0 0 0 6 6l2-3 5 1v4a2 2 0 0 1-2 2A15 15 0 0 1 3 7a2 2 0 0 1 3-4Z",
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-black/5 text-black transition hover:border-black/40 hover:shadow-[0_0_18px_rgba(0,0,0,0.2)]"
                  aria-label={item.label}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-lg uppercase tracking-[0.4em] text-black">
              Navigation
            </p>
            <ul className="mt-5 space-y-3 text-xl text-black">
              {[
                "Home",
                "About Us",
                "Services",
                "Profiles",
                "Locations",
                "Contact",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="group inline-flex items-center gap-2 transition hover:text-black"
                  >
                    <span>{item}</span>
                    <span className="h-px w-6 bg-black/0 transition group-hover:bg-black/80" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-lg uppercase tracking-[0.4em] text-black">
              Experiences
            </p>
            <ul className="mt-5 space-y-3 text-xl text-black">
              {[
                "Elite Companionship",
                "Private Meetings",
                "Dinner & Event Companion",
                "Travel Companion",
                "VIP Experience",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="group inline-flex items-center gap-2 transition hover:text-black"
                  >
                    <span>{item}</span>
                    <span className="h-px w-6 bg-black/0 transition group-hover:bg-black/80" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <p className="text-lg uppercase tracking-[0.4em] text-black">
              Trust & Legal
            </p>
            <ul className="mt-5 space-y-3 text-xl text-black">
              {[
                "Privacy Policy",
                "Terms & Conditions",
                "Disclaimer",
                "Imprint",
                "FAQs",
                "Contact Support",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="group inline-flex items-center gap-2 transition hover:text-black"
                  >
                    <span>{item}</span>
                    <span className="h-px w-6 bg-black/0 transition group-hover:bg-black/80" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-lg text-black">
              Your privacy and discretion are always respected.
            </p>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0)_100%)]" />

        <div className="flex flex-wrap items-center justify-between gap-6 text-lg text-black">
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-black/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-black/70 transition hover:border-black/40 hover:text-black">
              DE
            </button>
            <button className="rounded-full border border-black/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-black/70 transition hover:border-black/40 hover:text-black">
              EN
            </button>
          </div>
          <p>Â© 2026 Hot Barcelona. All rights reserved.</p>
          <button className="rounded-full border border-black/15 px-4 py-2 text-sm uppercase tracking-[0.3em] text-black/70 transition hover:border-black/40 hover:text-black">
            Back to top
          </button>
        </div>
      </div>
    </footer>
  );
}
