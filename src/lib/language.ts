export type SiteLanguage = "es" | "en";

export const DEFAULT_SITE_LANGUAGE: SiteLanguage = "es";

const STORAGE_KEY = "hb_site_language";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const normalizeLanguage = (value: string | null | undefined): SiteLanguage =>
  value === "en" ? "en" : "es";

export const readStoredLanguage = (): SiteLanguage => {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_LANGUAGE;
  }
  return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
};

const writeGoogleTranslateCookie = (language: SiteLanguage) => {
  if (typeof document === "undefined") {
    return;
  }
  const value = `/auto/${language}`;
  document.cookie = `googtrans=${value};path=/;max-age=${COOKIE_MAX_AGE_SECONDS}`;
  document.cookie = `googtrans=${value};path=/`;
};

const syncGoogleTranslateSelect = (language: SiteLanguage) => {
  if (typeof document === "undefined") {
    return;
  }
  const select = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!select || select.value === language) {
    return;
  }
  select.value = language;
  select.dispatchEvent(new Event("change"));
};

export const setSiteLanguage = (
  language: SiteLanguage,
  options?: { persist?: boolean; reload?: boolean }
) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const persist = options?.persist ?? true;
  const reload = options?.reload ?? false;

  if (persist) {
    window.localStorage.setItem(STORAGE_KEY, language);
  }

  document.documentElement.lang = language;
  writeGoogleTranslateCookie(language);
  syncGoogleTranslateSelect(language);

  if (reload) {
    window.setTimeout(() => {
      window.location.reload();
    }, 120);
  }
};
