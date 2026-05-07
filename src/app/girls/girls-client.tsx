"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, useMotionValue, useTransform, type Variants } from "framer-motion";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../../components/Navbar";
import NavIcon from "../../components/NavIcon";
import ProfileActionBar from "../../components/ProfileActionBar";
import ProfileSectionSidebar from "../../components/ProfileSectionSidebar";
import ProfileOfferBadges, {
  ProfileActiveOfferPhotoBadge,
  readOfferHighlights,
} from "../../components/ProfileOfferBadges";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { getCloudinaryImageUrl } from "@/lib/cloudinary-image";
import { normalizeProfileLabel } from "@/lib/profile-labels";
import { normalizeSubscriptionDurationValue } from "@/lib/subscription";

const ProfileReviews = dynamic(() => import("../../components/ProfileReviews"));

const filters = ["Age 20-60", "Barcelona"] as const;
const premiumCategoryFilters = [
  { value: "TOP PREMIUM VIP", label: "VIP PREMIUM SUPERIOR" },
  { value: "TOP PREMIUM BANNER", label: "BANNER PREMIUM SUPERIOR" },
  { value: "Premium superior", label: "PREMIUM SUPERIOR" },
  { value: "TOP PREMIUM STANDARD", label: "TOP PREMIUM STANDARD" },
] as const;
const PAGE_SIZE = 20;
const normalizePremiumCategory = (value: string | null | undefined) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().toUpperCase().replace("TOP PREMIUM TOP", "PREMIUM SUPERIOR")
    : "";
const matchesPremiumCategory = (profile: Profile, category: string) =>
  normalizePremiumCategory(profile.premiumPlan) === normalizePremiumCategory(category);
const formatPremiumPlanLabel = (value: string | null | undefined) => {
  if (typeof value !== "string") return "";
  const normalized = normalizePremiumCategory(value);
  if (normalized === "PREMIUM SUPERIOR") return "Premium superior";
  return value.trim();
};
const formatPremiumDurationLabel = (value: string | null | undefined) =>
  normalizeSubscriptionDurationValue(value) ?? "";

const filterMatches = (profile: Profile, filter: string) => {
  switch (filter) {
    case "Age 20-60":
      return Number.isFinite(profile.age) && profile.age >= 20 && profile.age <= 60;
    case "Barcelona":
      return profile.location.toLowerCase().includes("barcelona");
    default:
      return true;
  }
};

type Profile = {
  id: string;
  name: string;
  age: number;
  location: string;
  rating: number | null;
  reviews: number | null;
  status?: string;
  image: string;
  tag?: string;
  about: string;
  gallery: string[];
  premiumPlan?: string | null;
  premiumDuration?: string | null;
  whatsappHref?: string | null;
  formFields: Record<string, unknown>;
};

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: {},
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const formatAge = (age: number) => (Number.isFinite(age) && age > 0 ? age : "—");
const toDatabaseId = (id: string) => (id.startsWith("db-") ? id.slice(3) : id);
const hasPremiumPlan = (value: string | null | undefined) =>
  typeof value === "string" && value.trim().length > 0;
const hasRatingData = (profile: Profile) =>
  (typeof profile.rating === "number" && profile.rating > 0) ||
  (typeof profile.reviews === "number" && profile.reviews > 0);
const hiddenFormFieldKeys = new Set([
  "password",
  "confirmPassword",
  "email",
  "phone",
  "phonenumber",
  "mobile",
  "mobilenumber",
  "whatsapp",
  "whatsappnumber",
  "contact",
  "contactnumber",
  "userid",
  "_id",
  "isdeleted",
  "approvalstatus",
  "createdat",
  "updatedat",
  "resetpasswordtoken",
  "descriptionhelp",
  "whatsappenabled",
  "telegramenabled",
  "legalacceptance",
]);
const offerFormFieldKeys = new Set(["activeoffer", "nextoffer"]);
const isVisibleFormField = (key: string) => {
  const normalized = key.toLowerCase().replace(/\s+/g, "");
  if (hiddenFormFieldKeys.has(normalized)) return false;
  if (normalized.includes("password")) return false;
  if (normalized.includes("email")) return false;
  if (
    normalized.includes("phone") ||
    normalized.includes("mobile") ||
    normalized.includes("whatsapp") ||
    normalized.includes("contactnumber")
  ) {
    return false;
  }
  return true;
};
const humanizeFieldKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatFieldValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((item) => formatFieldValue(item).trim())
      .filter(Boolean)
      .join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "string") return normalizeProfileLabel(value);
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([nestedKey, nestedValue]) => {
        const formattedNestedValue = formatFieldValue(nestedValue);
        return formattedNestedValue
          ? `${humanizeFieldKey(nestedKey)}: ${formattedNestedValue}`
          : "";
      })
      .filter(Boolean)
      .join(" | ");
  }
  return "";
};
const readFirstFilledField = (fields: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = formatFieldValue(fields[key]);
    if (value) return value;
  }
  return "";
};
const buildGoogleMapsEmbedSrc = (query: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
const buildGoogleMapsDirectionsHref = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
const scheduleDaysOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const isRestValue = (value: string) => value.trim().toLowerCase() === "rest";
const getFilledFormEntries = (fields: Record<string, unknown>) => {
  const regularEntries: Array<{ key: string; label: string; value: string }> = [];
  const scheduleByDay = new Map<string, { start?: string; end?: string }>();

  for (const [key, rawValue] of Object.entries(fields)) {
    if (!isVisibleFormField(key)) continue;
    const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
    if (offerFormFieldKeys.has(normalizedKey)) continue;
    if (normalizedKey === "specialoffer") continue;
    const value = formatFieldValue(rawValue);
    if (!value) continue;

    const scheduleMatch = key.match(/^schedule-(.+)-(start|end)$/i);
    if (scheduleMatch) {
      if (isRestValue(value)) continue;
      const day = scheduleMatch[1];
      const part = scheduleMatch[2].toLowerCase();
      const existing = scheduleByDay.get(day) ?? {};
      if (part === "start") {
        existing.start = value;
      } else {
        existing.end = value;
      }
      scheduleByDay.set(day, existing);
      continue;
    }

    regularEntries.push({
      key,
      label: humanizeFieldKey(key),
      value,
    });
  }

  const orderedScheduleEntries: Array<{ key: string; label: string; value: string }> = [];
  for (const day of scheduleDaysOrder) {
    const dayValues = scheduleByDay.get(day);
    if (!dayValues) continue;
    const mergedValue =
      dayValues.start && dayValues.end
        ? `${dayValues.start} - ${dayValues.end}`
        : dayValues.start ?? dayValues.end ?? "";
    if (!mergedValue) continue;
    orderedScheduleEntries.push({
      key: `schedule-${day}`,
      label: `Schedule ${day}`,
      value: mergedValue,
    });
  }

  for (const [day, dayValues] of scheduleByDay.entries()) {
    if (scheduleDaysOrder.includes(day as (typeof scheduleDaysOrder)[number])) continue;
    const mergedValue =
      dayValues.start && dayValues.end
        ? `${dayValues.start} - ${dayValues.end}`
        : dayValues.start ?? dayValues.end ?? "";
    if (!mergedValue) continue;
    orderedScheduleEntries.push({
      key: `schedule-${day}`,
      label: `Schedule ${day}`,
      value: mergedValue,
    });
  }

  return [...regularEntries, ...orderedScheduleEntries];
};
type FilledFormEntry = {
  key: string;
  label: string;
  value: string;
};
const detailGroupOrder = [
  "identity",
  "description",
  "rates",
  "schedule",
  "services",
  "location",
  "plan",
  "other",
] as const;
const detailGroupLabels: Record<(typeof detailGroupOrder)[number], string> = {
  identity: "Identity",
  description: "Description",
  services: "Services",
  rates: "Rates & Payment",
  schedule: "Schedule",
  location: "Location",
  plan: "Subscription",
  other: "More Details",
};
const getDetailGroupId = (key: string): (typeof detailGroupOrder)[number] => {
  const normalized = key.toLowerCase();
  if (
    [
      "gender",
      "stage",
      "email",
      "phone",
      "age",
      "nationality",
      "language",
      "height",
      "body",
      "hair",
      "eyes",
    ].some((token) => normalized.includes(token))
  ) {
    return "identity";
  }
  if (normalized.includes("description")) return "description";
  if (
    ["service", "physical", "attention", "special"].some((token) =>
      normalized.includes(token)
    )
  ) {
    return "services";
  }
  if (
    normalized.startsWith("rate") ||
    normalized.includes("payment") ||
    normalized.includes("price")
  ) {
    return "rates";
  }
  if (normalized.startsWith("schedule-")) return "schedule";
  if (["address", "location", "city", "map"].some((token) => normalized.includes(token))) {
    return "location";
  }
  if (
    ["subscription", "premium", "featured", "banner", "duration"].some((token) =>
      normalized.includes(token)
    )
  ) {
    return "plan";
  }
  return "other";
};
const groupFilledFormEntries = (entries: FilledFormEntry[]) => {
  const grouped = new Map<(typeof detailGroupOrder)[number], FilledFormEntry[]>();
  for (const entry of entries) {
    const groupId = getDetailGroupId(entry.key);
    const existing = grouped.get(groupId) ?? [];
    existing.push(entry);
    grouped.set(groupId, existing);
  }

  return detailGroupOrder
    .map((id) => ({
      id,
      label: detailGroupLabels[id],
      entries: grouped.get(id) ?? [],
    }))
    .filter((group) => group.entries.length > 0);
};
const splitValueIntoTags = (value: string) => {
  if (value.length > 160 || value.includes("|") || value.includes(":")) return [];
  const tags = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (tags.length < 2 || tags.length > 8) return [];
  return tags;
};
const buildPagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  return Array.from(pages)
    .sort((a, b) => a - b)
    .flatMap((page, index, array) => {
      const previous = array[index - 1];
      if (previous && page - previous > 1) {
        return ["ellipsis", page] as const;
      }
      return [page] as const;
    });
};

export default function GirlsClient({
  initialProfiles,
  initialFavoriteIds = [],
}: {
  initialProfiles: Profile[];
  initialFavoriteIds?: string[];
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [liveProfiles] = useState<Profile[]>(initialProfiles);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProfileContact, setSelectedProfileContact] = useState<{
    profileId: string;
    phoneHref: string | null;
    phoneLabel: string | null;
    whatsappHref: string | null;
    telegramHref: string | null;
    telegramLabel: string | null;
    websiteHref: string | null;
    websiteLabel: string | null;
    referralHref: string | null;
    referralLabel: string | null;
  } | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(initialFavoriteIds);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const didApplyQueryProfileRef = useRef(false);
  const scrollProgress = useMotionValue(0);
  const heroParallax = useTransform(scrollProgress, [0, 1], [0, 80]);
  const hasActiveFilters = Boolean(activeFilter || activeCategory);

  const toggleFavorite = async (profileId: string) => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    const isFavorite = favoriteIds.includes(profileId);
    setFavoriteIds((current) =>
      isFavorite ? current.filter((item) => item !== profileId) : [...current, profileId]
    );

    try {
      const response = await fetch("/api/profile-favorites", {
        method: isFavorite ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: toDatabaseId(profileId),
          profileType: "girls",
        }),
      });

      if (!response.ok) {
        throw new Error("Favorite request failed");
      }
    } catch {
      setFavoriteIds((current) =>
        isFavorite ? [...current, profileId] : current.filter((item) => item !== profileId)
      );
    }
  };

  const scrollToResults = () => {
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const resetFilters = () => {
    startTransition(() => {
      setActiveFilter(null);
      setActiveCategory(null);
      setCurrentPage(1);
    });
  };
  const openProfile = (profileId: string) => {
    setShareFeedback(null);
    startTransition(() => {
      setSelectedId(profileId);
    });
  };
  const closeProfile = () => {
    setShareFeedback(null);
    startTransition(() => {
      setSelectedId(null);
    });
  };

  const displayProfiles = useMemo(() => {
    let nextProfiles = liveProfiles;

    if (activeFilter) {
      nextProfiles = nextProfiles.filter((profile) => filterMatches(profile, activeFilter));
    }

    if (activeCategory) {
      nextProfiles = nextProfiles.filter((profile) => matchesPremiumCategory(profile, activeCategory));
    }

    return nextProfiles;
  }, [activeCategory, activeFilter, liveProfiles]);
  const totalPages = Math.max(1, Math.ceil(displayProfiles.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const visibleProfiles = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
    return displayProfiles.slice(startIndex, startIndex + PAGE_SIZE);
  }, [displayProfiles, safeCurrentPage]);
  const paginationItems = useMemo(
    () => buildPagination(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  );

  const selectedProfile = useMemo(
    () => displayProfiles.find((profile) => profile.id === selectedId) || null,
    [displayProfiles, selectedId]
  );
  const activeProfileContact =
    selectedProfileContact?.profileId === selectedProfile?.id
      ? selectedProfileContact
      : null;
  const selectedProfileAddress = useMemo(
    () =>
      selectedProfile
        ? readFirstFilledField(selectedProfile.formFields, [
            "address",
            "mapConfirmation",
            "location",
          ]) || selectedProfile.location
        : "",
    [selectedProfile]
  );
  const selectedProfileSpecialOffer = useMemo(
    () =>
      selectedProfile
        ? readFirstFilledField(selectedProfile.formFields, [
            "specialOffer",
            "specialoffer",
            "offerText",
          ])
        : "",
    [selectedProfile]
  );
  const selectedProfileOfferHighlights = useMemo(
    () =>
      selectedProfile
        ? readOfferHighlights(selectedProfile.formFields)
        : { activeOffer: "", nextOffer: "" },
    [selectedProfile]
  );
  const selectedProfileMapSrc = useMemo(
    () => (selectedProfileAddress ? buildGoogleMapsEmbedSrc(selectedProfileAddress) : ""),
    [selectedProfileAddress]
  );
  const selectedProfileDirectionsHref = useMemo(
    () => (selectedProfileAddress ? buildGoogleMapsDirectionsHref(selectedProfileAddress) : ""),
    [selectedProfileAddress]
  );
  const filledFormEntries = useMemo<FilledFormEntry[]>(
    () => (selectedProfile ? getFilledFormEntries(selectedProfile.formFields) : []),
    [selectedProfile]
  );
  const groupedFormEntries = useMemo(
    () => groupFilledFormEntries(filledFormEntries),
    [filledFormEntries]
  );
  const selectedLocationEntries = useMemo(
    () => groupedFormEntries.find((group) => group.id === "location")?.entries ?? [],
    [groupedFormEntries]
  );
  const detailGroupsForDisplay = useMemo(() => {
    const baseGroups = groupedFormEntries.filter(
      (group) => group.id !== "location" && group.id !== "plan"
    );

    if (selectedProfileSpecialOffer && !baseGroups.some((group) => group.id === "rates")) {
      baseGroups.push({
        id: "rates",
        label: detailGroupLabels.rates,
        entries: [],
      });
    }

    return [...baseGroups].sort(
      (a, b) => detailGroupOrder.indexOf(a.id) - detailGroupOrder.indexOf(b.id)
    );
  }, [groupedFormEntries, selectedProfileSpecialOffer]);
  const publicVisibleEntryCount = useMemo(
    () =>
      detailGroupsForDisplay.reduce((total, group) => total + group.entries.length, 0) +
      selectedLocationEntries.length,
    [detailGroupsForDisplay, selectedLocationEntries]
  );
  const selectedProfileInfoSectionId =
    selectedProfile?.about.trim() ? "profile-about-section" : "profile-details-section";
  const profileSidebarSections = useMemo(
    () => [
      {
        id: "profile-gallery-section",
        label: "Fotos",
        iconPath:
          "M4 7h4l1.5-2h5L16 7h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm8 3a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z",
      },
      {
        id: selectedProfileInfoSectionId,
        label: "Info",
        iconPath: "M12 16v-4M12 8h.01M5 12a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",
      },
      {
        id: "profile-details-section",
        label: "Tarifa",
        iconPath: "M16 7.5c-1.2-1-2.7-1.5-4.5-1.5c-3 0-5 1.8-5 5s2 5 5 5c1.8 0 3.3-.5 4.5-1.5M5 10h8M5 14h8",
      },
      {
        id: "profile-map-section",
        label: "Mapa",
        iconPath: "M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z",
        disabled: !selectedProfileAddress,
      },
    ],
    [selectedProfileAddress, selectedProfileInfoSectionId]
  );

  useEffect(() => {
    // Client-only hook reserved if you want to add filters/interactions later.
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    const controller = new AbortController();

    const loadFavorites = async () => {
      try {
        const response = await fetch("/api/profile-favorites", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) return;

        const data = (await response.json()) as {
          favorites?: Array<{ profileId?: string; profileType?: string }>;
        };
        const nextFavoriteIds = Array.isArray(data.favorites)
          ? data.favorites
              .filter(
                (item): item is { profileId: string; profileType: string } =>
                  typeof item?.profileId === "string" && typeof item?.profileType === "string"
              )
              .filter((item) => item.profileType === "girls")
              .map((item) => `db-${item.profileId}`)
          : [];
        setFavoriteIds(nextFavoriteIds);
      } catch {
        // keep current favorites on load error
      }
    };

    void loadFavorites();

    return () => controller.abort();
  }, [session?.user]);

  useEffect(() => {
    if (didApplyQueryProfileRef.current) {
      return;
    }

    const requestedProfile = new URLSearchParams(window.location.search).get("profile");
    if (!requestedProfile) {
      didApplyQueryProfileRef.current = true;
      return;
    }

    const match = liveProfiles.find(
      (profile) => profile.id === requestedProfile || toDatabaseId(profile.id) === requestedProfile
    );

    if (match) {
      const timeoutId = window.setTimeout(() => {
        openProfile(match.id);
      }, 0);
      didApplyQueryProfileRef.current = true;
      return () => window.clearTimeout(timeoutId);
    }

    didApplyQueryProfileRef.current = true;
  }, [liveProfiles]);

  // Dynamic only: no localStorage fallback.

  useBodyScrollLock(Boolean(selectedProfile));

  useEffect(() => {
    if (!selectedProfile) {
      return;
    }

    const controller = new AbortController();
    const profileId = toDatabaseId(selectedProfile.id);

    const loadProfileContact = async () => {
      try {
        const response = await fetch(
          `/api/profile-contact?type=girls&id=${encodeURIComponent(profileId)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setSelectedProfileContact({
            profileId: selectedProfile.id,
            phoneHref: null,
            phoneLabel: null,
            whatsappHref: null,
            telegramHref: null,
            telegramLabel: null,
            websiteHref: null,
            websiteLabel: null,
            referralHref: null,
            referralLabel: null,
          });
          return;
        }

        const data = (await response.json()) as {
          phoneHref?: string | null;
          phoneLabel?: string | null;
          whatsappHref?: string | null;
          telegramHref?: string | null;
          telegramLabel?: string | null;
          websiteHref?: string | null;
          websiteLabel?: string | null;
          referralHref?: string | null;
          referralLabel?: string | null;
        };
        setSelectedProfileContact({
          profileId: selectedProfile.id,
          phoneHref: typeof data.phoneHref === "string" ? data.phoneHref : null,
          phoneLabel: typeof data.phoneLabel === "string" ? data.phoneLabel : null,
          whatsappHref: typeof data.whatsappHref === "string" ? data.whatsappHref : null,
          telegramHref: typeof data.telegramHref === "string" ? data.telegramHref : null,
          telegramLabel: typeof data.telegramLabel === "string" ? data.telegramLabel : null,
          websiteHref: typeof data.websiteHref === "string" ? data.websiteHref : null,
          websiteLabel: typeof data.websiteLabel === "string" ? data.websiteLabel : null,
          referralHref: typeof data.referralHref === "string" ? data.referralHref : null,
          referralLabel: typeof data.referralLabel === "string" ? data.referralLabel : null,
        });
      } catch {
        if (!controller.signal.aborted) {
          setSelectedProfileContact({
            profileId: selectedProfile.id,
            phoneHref: null,
            phoneLabel: null,
            whatsappHref: null,
            telegramHref: null,
            telegramLabel: null,
            websiteHref: null,
            websiteLabel: null,
            referralHref: null,
            referralLabel: null,
          });
        }
      }
    };

    void loadProfileContact();

    return () => controller.abort();
  }, [selectedProfile]);

  const handleShare = async (profile: Profile) => {
    const shareUrl = `${window.location.origin}/girls?profile=${encodeURIComponent(
      toDatabaseId(profile.id)
    )}`;
    const shareTitle = `${profile.name} | Hot Barcelona`;
    const shareText = [profile.name, formatAge(profile.age), profile.location]
      .filter(Boolean)
      .join(" • ");

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback("Link shared");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback("Link copied");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback("Link copied");
      } catch {
        setShareFeedback("Share unavailable");
      }
    }

    window.setTimeout(() => {
      setShareFeedback((current) =>
        current === "Link shared" || current === "Link copied" || current === "Share unavailable"
          ? null
          : current
      );
    }, 2000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.35),_rgba(245,179,92,0)_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.25),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.2),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <section className="relative overflow-hidden pb-10 pt-0 sm:pb-12 sm:pt-0">
          <Navbar />
          <div className="mx-auto -mt-10 w-full max-w-6xl px-4 sm:-mt-12 sm:px-6 lg:-mt-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
                Elite Discovery
              </p>
              <h1
                className="mt-3 text-3xl font-semibold sm:mt-4 sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Girls Collection
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/70 sm:mt-4 sm:text-lg">
                A curated selection of refined companions. Explore profiles,
                compare ratings, and reserve a private introduction.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_18px_38px_rgba(0,0,0,0.35)] backdrop-blur sm:mt-8 sm:px-6 sm:py-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`flex w-full items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] transition sm:w-auto sm:text-xs sm:tracking-[0.35em] ${
                    hasActiveFilters
                      ? "border-[#f5d68c]/60 bg-[#f5d68c]/10 text-[#f5d68c]"
                      : "border-white/15 bg-black/40 text-white/80 hover:text-white"
                  }`}
                >
                  All Profiles
                  <NavIcon path="M4 6h16M7 12h10M10 18h4" />
                </button>
                {filters.map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setActiveCategory(null);
                        setActiveFilter(isActive ? null : filter);
                        setCurrentPage(1);
                      }}
                      className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.28em] transition sm:text-xs sm:tracking-[0.3em] ${
                        isActive
                          ? "border-[#f5d68c]/60 bg-[#f5d68c]/10 text-[#f5d68c]"
                          : "border-white/10 bg-black/30 text-white/60 hover:text-white"
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
                <span className="text-center text-[10px] uppercase tracking-[0.28em] text-white/50 sm:ml-auto sm:text-left sm:text-xs sm:tracking-[0.3em]">
                  {displayProfiles.length} profiles
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="rounded-full border border-[#f5d68c]/25 bg-[#f5d68c]/5 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#f5d68c]/85 sm:text-xs sm:tracking-[0.3em]">
                  Categories
                </span>
                {premiumCategoryFilters.map((category) => {
                  const isActive = activeCategory === category.value;
                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setActiveFilter(null);
                        setActiveCategory(isActive ? null : category.value);
                        setCurrentPage(1);
                      }}
                      className={`max-w-full rounded-full border px-4 py-2 text-center text-[10px] uppercase leading-snug tracking-[0.22em] whitespace-normal break-words transition sm:text-xs sm:tracking-[0.26em] ${
                        isActive
                          ? "border-[#f5d68c]/60 bg-[#f5d68c]/10 text-[#f5d68c]"
                          : "border-white/10 bg-black/30 text-white/60 hover:text-white"
                      }`}
                    >
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
            {displayProfiles.length === 0 && (
              <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">
                No profiles found yet.
              </div>
            )}
          </div>
        </section>

        <section ref={resultsRef} className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <motion.div
            key={`grid-${activeFilter ?? "all"}-${activeCategory ?? "all"}-${safeCurrentPage}`}
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {visibleProfiles.map((profile) => {
              const isFavorite = favoriteIds.includes(profile.id);
              const offerHighlights = readOfferHighlights(profile.formFields);
              return (
                <motion.div
                  key={profile.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openProfile(profile.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProfile(profile.id);
                    }
                  }}
                  variants={cardVariants}
                  className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/5 text-left shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
                >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  {profile.image ? (
                    <Image
                      src={getCloudinaryImageUrl(profile.image, {
                        width: 520,
                        height: 700,
                      })}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,214,140,0.24),rgba(10,11,13,0.96)_65%)]" />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0)_20%,rgba(10,11,13,0.7)_100%)] opacity-70 transition duration-500 group-hover:opacity-90" />
                  <div className="absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(245,214,140,0.35),rgba(10,11,13,0)_55%)]" />
                  </div>
                  <ProfileActiveOfferPhotoBadge
                    offers={offerHighlights}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2"
                  />
                  <button
                    type="button"
                    aria-label="Save profile"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(profile.id);
                    }}
                    className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border bg-black/40 transition ${
                      isFavorite
                        ? "border-[#f5d68c]/65 text-[#f5d68c]"
                        : "border-white/20 text-white/80 hover:border-[#f5d68c]/60 hover:text-[#f5d68c]"
                    }`}
                  >
                    <NavIcon path="M12 20.5s-6.5-4.3-9-8.2C1.4 9 3 6 6.4 6c2.1 0 3.6 1.2 4.6 2.7C12 7.2 13.5 6 15.6 6 19 6 20.6 9 21 12.3c-2.5 3.9-9 8.2-9 8.2Z" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 px-5 pb-3 pt-4">
                    <div className="mb-2 flex items-center justify-end">
                      <span className="max-w-full rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-2 text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.22em] text-black opacity-100 transition duration-500 whitespace-normal break-words">
                        View Profile
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                        <p className="text-lg font-semibold">
                          {profile.name}, {formatAge(profile.age)}
                        </p>
                        {profile.location && (
                          <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/60">
                            <NavIcon path="M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z" />
                            {profile.location}
                          </div>
                        )}
                        </div>
                        {typeof profile.rating === "number" && profile.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs text-[#f5d68c]">
                            <NavIcon path="M12 3.5l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.3-4.2 6-.9L12 3.5Z" />
                            <span className="text-white/80">{profile.rating}</span>
                          </div>
                        )}
                      </div>
                      {hasPremiumPlan(profile.premiumPlan) && (
                        <div className="inline-flex max-w-full self-start rounded-2xl border border-[#f5d68c]/35 bg-black/70 px-4 py-2.5 text-center text-[10px] font-semibold uppercase leading-snug tracking-[0.16em] whitespace-normal break-words text-[#f5d68c] shadow-[0_12px_24px_rgba(0,0,0,0.35)] backdrop-blur sm:text-[11px] sm:tracking-[0.2em]">
                          {formatPremiumPlanLabel(profile.premiumPlan)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-12 flex flex-col items-center gap-5 sm:mt-16 sm:gap-6">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/50 sm:gap-4 sm:text-xs sm:tracking-[0.3em]">
              <span className="h-px w-12 bg-white/20" />
              Infinite discovery
              <span className="h-px w-12 bg-white/20" />
            </div>
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((page) => Math.max(1, page - 1));
                    scrollToResults();
                  }}
                  disabled={safeCurrentPage === 1}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-xs"
                >
                  Prev
                </button>
                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-1 text-sm text-white/35"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCurrentPage(item);
                        scrollToResults();
                      }}
                      className={`h-10 min-w-10 rounded-full border px-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition sm:text-xs ${
                        safeCurrentPage === item
                          ? "border-[#f5d68c]/60 bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] text-black"
                          : "border-white/10 bg-white/5 text-white/75 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((page) => Math.min(totalPages, page + 1));
                    scrollToResults();
                  }}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-35 sm:px-5 sm:text-xs"
                >
                  Next
                </button>
              </div>
            )}
            {displayProfiles.length > 0 && (
              <p className="text-center text-[10px] uppercase tracking-[0.28em] text-white/45 sm:text-xs">
                Showing {(safeCurrentPage - 1) * PAGE_SIZE + 1}-
                {Math.min(safeCurrentPage * PAGE_SIZE, displayProfiles.length)} of {displayProfiles.length}
              </p>
            )}
            <Link
              href="/"
              className="text-[10px] uppercase tracking-[0.3em] text-white/50 transition hover:text-white sm:text-xs sm:tracking-[0.35em]"
            >
              Back to home
            </Link>
          </div>
        </section>

      </main>

      {selectedProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 sm:py-8"
        >
          <motion.button
            type="button"
            aria-label="Close profile"
            onClick={closeProfile}
            className="fixed inset-0 bg-black/70 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div className="fixed right-3 top-1/2 z-20 -translate-y-1/2 sm:right-4 lg:right-6">
            <ProfileSectionSidebar
              sections={profileSidebarSections}
              scrollContainerRef={modalRef}
              onClose={closeProfile}
            />
          </div>

          <motion.div
              ref={modalRef}
              onScroll={(event) => {
                const target = event.currentTarget;
                const maxScroll = target.scrollHeight - target.clientHeight;
                scrollProgress.set(maxScroll > 0 ? target.scrollTop / maxScroll : 0);
              }}
              initial={{ opacity: 0, scale: 0.98, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 24 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 mx-auto max-h-[calc(100svh-3rem)] w-full max-w-6xl overflow-y-auto overscroll-contain rounded-[26px] border border-white/10 bg-[#0b0c10]/95 shadow-[0_40px_90px_rgba(0,0,0,0.55)] [scrollbar-color:rgba(245,214,140,0.55)_rgba(255,255,255,0.08)] [scrollbar-width:thin] sm:max-h-[92vh] sm:rounded-[32px]"
            >
            <div className="relative h-[48vh] min-h-[300px] overflow-hidden sm:h-[55vh] sm:min-h-[380px]">
              <motion.div style={{ y: heroParallax }} className="absolute inset-0">
                {selectedProfile.image ? (
                  <Image
                    src={getCloudinaryImageUrl(selectedProfile.image, {
                      width: 1200,
                      height: 900,
                    })}
                    alt={selectedProfile.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 80vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(circle_at_top,rgba(245,214,140,0.2),rgba(10,11,13,0.96)_65%)]" />
                )}
              </motion.div>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,11,13,0.15)_0%,rgba(10,11,13,0.75)_70%,rgba(10,11,13,0.98)_100%)]" />
              <div className="absolute left-4 top-4 flex max-w-[75%] flex-col items-start gap-2 sm:left-10 sm:top-10 sm:max-w-[70%]">
                <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/80 sm:gap-3 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.35em]">
                  <NavIcon path="M4 7h16M4 12h10M4 17h7" />
                  Elite profile
                </div>
                <ProfileOfferBadges
                  offers={selectedProfileOfferHighlights}
                  compact
                  className="mt-2"
                />
              </div>
              <button
                type="button"
                onClick={closeProfile}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white/80 transition hover:border-[#f5d68c]/60 hover:text-[#f5d68c] sm:right-6 sm:top-6 sm:h-11 sm:w-11"
              >
                <NavIcon path="M6 6l12 12M18 6l-12 12" />
              </button>
              <div className="absolute inset-x-0 bottom-0 px-4 pb-5 sm:px-10 sm:pb-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
                  <div className="min-w-0">
                    <h2
                      className="text-2xl font-semibold sm:text-5xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {selectedProfile.name}, {formatAge(selectedProfile.age)}
                    </h2>
                    {selectedProfileAddress && (
                      <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/70 sm:mt-3 sm:gap-3 sm:text-sm sm:tracking-[0.3em]">
                        <NavIcon path="M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z" />
                        {selectedProfileAddress}
                      </div>
                    )}
                    {hasPremiumPlan(selectedProfile.premiumPlan) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-4">
                        <span className="rounded-full border border-[#f5d68c]/40 bg-black/55 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f5d68c] shadow-[0_12px_24px_rgba(0,0,0,0.28)] sm:text-[11px] sm:tracking-[0.26em]">
                          {formatPremiumPlanLabel(selectedProfile.premiumPlan)}
                        </span>
                        {selectedProfile.premiumDuration && (
                          <span className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/75 sm:text-[11px] sm:tracking-[0.24em]">
                            {formatPremiumDurationLabel(selectedProfile.premiumDuration)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                      <span className="rounded-full border border-[#f5d68c]/35 bg-black/55 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f5d68c] sm:px-4 sm:py-2 sm:tracking-[0.26em]">
                        {publicVisibleEntryCount} filled fields
                      </span>
                      <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/70 sm:px-4 sm:py-2 sm:tracking-[0.26em]">
                        {selectedProfile.gallery.length} photos
                      </span>
                    </div>
                  </div>
                  {hasRatingData(selectedProfile) && (
                    <div className="flex w-full flex-col items-start gap-3 rounded-2xl border border-white/10 bg-black/50 px-4 py-3 sm:w-auto sm:px-6 sm:py-4">
                      <div className="flex items-center gap-2 text-[#f5d68c]">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={index}
                            className={
                              index <
                              Math.round(
                                typeof selectedProfile.rating === "number"
                                  ? selectedProfile.rating
                                  : 0
                              )
                                ? "text-[#f5d68c]"
                                : "text-white/20"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-white/70">
                        {typeof selectedProfile.rating === "number"
                          ? selectedProfile.rating
                          : "N/A"}
                        {typeof selectedProfile.reviews === "number"
                          ? ` · ${selectedProfile.reviews} reviews`
                          : ""}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                <div className="space-y-6 sm:space-y-8">
                  <ProfileActionBar
                isAuthenticated={Boolean(session?.user)}
                phoneHref={activeProfileContact?.phoneHref ?? null}
                phoneLabel={activeProfileContact?.phoneLabel ?? null}
                whatsappHref={activeProfileContact?.whatsappHref ?? null}
                telegramHref={activeProfileContact?.telegramHref ?? null}
                telegramLabel={activeProfileContact?.telegramLabel ?? null}
                isFavorite={favoriteIds.includes(selectedProfile.id)}
                onToggleFavorite={() => toggleFavorite(selectedProfile.id)}
                onShare={() => void handleShare(selectedProfile)}
                  shareFeedback={shareFeedback}
              />

                  <ProfileOfferBadges offers={selectedProfileOfferHighlights} />

                  {selectedProfileAddress && (
                <section
                  id="profile-map-section"
                  className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(10,11,13,0.94)_45%)] p-4 sm:p-7"
                >
                  <div className="max-w-3xl">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
                      Location
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white sm:text-3xl">
                      {selectedProfileAddress}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
                      Advertiser ne profile banate waqt jo address fill kiya tha, wahi address aur map yahan show ho raha hai.
                    </p>
                  </div>
                  <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10 bg-black/25">
                    {selectedProfileMapSrc ? (
                      <iframe
                        title={`${selectedProfile.name} location map`}
                        src={selectedProfileMapSrc}
                        className="h-[280px] w-full sm:h-[360px]"
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <div className="flex h-[280px] w-full items-center justify-center text-sm text-white/45 sm:h-[360px]">
                        Map preview unavailable.
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <a
                      href={selectedProfileDirectionsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#1e9bff] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(30,155,255,0.28)] transition hover:brightness-110"
                    >
                      <NavIcon path="M12 21s6-5.1 6-9.5A6 6 0 1 0 6 11.5C6 15.9 12 21 12 21Z" />
                      Start route
                    </a>
                  </div>
                  <div className="mt-8 space-y-4 border-t border-white/10 pt-6">
                    {selectedLocationEntries.length > 0 ? (
                      selectedLocationEntries.map((entry) => (
                        <article
                          key={entry.key}
                          className="grid gap-2 border-b border-white/8 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-6"
                        >
                          <p className="pt-1 text-[10px] uppercase tracking-[0.26em] text-white/45 sm:text-xs">
                            {entry.label}
                          </p>
                          <p className="break-words text-base leading-relaxed text-white/88 sm:text-lg">
                            {entry.value}
                          </p>
                        </article>
                      ))
                    ) : (
                      <article className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-6">
                        <p className="pt-1 text-[10px] uppercase tracking-[0.26em] text-white/45 sm:text-xs">
                          Saved location
                        </p>
                        <p className="break-words text-base leading-relaxed text-white/88 sm:text-lg">
                          {selectedProfileAddress}
                        </p>
                      </article>
                    )}
                  </div>
                </section>
              )}

                <section
                  id="profile-details-section"
                  className="rounded-[28px] border border-[#f5d68c]/25 bg-[linear-gradient(145deg,rgba(245,214,140,0.15),rgba(245,179,92,0.03)_22%,rgba(10,11,13,0.96)_52%)] p-4 sm:p-7"
                >
                  <div className="max-w-4xl">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
                      Profile Details
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white sm:text-4xl">
                      Everything shared in this profile
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-white/62 sm:text-lg">
                      Identity, services, rates and schedule are now presented in a cleaner profile flow with larger text and softer separation.
                    </p>
                  </div>
                  {detailGroupsForDisplay.length === 0 ? (
                    <p className="mt-6 text-base text-white/60">
                      No additional details submitted yet.
                    </p>
                  ) : (
                    <div className="mt-10 grid gap-10 lg:grid-cols-2">
                      {detailGroupsForDisplay.map((group) => (
                        <section key={group.id} className="space-y-5">
                          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#f5d68c]/90 sm:text-base">
                              {group.label}
                            </p>
                            <span className="text-[11px] uppercase tracking-[0.22em] text-white/40 sm:text-xs">
                              {group.entries.length} items
                            </span>
                          </div>
                          <div className="space-y-5">
                            {group.entries.map((entry) => {
                              const tags = splitValueIntoTags(entry.value);
                              return (
                                <article
                                  key={entry.key}
                                  className="grid gap-2 border-b border-white/8 pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-6"
                                >
                                  <p className="pt-1 text-[10px] uppercase tracking-[0.28em] text-white/42 sm:text-xs">
                                    {entry.label}
                                  </p>
                                  {tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2.5">
                                      {tags.map((tag) => (
                                        <span
                                          key={`${entry.key}-${tag}`}
                                          className="rounded-full border border-[#f5d68c]/20 bg-[#f5d68c]/10 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[#f5d68c]"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-white/88 sm:text-lg">
                                      {entry.value}
                                    </p>
                                  )}
                                </article>
                            );
                          })}
                            {group.id === "rates" && selectedProfileSpecialOffer && (
                              <div className="rounded-[24px] border border-[#f5d68c]/30 bg-[linear-gradient(145deg,rgba(245,214,140,0.18),rgba(245,179,92,0.06)_24%,rgba(10,11,13,0.94)_72%)] p-4 sm:p-5">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.34em]">
                                    Special Offer
                                  </p>
                                  <span className="rounded-full border border-[#f5d68c]/30 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f5d68c]">
                                    Advertiser Highlight
                                  </span>
                                </div>
                                <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-white/88 sm:text-lg">
                                  {selectedProfileSpecialOffer}
                                </p>
                              </div>
                            )}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </section>

                  {selectedProfile.about.trim() && (
              <section
                id="profile-about-section"
                className="rounded-[28px] border border-[#f5d68c]/25 bg-[linear-gradient(145deg,rgba(245,214,140,0.09),rgba(10,11,13,0.78)_40%,rgba(10,11,13,0.95))] p-4 sm:p-7"
              >
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
                    About
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-white/80 sm:text-lg">
                    {selectedProfile.about}
                  </p>
                </section>
              )}

              <ProfileReviews
                profileId={toDatabaseId(selectedProfile.id)}
                profileType="girls"
                profileName={selectedProfile.name}
                heroImage={selectedProfile.image}
                gallery={selectedProfile.gallery}
              />

                  <section
                id="profile-gallery-section"
                className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(10,11,13,0.92)_45%)] p-4 sm:p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
                    Gallery
                  </p>
                  <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/70 sm:tracking-[0.26em]">
                    {selectedProfile.gallery.length} items
                  </span>
                </div>
                {selectedProfile.gallery.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-black/30 px-4 py-6 text-sm text-white/60">
                    No photos uploaded.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedProfile.gallery.map((src, index) => (
                      <div
                        key={`${src}-${index}`}
                        className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10"
                      >
                        <Image
                          src={getCloudinaryImageUrl(src, {
                            width: 640,
                            height: 800,
                          })}
                          alt={`${selectedProfile.name} gallery`}
                          fill
                          sizes="(max-width: 640px) 88vw, (max-width: 1024px) 44vw, 30vw"
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 transition group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                )}
                  </section>
                </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
