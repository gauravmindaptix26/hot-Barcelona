"use client";

import Script from "next/script";
import { useEffect, useEffectEvent, useRef, useState } from "react";
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

const TRANSLATION_REFRESH_DELAYS = [0, 260, 900];
const TRANSLATION_REFRESH_COOLDOWN_MS = 1600;
const ATTRIBUTE_TRANSLATION_APPLY_DELAY_MS = 220;
const ATTRIBUTE_BUFFER_ID = "hb_translate_attribute_buffer";
const TRANSLATABLE_ATTRIBUTES = ["placeholder", "aria-label", "title"] as const;

type TranslatableAttribute = (typeof TRANSLATABLE_ATTRIBUTES)[number];

const getAttributeSourceKey = (attribute: TranslatableAttribute) =>
  `data-hb-translate-source-${attribute}`;

const isTranslationUiNode = (node: Node | null) => {
  let current: Node | null = node;

  while (current) {
    if (current instanceof HTMLElement) {
      if (current.id === "google_translate_element") {
        return true;
      }

      const className = current.className;
      if (typeof className === "string") {
        const classes = className.split(/\s+/);
        if (
          classes.some(
            (value) =>
              value === "skiptranslate" ||
              value.startsWith("goog-") ||
              value.startsWith("VIpgJd-")
          )
        ) {
          return true;
        }
      }
    }

    current = current.parentNode;
  }

  return false;
};

const hasMeaningfulText = (node: Node) => {
  if (isTranslationUiNode(node)) {
    return false;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    return Boolean(node.textContent?.trim());
  }

  if (!(node instanceof HTMLElement)) {
    return false;
  }

  if (
    node instanceof HTMLScriptElement ||
    node instanceof HTMLStyleElement ||
    node instanceof HTMLMetaElement ||
    node.hidden
  ) {
    return false;
  }

  return Boolean(node.innerText?.trim() || node.textContent?.trim());
};

const hasMeaningfulMutation = (mutations: MutationRecord[]) =>
  mutations.some((mutation) => {
    if (mutation.type === "characterData") {
      return hasMeaningfulText(mutation.target);
    }

    return Array.from(mutation.addedNodes).some((node) => hasMeaningfulText(node));
  });

const getAttributeBuffer = () => document.getElementById(ATTRIBUTE_BUFFER_ID) as HTMLDivElement | null;

const ensureAttributeBuffer = () => {
  const existing = getAttributeBuffer();
  if (existing) {
    return existing;
  }

  const container = document.createElement("div");
  container.id = ATTRIBUTE_BUFFER_ID;
  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = "1px";
  container.style.height = "1px";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.style.overflow = "hidden";
  container.style.whiteSpace = "pre-wrap";
  document.body.appendChild(container);
  return container;
};

const clearAttributeBuffer = () => {
  getAttributeBuffer()?.replaceChildren();
};

const restoreSourceAttributes = () => {
  const selector = TRANSLATABLE_ATTRIBUTES.map(
    (attribute) => `[${getAttributeSourceKey(attribute)}]`
  ).join(",");

  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
      const source = element.getAttribute(getAttributeSourceKey(attribute));
      if (source !== null) {
        element.setAttribute(attribute, source);
      }
    });
  });
};

const collectTranslatableAttributeEntries = () => {
  const selector = TRANSLATABLE_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",");
  const entries: Array<{
    attribute: TranslatableAttribute;
    element: HTMLElement;
    source: string;
  }> = [];

  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    if (isTranslationUiNode(element)) {
      return;
    }

    TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
      const currentValue = element.getAttribute(attribute);
      if (!currentValue?.trim()) {
        return;
      }

      const sourceKey = getAttributeSourceKey(attribute);
      if (!element.hasAttribute(sourceKey)) {
        element.setAttribute(sourceKey, currentValue);
      }

      const sourceValue = element.getAttribute(sourceKey)?.trim();
      if (!sourceValue) {
        return;
      }

      entries.push({
        attribute,
        element,
        source: sourceValue,
      });
    });
  });

  return entries;
};

const seedAttributeBuffer = (texts: string[]) => {
  const container = ensureAttributeBuffer();
  container.replaceChildren();

  texts.forEach((text, index) => {
    const item = document.createElement("span");
    item.setAttribute("data-hb-translate-buffer-key", String(index));
    item.textContent = text;
    container.appendChild(item);
  });

  return container;
};

const applyTranslatedAttributesFromBuffer = (
  entries: Array<{
    attribute: TranslatableAttribute;
    element: HTMLElement;
    source: string;
  }>
) => {
  const container = getAttributeBuffer();
  if (!container) {
    return;
  }

  const translatedTexts = Array.from(
    container.querySelectorAll<HTMLElement>("[data-hb-translate-buffer-key]")
  ).map((element) => element.innerText.trim() || element.textContent?.trim() || "");

  const uniqueSources = Array.from(new Set(entries.map((entry) => entry.source)));
  const translatedMap = new Map<string, string>();

  uniqueSources.forEach((source, index) => {
    const translated = translatedTexts[index];
    translatedMap.set(source, translated || source);
  });

  entries.forEach((entry) => {
    entry.element.setAttribute(
      entry.attribute,
      translatedMap.get(entry.source) ?? entry.source
    );
  });
};

export default function LanguageManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams?.toString() ?? "";
  const refreshTimersRef = useRef<number[]>([]);
  const lastRefreshAtRef = useRef(0);
  const [shouldLoadScript, setShouldLoadScript] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return readStoredLanguage() !== DEFAULT_SITE_LANGUAGE;
  });

  const clearRefreshTimers = useEffectEvent(() => {
    refreshTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    refreshTimersRef.current = [];
  });

  const refreshActiveTranslation = useEffectEvent((force = false) => {
    const preferredLanguage = readStoredLanguage();

    if (preferredLanguage === DEFAULT_SITE_LANGUAGE) {
      clearRefreshTimers();
      restoreSourceAttributes();
      clearAttributeBuffer();
      return;
    }

    const now = Date.now();
    if (!force && now - lastRefreshAtRef.current < TRANSLATION_REFRESH_COOLDOWN_MS) {
      return;
    }

    lastRefreshAtRef.current = now;
    clearRefreshTimers();

    const attributeEntries = collectTranslatableAttributeEntries();
    if (attributeEntries.length > 0) {
      seedAttributeBuffer(Array.from(new Set(attributeEntries.map((entry) => entry.source))));
    } else {
      clearAttributeBuffer();
    }

    refreshTimersRef.current = TRANSLATION_REFRESH_DELAYS.map((delay) =>
      window.setTimeout(() => {
        setSiteLanguage(preferredLanguage, { persist: false, reload: false });
        hideGoogleBanner();
        hideTranslateFloatingWidgets();

        if (attributeEntries.length > 0) {
          const attributeTimer = window.setTimeout(() => {
            applyTranslatedAttributesFromBuffer(attributeEntries);
          }, ATTRIBUTE_TRANSLATION_APPLY_DELAY_MS);
          refreshTimersRef.current.push(attributeTimer);
        }
      }, delay)
    );
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
    const observer = new MutationObserver((mutations) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        hideGoogleBanner();
        hideTranslateFloatingWidgets();
        if (hasMeaningfulMutation(mutations)) {
          refreshActiveTranslation();
        }
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
      refreshActiveTranslation(true);
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }
  }, [shouldLoadScript]);

  useEffect(() => {
    refreshActiveTranslation(true);
    return () => {
      clearRefreshTimers();
    };
  }, [pathname, searchKey]);

  useEffect(() => {
    return () => {
      clearRefreshTimers();
    };
  }, []);

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
