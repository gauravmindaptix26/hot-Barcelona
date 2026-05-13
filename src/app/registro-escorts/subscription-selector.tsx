"use client";

import { useEffect, useState } from "react";
import {
  ROSE_CURRENCY_SYMBOL,
  normalizeSubscriptionDurationValue,
  normalizeSubscriptionPlanValue,
  subscriptionPlanOptions,
} from "@/lib/subscription";
import RoseSymbol from "@/components/RoseSymbol";

type Props = {
  planName: string;
  durationName: string;
};

const normalizePlanValue = (value: string) => {
  return normalizeSubscriptionPlanValue(value) ?? value.replace(/\s+/g, " ").trim().toUpperCase();
};

const formatRosePrice = (price: string) => {
  if (!price.startsWith(ROSE_CURRENCY_SYMBOL)) return price;
  return price.slice(ROSE_CURRENCY_SYMBOL.length);
};

export default function SubscriptionSelector({ planName, durationName }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const uniquePlans = Array.from(
    new Map(subscriptionPlanOptions.map((plan) => [plan.value, plan])).values()
  );

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const profile =
        (event as CustomEvent<{ profile?: { formFields?: Record<string, unknown> } }>).detail?.profile;
      const formFields =
        profile?.formFields && typeof profile.formFields === "object" && !Array.isArray(profile.formFields)
          ? profile.formFields
          : {};

      const readText = (key: string) => {
        const raw = formFields[key];
        if (typeof raw === "string") return raw.trim();
        if (Array.isArray(raw)) {
          const first = raw.find(
            (item): item is string => typeof item === "string" && item.trim().length > 0
          );
          return first?.trim() ?? "";
        }
        return "";
      };

      setSelectedPlan(normalizePlanValue(readText(planName) || readText("premiumPlan")));
      setSelectedDuration(
        normalizeSubscriptionDurationValue(readText(durationName) || readText("premiumDuration")) ?? ""
      );
    };

    window.addEventListener("profile:prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("profile:prefill", handlePrefill as EventListener);
  }, [durationName, planName]);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-white/55 sm:text-sm">
        Choose Subscription
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {uniquePlans.map((plan) => (
          <div
            key={plan.value}
            className={`rounded-[28px] border p-4 text-left transition sm:p-5 ${
              selectedPlan === plan.value
                ? "border-[#f5d68c]/70 bg-gradient-to-br from-[#f5d68c]/24 via-[#f5b35c]/12 to-transparent text-white shadow-[0_16px_36px_rgba(245,179,92,0.2)]"
                : "border-white/10 bg-black/40 text-white/75 hover:border-[#f5d68c]/35 hover:text-white"
            }`}
          >
            <div className="break-words text-sm font-semibold uppercase tracking-[0.16em] sm:text-base sm:tracking-[0.18em]">
              {plan.label}
            </div>
            <div className="mt-3.5 space-y-2 sm:mt-4">
              {plan.durations.map((duration) => (
                <button
                  key={`${plan.value}-${duration.label}`}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.value);
                    setSelectedDuration(duration.label);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                    selectedPlan === plan.value && selectedDuration === duration.label
                      ? "border-[#f5b35c]/70 bg-[#f5b35c]/20 text-white"
                      : "border-white/10 bg-black/35 text-white/75 hover:border-[#f5d68c]/35"
                  }`}
                >
                  <span className="min-w-0 break-words uppercase tracking-[0.08em] sm:tracking-[0.12em]">
                    {duration.label}
                  </span>
                  <span className="shrink-0 text-base font-semibold tabular-nums text-[#f5d68c] sm:text-[1.05rem]">
                    <span className="inline-flex items-center gap-1.5">
                      <RoseSymbol className="h-5 w-4" />
                      {formatRosePrice(duration.price)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[22px] border border-[#f5b35c]/35 bg-[#f5b35c]/10 px-4 py-3.5 text-sm font-medium text-[#f7ddb1]">
        VAT will be added to all listed prices.
      </div>

      <input type="hidden" name={planName} value={selectedPlan} />
      <input type="hidden" name={durationName} value={selectedDuration} />
    </div>
  );
}
