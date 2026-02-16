"use client";

import { useState } from "react";

export default function DescriptionHelper() {
  const [wantsHelp, setWantsHelp] = useState<"yes" | "no">("no");

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 sm:p-6">
      <p className="text-sm text-white/70">
        If you want us to help you with the description, please choose an
        option.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-black/40 p-2">
        <button
          type="button"
          onClick={() => setWantsHelp("no")}
          className={`rounded-xl py-2 text-xs uppercase tracking-[0.3em] transition ${
            wantsHelp === "no"
              ? "bg-white/10 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          No
        </button>
        <button
          type="button"
          onClick={() => setWantsHelp("yes")}
          className={`rounded-xl py-2 text-xs uppercase tracking-[0.3em] transition ${
            wantsHelp === "yes"
              ? "bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          Yes
        </button>
      </div>

      <input type="hidden" name="descriptionHelp" value={wantsHelp} />

      <textarea
        name="descriptionText"
        rows={5}
        placeholder="Give a brief introduction of yourself."
        className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/80 placeholder:text-white/40 focus:border-[#f5d68c]/60 focus:outline-none"
      />
      <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-white/40">
        Character counter
      </p>
    </div>
  );
}
