"use client";

import { useState } from "react";

type DurationOption = {
  label: "1 month" | "15 days" | "7 days";
  price: string;
};

type PlanOption = {
  name: string;
  durations: DurationOption[];
};

const planOptions: PlanOption[] = [
  {
    name: "TOP PREMIUM VIP",
    durations: [
      { label: "1 month", price: "\u20AC335" },
      { label: "15 days", price: "\u20AC195" },
      { label: "7 days", price: "\u20AC100" },
    ],
  },
  {
    name: "TOP PREMIUM BANNER",
    durations: [
      { label: "1 month", price: "\u20AC185" },
      { label: "15 days", price: "\u20AC120" },
      { label: "7 days", price: "\u20AC65" },
    ],
  },
  {
    name: "TOP PREMIUM TOP",
    durations: [
      { label: "1 month", price: "\u20AC135" },
      { label: "15 days", price: "\u20AC90" },
      { label: "7 days", price: "\u20AC45" },
    ],
  },
  {
    name: "TOP PREMIUM STANDARD",
    durations: [
      { label: "1 month", price: "\u20AC90" },
      { label: "15 days", price: "\u20AC63" },
      { label: "7 days", price: "\u20AC36" },
    ],
  },
];

type Props = {
  planName: string;
  durationName: string;
};

export default function SubscriptionSelector({ planName, durationName }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");
  const uniquePlans = Array.from(
    new Map(planOptions.map((plan) => [plan.name, plan])).values()
  );

  return (
    <div className="space-y-4">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/50 sm:text-xs sm:tracking-[0.32em]">
        Choose Subscription
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {uniquePlans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl border p-4 text-left transition ${
              selectedPlan === plan.name
                ? "border-[#f5d68c]/70 bg-gradient-to-br from-[#f5d68c]/20 via-[#f5b35c]/10 to-transparent text-white shadow-[0_10px_30px_rgba(245,179,92,0.2)]"
                : "border-white/10 bg-black/40 text-white/75 hover:border-[#f5d68c]/35 hover:text-white"
            }`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              {plan.name}
            </div>
            <div className="mt-3 space-y-1.5">
              {plan.durations.map((duration) => (
                <button
                  key={`${plan.name}-${duration.label}`}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.name);
                    setSelectedDuration(duration.label);
                  }}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl border px-3 py-2 text-xs ${
                    selectedPlan === plan.name && selectedDuration === duration.label
                      ? "border-[#f5b35c]/70 bg-[#f5b35c]/20 text-white"
                      : "border-white/10 bg-black/35 text-white/75 hover:border-[#f5d68c]/35"
                  }`}
                >
                  <span className="whitespace-nowrap uppercase tracking-[0.12em]">{duration.label}</span>
                  <span className="whitespace-nowrap font-semibold text-[#f5d68c]">{duration.price}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#f5b35c]/35 bg-[#f5b35c]/10 px-4 py-3 text-xs font-medium text-[#f7ddb1]">
        VAT will be added to all listed prices.
      </div>

      <input type="hidden" name={planName} value={selectedPlan} />
      <input type="hidden" name={durationName} value={selectedDuration} />
    </div>
  );
}
