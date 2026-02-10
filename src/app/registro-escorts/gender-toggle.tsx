"use client";

import { useState } from "react";

export default function GenderToggle() {
  const [gender, setGender] = useState<"girl" | "trans">("girl");

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
      <p className="text-sm uppercase tracking-[0.35em] text-[#f5d68c]">
        Select gender
      </p>
      <input type="hidden" name="gender" value={gender} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setGender("girl")}
          className={`rounded-2xl border py-3 text-xs uppercase tracking-[0.3em] transition ${
            gender === "girl"
              ? "border-[#d46a7a] bg-[#d46a7a]/20 text-white"
              : "border-white/10 bg-white/5 text-white/70"
          }`}
        >
          Girl
        </button>
        <button
          type="button"
          onClick={() => setGender("trans")}
          className={`rounded-2xl border py-3 text-xs uppercase tracking-[0.3em] transition ${
            gender === "trans"
              ? "border-[#d46a7a] bg-[#d46a7a]/20 text-white"
              : "border-white/10 bg-white/5 text-white/70"
          }`}
        >
          Trans
        </button>
      </div>
    </div>
  );
}
