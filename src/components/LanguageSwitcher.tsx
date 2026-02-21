"use client";

import { useSyncExternalStore } from "react";
import {
  getClientLanguageSnapshot,
  getServerLanguageSnapshot,
  subscribeToLanguageChange,
  setSiteLanguage,
  type SiteLanguage,
} from "@/lib/language";

export default function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getClientLanguageSnapshot,
    getServerLanguageSnapshot
  );

  const toggleLanguage = () => {
    const nextLanguage: SiteLanguage = language === "es" ? "en" : "es";
    setSiteLanguage(nextLanguage, { persist: true, reload: true });
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={`Switch language to ${language === "es" ? "English" : "Spanish"}`}
      className={`flex items-center gap-2 rounded-full px-1.5 py-1 text-white/90 transition hover:text-white ${
        compact ? "h-9" : "h-10"
      }`}
    >
      <span className="h-6 w-6 rounded-full bg-[conic-gradient(from_105deg,_#f5d68c,_#f5b35c,_#d46a7a,_#f5d68c)]" />
      <span className="min-w-7 text-xs font-semibold tracking-[0.16em]">
        {language.toUpperCase()}
      </span>
    </button>
  );
}
