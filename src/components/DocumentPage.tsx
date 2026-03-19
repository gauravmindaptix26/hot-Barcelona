"use client";

import Link from "next/link";
import { useEffect } from "react";
import { requestTranslationRefresh } from "@/lib/language";
import Navbar from "./Navbar";

export type DocumentSection = {
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

export type DocumentPageContent = {
  label: string;
  title: string;
  titleClassName?: string;
  contentClassName?: string;
  intro: string;
  summaryCards: Array<{
    label: string;
    value: string;
  }>;
  sections: DocumentSection[];
  asideTitle?: string;
  asideParagraphs?: string[];
};

export default function DocumentPage({
  content,
}: {
  content: DocumentPageContent;
}) {
  useEffect(() => {
    requestTranslationRefresh();
  }, [content.title]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090a0d] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(245,214,140,0.18),_rgba(9,10,13,0)_62%)]" />
      <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.18),_rgba(212,106,122,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.14),_rgba(245,179,92,0)_70%)] blur-3xl" />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,10,13,0.82)_0%,rgba(9,10,13,0.92)_65%,rgba(9,10,13,1)_100%)]" />
        <div className="relative z-30">
          <Navbar />
        </div>
        <div
          className={`relative z-10 mx-auto flex w-full max-w-[88rem] flex-col gap-8 px-4 pb-14 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:gap-12 lg:pb-20 lg:pt-8 ${
            content.contentClassName ?? ""
          }`}
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f5d68c]/30 bg-[#f5d68c]/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-[#f5d68c]">
                {content.label}
              </div>
              <h1
                className={`mt-5 max-w-[14ch] text-[2.35rem] font-semibold leading-[0.95] text-white sm:text-5xl lg:text-6xl ${
                  content.titleClassName ?? ""
                }`}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {content.title}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/72 sm:text-base lg:text-lg">
                {content.intro}
              </p>
            </div>

            <div className="min-w-0 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-6">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">Overview</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {content.summaryCards.map((item) => (
                  <div
                    key={item.label}
                    className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">
                      {item.label}
                    </p>
                    <p className="mt-2 break-words text-sm font-semibold leading-relaxed text-white/90">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="rounded-[30px] border border-[#f5d68c]/25 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f5d68c]/35 bg-[#f5d68c]/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-[#f5d68c]">
              Important Notice
            </div>
            <h2
              className="mt-5 text-[2rem] font-semibold leading-tight text-[#fff8e7] sm:text-[2.35rem] lg:text-[2.6rem]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {content.title}
            </h2>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {content.sections.map((section) => (
                <article key={section.title} className="min-w-0">
                  {section.eyebrow ? (
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c]">
                      {section.eyebrow}
                    </p>
                  ) : null}
                  <h3
                    className="mt-2 break-words text-lg font-semibold text-white sm:text-xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {section.title}
                  </h3>
                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-white/78 sm:text-[0.98rem]">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="break-words">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.list?.length ? (
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/78 sm:text-[0.98rem]">
                      {section.list.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5d68c]" />
                          <span className="break-words">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>

          {content.asideTitle && content.asideParagraphs?.length ? (
            <aside className="rounded-[30px] border border-[#f5d68c]/20 bg-[linear-gradient(120deg,rgba(245,214,140,0.08),rgba(212,106,122,0.08),rgba(255,255,255,0.03))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c]">Support</p>
                  <h2
                    className="mt-3 text-2xl font-semibold text-white sm:text-3xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {content.asideTitle}
                  </h2>
                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-white/72 sm:text-base">
                    {content.asideParagraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-black"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85"
                  >
                    Return Home
                  </Link>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      </section>
    </main>
  );
}
