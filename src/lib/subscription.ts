export type SubscriptionDurationLabel = "1 month" | "2 weeks" | "1 week";

export type SubscriptionPlanValue =
  | "TOP PREMIUM VIP"
  | "TOP PREMIUM BANNER"
  | "PREMIUM SUPERIOR"
  | "TOP PREMIUM STANDARD";

export type SubscriptionPlanOption = {
  value: SubscriptionPlanValue;
  label: string;
  durations: Array<{
    label: SubscriptionDurationLabel;
    price: string;
  }>;
};

export const SUBSCRIPTION_PLAN_ORDER: SubscriptionPlanValue[] = [
  "TOP PREMIUM VIP",
  "TOP PREMIUM BANNER",
  "PREMIUM SUPERIOR",
  "TOP PREMIUM STANDARD",
];

export const subscriptionPlanOptions: SubscriptionPlanOption[] = [
  {
    value: "TOP PREMIUM VIP",
    label: "VIP PREMIUM SUPERIOR",
    durations: [
      { label: "1 month", price: "\u20AC160,00" },
      { label: "2 weeks", price: "\u20AC130,00" },
      { label: "1 week", price: "\u20AC105,00" },
    ],
  },
  {
    value: "TOP PREMIUM BANNER",
    label: "BANNER PREMIUM SUPERIOR",
    durations: [
      { label: "1 month", price: "\u20AC115,00" },
      { label: "2 weeks", price: "\u20AC95,00" },
      { label: "1 week", price: "\u20AC80,00" },
    ],
  },
  {
    value: "PREMIUM SUPERIOR",
    label: "PREMIUM SUPERIOR",
    durations: [
      { label: "1 month", price: "\u20AC85,00" },
      { label: "2 weeks", price: "\u20AC65,00" },
      { label: "1 week", price: "\u20AC50,00" },
    ],
  },
  {
    value: "TOP PREMIUM STANDARD",
    label: "TOP PREMIUM STANDARD",
    durations: [
      { label: "1 month", price: "\u20AC70,00" },
      { label: "2 weeks", price: "\u20AC50,00" },
      { label: "1 week", price: "\u20AC35,00" },
    ],
  },
];

const normalizeText = (value: string) => value.replace(/\s+/g, " ").trim().toUpperCase();

const planAliases = new Map<string, SubscriptionPlanValue>([
  ["VIP PREMINUM SUPERIOR", "TOP PREMIUM VIP"],
  ["VIP PREMIUM SUPERIOR", "TOP PREMIUM VIP"],
  ["BANNER PREMIUM SUPERIOR", "TOP PREMIUM BANNER"],
  ["TOP PREMIUM TOP", "PREMIUM SUPERIOR"],
]);

export const normalizeSubscriptionPlanValue = (
  value: string | null | undefined
): SubscriptionPlanValue | null => {
  if (typeof value !== "string" || !value.trim()) return null;

  const normalized = normalizeText(value);
  const aliasMatch = planAliases.get(normalized);
  if (aliasMatch) return aliasMatch;

  for (const plan of SUBSCRIPTION_PLAN_ORDER) {
    if (normalized === normalizeText(plan)) return plan;
  }

  return null;
};

export const normalizeSubscriptionDurationValue = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return null;

  const trimmed = value.trim();
  const normalized = normalizeText(trimmed);

  if (normalized === "15 DAYS" || normalized === "14 DAYS" || normalized === "2 WEEKS") {
    return "2 weeks";
  }
  if (normalized === "7 DAYS" || normalized === "1 WEEK") {
    return "1 week";
  }
  if (normalized === "1 MONTH" || normalized === "30 DAYS") {
    return "1 month";
  }

  return trimmed;
};
