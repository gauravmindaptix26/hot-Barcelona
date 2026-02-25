"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  getClientLanguageSnapshot,
  getServerLanguageSnapshot,
  SITE_LANGUAGES,
  subscribeToLanguageChange,
  setSiteLanguage,
} from "@/lib/language";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getClientLanguageSnapshot,
    getServerLanguageSnapshot
  );

  const activeLanguage =
    SITE_LANGUAGES.find((item) => item.code === language) ?? SITE_LANGUAGES[0];

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const selectLanguage = (nextLanguage: (typeof SITE_LANGUAGES)[number]["code"]) => {
    setIsOpen(false);
    if (nextLanguage === language) return;
    setSiteLanguage(nextLanguage, { persist: true, reload: true });
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Change language"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 rounded-full border border-white/15 bg-transparent px-2 py-1 text-white/90 shadow-[0_12px_26px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-transparent ${
          compact ? "h-9" : "h-10"
        }`}
      >
        <span className="overflow-hidden rounded-full border border-white/15">
          <Image
            src={activeLanguage.flagSrc}
            alt=""
            width={18}
            height={18}
            className="h-[18px] w-[18px] object-cover"
            aria-hidden="true"
          />
        </span>
        <span className="notranslate min-w-7 text-xs font-semibold tracking-[0.14em]">
          {activeLanguage.code.toUpperCase()}
        </span>
        <svg
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-white/70 transition ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="m5 7 5 6 5-6" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-56 max-h-[50svh] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c10]/95 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
            compact ? "right-0" : "left-1/2 -translate-x-1/2"
          }`}
        >
          <div className="mb-1 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-white/45">
            Languages
          </div>
          <div className="grid max-h-[calc(50svh-2.25rem)] gap-1 overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SITE_LANGUAGES.map((item) => {
              const isActive = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => selectLanguage(item.code)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    isActive
                      ? "border border-[#f5d68c]/35 bg-[#f5d68c]/10 text-white"
                      : "border border-transparent bg-white/0 text-white/75 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="overflow-hidden rounded-full border border-white/10">
                      <Image
                        src={item.flagSrc}
                        alt=""
                        width={18}
                        height={18}
                        className="h-[18px] w-[18px] object-cover"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="flex flex-col">
                      <span className="notranslate text-xs font-semibold tracking-[0.14em]">
                        {item.code.toUpperCase()}
                      </span>
                      <span className="notranslate text-[11px] text-white/55">
                        {item.nativeLabel}
                      </span>
                    </span>
                  </span>
                  {isActive && (
                    <svg
                      viewBox="0 0 20 20"
                      className="h-4 w-4 text-[#f5d68c]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      aria-hidden="true"
                    >
                      <path d="m4 10 4 4 8-10" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
