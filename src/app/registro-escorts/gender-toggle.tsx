"use client";

import { useEffect, useState } from "react";

type Props = {
  initialGender?: "girl" | "trans";
};

export default function GenderToggle({ initialGender = "girl" }: Props) {
  const [gender, setGender] = useState<"girl" | "trans">(initialGender);

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const profile = (event as CustomEvent<{ profile?: { gender?: "girl" | "trans" } }>).detail?.profile;
      if (profile?.gender === "girl" || profile?.gender === "trans") {
        setGender(profile.gender);
      }
    };

    window.addEventListener("profile:prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("profile:prefill", handlePrefill as EventListener);
  }, []);

  return (
    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.05),rgba(10,11,13,0.92)_45%)] p-5 shadow-[0_20px_45px_rgba(0,0,0,0.22)] sm:p-6">
      <p className="text-xs uppercase tracking-[0.32em] text-[#f5d68c] sm:text-sm">
        Select gender
      </p>
      <input type="hidden" name="gender" value={gender} />
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setGender("girl")}
          className={`rounded-[22px] border py-3.5 text-sm font-medium uppercase tracking-[0.24em] transition sm:py-4 ${
            gender === "girl"
              ? "border-[#d46a7a]/60 bg-[linear-gradient(145deg,rgba(212,106,122,0.26),rgba(212,106,122,0.1))] text-white shadow-[0_14px_30px_rgba(212,106,122,0.14)]"
              : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:text-white"
          }`}
        >
          Girl
        </button>
        <button
          type="button"
          onClick={() => setGender("trans")}
          className={`rounded-[22px] border py-3.5 text-sm font-medium uppercase tracking-[0.24em] transition sm:py-4 ${
            gender === "trans"
              ? "border-[#d46a7a]/60 bg-[linear-gradient(145deg,rgba(212,106,122,0.26),rgba(212,106,122,0.1))] text-white shadow-[0_14px_30px_rgba(212,106,122,0.14)]"
              : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:text-white"
          }`}
        >
          Trans
        </button>
      </div>
    </div>
  );
}
