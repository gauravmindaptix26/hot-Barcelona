"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string;
  options: string[];
  label: string;
};

export default function NationalitySelect({ name, options, label }: Props) {
  const [selected, setSelected] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handlePrefill = (event: Event) => {
      const profile =
        (event as CustomEvent<{ profile?: { formFields?: Record<string, unknown> } }>).detail?.profile;
      const formFields =
        profile?.formFields && typeof profile.formFields === "object" && !Array.isArray(profile.formFields)
          ? profile.formFields
          : {};
      const raw = formFields[name];

      if (typeof raw === "string") {
        setSelected(raw);
        return;
      }

      if (Array.isArray(raw)) {
        const first = raw.find((item): item is string => typeof item === "string" && item.trim().length > 0);
        setSelected(first ?? "");
      }
    };

    window.addEventListener("profile:prefill", handlePrefill as EventListener);
    return () => window.removeEventListener("profile:prefill", handlePrefill as EventListener);
  }, [name]);

  const summary = useMemo(() => selected || "None", [selected]);

  return (
    <div ref={containerRef} className="space-y-3">
      <div className="flex flex-col items-start gap-1.5">
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/55 sm:text-sm">
          {label}
        </span>
        <span className="min-w-0 break-words text-sm leading-relaxed text-white/78 sm:text-base">
          {summary}
        </span>
      </div>
      <input type="hidden" name={name} value={selected} />
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(0,0,0,0.58))] px-4 py-3.5 text-base text-white/88 shadow-[0_14px_34px_rgba(0,0,0,0.18)] focus:border-[#f5d68c]/60 focus:outline-none"
        >
          <span className={selected ? "text-white/90" : "text-white/50"}>
            {selected || "Your nationality"}
          </span>
          <span
            className={
              open
                ? "h-0 w-0 border-x-[5px] border-b-[8px] border-x-transparent border-b-white/55"
                : "h-0 w-0 border-x-[5px] border-t-[8px] border-x-transparent border-t-white/55"
            }
            aria-hidden="true"
          />
        </button>

        {open && (
          <div className="select-menu-scroll absolute z-30 mt-2 max-h-72 w-full overflow-y-scroll overscroll-contain rounded-[22px] border border-white/10 bg-[#0b0c10] p-3 shadow-[0_22px_48px_rgba(0,0,0,0.5)]">
            {options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
                className="flex w-full items-start justify-between gap-3 rounded-2xl px-4 py-3 text-left text-base leading-relaxed text-white/84 transition hover:bg-white/5"
              >
                <span className="min-w-0 flex-1 break-words">{option}</span>
                <span className="text-sm text-white/60">
                  {selected === option ? "Selected" : ""}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
