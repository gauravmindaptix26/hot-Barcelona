"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  DEFAULT_SITE_LANGUAGE,
  readStoredLanguage,
  TRANSLATION_SCRIPT_REQUEST_EVENT,
} from "@/lib/language";

const LanguageManager = dynamic(() => import("./LanguageManager"), {
  ssr: false,
});

export default function LanguageManagerMount() {
  const [shouldRender, setShouldRender] = useState(() => {
    try {
      return readStoredLanguage() !== DEFAULT_SITE_LANGUAGE;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleRequest = () => {
      setShouldRender(true);
    };

    window.addEventListener(TRANSLATION_SCRIPT_REQUEST_EVENT, handleRequest);
    return () => {
      window.removeEventListener(TRANSLATION_SCRIPT_REQUEST_EVENT, handleRequest);
    };
  }, []);

  return shouldRender ? <LanguageManager /> : null;
}
