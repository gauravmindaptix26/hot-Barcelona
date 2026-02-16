"use client";

import { useState } from "react";

const plans = ["Top premium VIP", "TOP Premium Banner", "TOP Premium"];
const durations = ["1 Month", "15 days", "7 days"];

type Props = {
  planName: string;
  durationName: string;
};

export default function SubscriptionSelector({ planName, durationName }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");

  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/50 sm:text-xs sm:tracking-[0.32em]">
        Choose Subscription
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {plans.map((plan) => (
          <button
            key={plan}
            type="button"
            onClick={() => {
              setSelectedPlan(plan);
              setSelectedDuration("");
            }}
            className={`rounded-2xl border px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
              selectedPlan === plan
                ? "border-[#f5d68c]/70 bg-[#f5d68c]/15 text-white"
                : "border-white/10 bg-black/40 text-white/70 hover:text-white"
            }`}
          >
            {plan}
          </button>
        ))}
      </div>

      {selectedPlan && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
          <div className="text-[10px] uppercase tracking-[0.28em] text-white/50 sm:text-xs sm:tracking-[0.32em]">
            Duration
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {durations.map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setSelectedDuration(duration)}
                className={`rounded-2xl border px-4 py-2 text-xs uppercase tracking-[0.28em] transition ${
                  selectedDuration === duration
                    ? "border-[#f5b35c]/70 bg-[#f5b35c]/20 text-white"
                    : "border-white/10 bg-black/50 text-white/70 hover:text-white"
                }`}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>
      )}

      <input type="hidden" name={planName} value={selectedPlan} />
      <input type="hidden" name={durationName} value={selectedDuration} />
    </div>
  );
}
