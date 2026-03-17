"use client";

import { useEffect } from "react";
import {
  DEFAULT_SITE_LANGUAGE,
  readStoredLanguage,
  setSiteLanguage,
} from "@/lib/language";

export default function LanguageBootstrap() {
  useEffect(() => {
    const language = readStoredLanguage();
    setSiteLanguage(language ?? DEFAULT_SITE_LANGUAGE, {
      persist: true,
      reload: false,
    });
  }, []);

  return null;
}
