"use client";

import { useEffect, useState } from "react";

const toggleButtonClassName =
  "rounded-[16px] px-4 py-3 text-sm uppercase tracking-[0.26em] transition";

export default function DescriptionHelper() {
  const [wantsHelp, setWantsHelp] = useState<"yes" | "no">("no");
  const [aboutText, setAboutText] = useState("");

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const profile =
        (event as CustomEvent<{ profile?: { formFields?: Record<string, unknown> } }>).detail?.profile;
      const formFields =
        profile?.formFields && typeof profile.formFields === "object" && !Array.isArray(profile.formFields)
          ? profile.formFields
          : {};
      const raw = formFields.descriptionHelp;
      if (raw === "yes" || raw === "no") {
        setWantsHelp(raw);
      } else {
        setWantsHelp("no");
      }

      const aboutRaw = formFields.aboutText;
      if (typeof aboutRaw === "string") {
        setAboutText(aboutRaw);
        return;
      }

      if (Array.isArray(aboutRaw)) {
        const first = aboutRaw.find(
          (item): item is string => typeof item === "string" && item.trim().length > 0
        );
        setAboutText(first ?? "");
        return;
      }

      setAboutText("");
    };

    window.addEventListener("profile:prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("profile:prefill", handlePrefill as EventListener);
  }, []);

  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(10,11,13,0.94)_42%)] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.3)] sm:p-7">
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#f5d68c] sm:text-xs sm:tracking-[0.34em]">
          About Support
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white sm:text-[2rem]">
          Help me write the about section
        </h3>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/62 sm:text-lg">
          Choose if you want to write it yourself or want help.
        </p>
      </div>

      <div className="mt-6 rounded-[26px] border border-white/10 bg-black/28 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-white">Need writing help?</p>
          </div>
          <span
            className={`rounded-full border px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] ${
              wantsHelp === "yes"
                ? "border-[#f5d68c]/35 bg-[#f5d68c]/10 text-[#f5d68c]"
                : "border-white/10 bg-black/45 text-white/45"
            }`}
          >
            {wantsHelp === "yes" ? "Support On" : "Self Written"}
          </span>
        </div>

        <div className="mt-5 rounded-[22px] border border-white/10 bg-black/45 p-2.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWantsHelp("no")}
              className={`${toggleButtonClassName} ${
                wantsHelp === "no"
                  ? "bg-white/12 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => setWantsHelp("yes")}
              className={`${toggleButtonClassName} ${
                wantsHelp === "yes"
                  ? "bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] text-black"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              Yes
            </button>
          </div>
        </div>
      </div>

      <input type="hidden" name="descriptionHelp" value={wantsHelp} />

      <div className="mt-5 rounded-[26px] border border-white/10 bg-black/25 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-semibold text-white">
            {wantsHelp === "yes" ? "Notes for our writing team" : "Your public about"}
          </p>
          <span className="rounded-full border border-white/10 bg-black/45 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/45">
            {aboutText.trim().length} characters
          </span>
        </div>

        <textarea
          name="aboutText"
          value={aboutText}
          onChange={(event) => setAboutText(event.target.value)}
          rows={5}
          placeholder={
            wantsHelp === "yes"
              ? "Example: elegant, discreet, available in Barcelona, massage friendly, speaks English and Spanish..."
              : "Write a brief introduction of yourself."
          }
          className="mt-4 w-full resize-none rounded-[22px] border border-white/10 bg-black/50 px-4 py-3.5 text-base text-white/88 placeholder:text-white/35 focus:border-[#f5d68c]/60 focus:outline-none"
        />
      </div>
    </div>
  );
}
