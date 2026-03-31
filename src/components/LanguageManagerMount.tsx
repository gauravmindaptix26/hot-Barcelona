"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  getClientLanguageSnapshot,
  getServerLanguageSnapshot,
  SOURCE_SITE_LANGUAGE,
  subscribeToLanguageChange,
  TRANSLATION_SCRIPT_REQUEST_EVENT,
} from "@/lib/language";

const LanguageManager = dynamic(() => import("./LanguageManager"), {
  ssr: false,
});

export default function LanguageManagerMount() {
  const [shouldRenderOnRequest, setShouldRenderOnRequest] = useState(false);
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    getClientLanguageSnapshot,
    getServerLanguageSnapshot
  );

  useEffect(() => {
    const handleRequest = () => {
      setShouldRenderOnRequest(true);
    };

    window.addEventListener(TRANSLATION_SCRIPT_REQUEST_EVENT, handleRequest);
    return () => {
      window.removeEventListener(TRANSLATION_SCRIPT_REQUEST_EVENT, handleRequest);
    };
  }, []);

  const shouldRender =
    shouldRenderOnRequest || language !== SOURCE_SITE_LANGUAGE;

  return shouldRender ? <LanguageManager /> : null;
}
