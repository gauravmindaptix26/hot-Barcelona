"use client";

import Script from "next/script";
import { useEffect } from "react";
import {
  readStoredLanguage,
  setSiteLanguage,
  type SiteLanguage,
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
    pageLanguage: "auto",
    includedLanguages: "es,en",
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
    ".VIpgJd-yAWNEb-L7lbkb",
    ".VIpgJd-yAWNEb-r4nke",
    ".VIpgJd-yAWNEb-VIpgJd-fmcmS-sn54Q",
    "iframe.VIpgJd-yAWNEb-L7lbkb",
    ".VIpgJd-ZVi9od-aZ2wEe-wOHMyf",
    ".VIpgJd-ZVi9od-aZ2wEe-OiiCO",
    ".VIpgJd-ZVi9od-aZ2wEe",
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

const releaseLanguageLoading = () => {
  document.documentElement.removeAttribute("data-lang-loading");
};

const waitForTranslationReady = (language: SiteLanguage) => {
  if (language === "en") {
    releaseLanguageLoading();
    return;
  }

  let tries = 0;
  const maxTries = 60;

  const checkReady = () => {
    const comboValue =
      document.querySelector<HTMLSelectElement>(".goog-te-combo")?.value ?? "";
    const translated =
      comboValue === language || document.body.classList.contains("translated-ltr");

    tries += 1;
    if (translated || tries >= maxTries) {
      window.clearInterval(intervalId);
      releaseLanguageLoading();
    }
  };

  const intervalId = window.setInterval(checkReady, 120);
  checkReady();
};

export default function LanguageManager() {
  useEffect(() => {
    const preferredLanguage = readStoredLanguage();
    setSiteLanguage(preferredLanguage, { persist: true, reload: false });
    waitForTranslationReady(preferredLanguage);
  }, []);

  useEffect(() => {
    hideGoogleBanner();

    const observer = new MutationObserver(() => {
      hideGoogleBanner();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    const intervalId = window.setInterval(hideGoogleBanner, 1500);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      mountGoogleTranslate();
      const preferredLanguage = readStoredLanguage();
      setSiteLanguage(preferredLanguage, { persist: true, reload: false });
      hideGoogleBanner();
      waitForTranslationReady(preferredLanguage);
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <>
      <div id="google_translate_element" aria-hidden="true" />
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />
    </>
  );
}
