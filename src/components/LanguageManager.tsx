"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  DEFAULT_SITE_LANGUAGE,
  readStoredLanguage,
  setSiteLanguage,
  SUPPORTED_LANGUAGE_CODES,
  TRANSLATION_SCRIPT_REQUEST_EVENT,
} from "@/lib/language";

type GoogleTranslateElementConstructor = (new (
  options: {
    pageLanguage: string;
    includedLanguages: string;
    autoDisplay: boolean;
    layout?: unknown;
  },
  elementId: string
) => unknown) & {
  InlineLayout?: {
    SIMPLE?: unknown;
  };
};

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: GoogleTranslateElementConstructor;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const mountGoogleTranslate = () => {
  const constructor = window.google?.translate?.TranslateElement;
  if (!constructor) {
    return;
  }

  const container = document.getElementById("google_translate_element");
  if (!container || container.childElementCount > 0) {
    return;
  }

  const options: {
    pageLanguage: string;
    includedLanguages: string;
    autoDisplay: boolean;
    layout?: unknown;
  } = {
    pageLanguage: "en",
    includedLanguages: SUPPORTED_LANGUAGE_CODES.join(","),
    autoDisplay: false,
  };

  const layout = constructor.InlineLayout?.SIMPLE;
  if (layout !== undefined) {
    options.layout = layout;
  }

  new constructor(options, "google_translate_element");
};

const hideGoogleBanner = () => {
  const selectors = [
    "iframe.goog-te-banner-frame",
    ".goog-te-banner-frame",
    "#goog-gt-tt",
    ".goog-tooltip",
    ".goog-te-balloon-frame",
  ];
  selectors.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
      node.style.setProperty("height", "0", "important");
      node.style.setProperty("opacity", "0", "important");
      node.style.setProperty("pointer-events", "none", "important");
    });
  });

  document.querySelectorAll<HTMLElement>(".goog-text-highlight").forEach((node) => {
    node.classList.remove("goog-text-highlight");
    node.style.removeProperty("background-color");
    node.style.removeProperty("box-shadow");
  });

  document.body.style.top = "0px";
  document.documentElement.style.top = "0px";
};

const hideTranslateFloatingWidgets = () => {
  const candidates = [
    ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf",
    ".VIpgJd-ZVi9od-aZ2wEe-OiiCO",
    ".VIpgJd-yAWNEb-L7lbkb",
    ".VIpgJd-yAWNEb-r4nke",
    ".VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q",
    "iframe.VIpgJd-yAWNEb-L7lbkb",
  ];

  candidates.forEach((selector) => {
    document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
      const computed = window.getComputedStyle(node);
      const isOverlayLike =
        node.tagName === "IFRAME" ||
        computed.position === "fixed" ||
        computed.position === "absolute" ||
        Number.parseFloat(computed.zIndex || "0") >= 1000;

      if (!isOverlayLike) {
        return;
      }

      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
      node.style.setProperty("opacity", "0", "important");
      node.style.setProperty("pointer-events", "none", "important");
    });
  });
};

export default function LanguageManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() ?? "";
  const [shouldLoadScript, setShouldLoadScript] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return readStoredLanguage() !== DEFAULT_SITE_LANGUAGE;
  });

  useEffect(() => {
    const preferredLanguage = readStoredLanguage();
    setSiteLanguage(preferredLanguage, { persist: true, reload: false });
  }, []);

  useEffect(() => {
    const handleScriptRequest = () => {
      setShouldLoadScript(true);
    };

    window.addEventListener(TRANSLATION_SCRIPT_REQUEST_EVENT, handleScriptRequest);
    return () => {
      window.removeEventListener(TRANSLATION_SCRIPT_REQUEST_EVENT, handleScriptRequest);
    };
  }, []);

  useEffect(() => {
    if (!shouldLoadScript) {
      return;
    }

    hideGoogleBanner();
    hideTranslateFloatingWidgets();

    let frame = 0;
    const observer = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        hideGoogleBanner();
        hideTranslateFloatingWidgets();
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const intervalId = window.setInterval(() => {
      hideGoogleBanner();
      hideTranslateFloatingWidgets();
    }, 1500);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [shouldLoadScript]);

  useEffect(() => {
    if (!shouldLoadScript) {
      return;
    }

    window.googleTranslateElementInit = () => {
      mountGoogleTranslate();
      const preferredLanguage = readStoredLanguage();
      setSiteLanguage(preferredLanguage, { persist: true, reload: false });
      hideGoogleBanner();
      hideTranslateFloatingWidgets();
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, [shouldLoadScript]);

  useEffect(() => {
    const preferredLanguage = readStoredLanguage();

    if (preferredLanguage === DEFAULT_SITE_LANGUAGE) {
      return;
    }

    const timers = [120, 420, 900].map((delay) =>
      window.setTimeout(() => {
        setSiteLanguage(preferredLanguage, { persist: false, reload: false });
        hideGoogleBanner();
        hideTranslateFloatingWidgets();
      }, delay)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname, searchKey]);

  return (
    <>
      <div id="google_translate_element" aria-hidden="true" />
      {shouldLoadScript ? (
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="lazyOnload"
        />
      ) : null}
    </>
  );
}
