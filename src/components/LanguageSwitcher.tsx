"use client";

import { useState } from "react";
import {
  DEFAULT_SITE_LANGUAGE,
  readStoredLanguage,
  setSiteLanguage,
  type SiteLanguage,
} from "@/lib/language";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [language, setLanguage] = useState<SiteLanguage>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SITE_LANGUAGE;
    }
    return readStoredLanguage();
  });

  const toggleLanguage = () => {
    const nextLanguage: SiteLanguage = language === "es" ? "en" : "es";
    setLanguage(nextLanguage);
    setSiteLanguage(nextLanguage, { persist: true, reload: true });
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Switch language to ${language === "es" ? "English" : "Spanish"}`}
      className={`flex items-center gap-2 rounded-lg border border-white/20 bg-[#8d8d8d]/90 px-2.5 py-1.5 text-white shadow-[0_10px_22px_rgba(0,0,0,0.35)] transition hover:bg-[#999999]/90 ${
        compact ? "h-10" : "h-11"
      }`}
    >
      <span className="h-6 w-6 rounded-full bg-[conic-gradient(from_105deg,_#f5d68c,_#f5b35c,_#d46a7a,_#f5d68c)] shadow-[0_0_0_1px_rgba(255,255,255,0.2)]" />
      <span className="min-w-7 text-xs font-semibold tracking-[0.18em]">
        {language.toUpperCase()}
      </span>
    </button>
  );
}
