"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  name: string;
  options: string[];
  label: string;
};

export default function ServicesMultiSelect({ name, options, label }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
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

  const toggleValue = (value: string) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const summary = useMemo(() => {
    if (selected.length === 0) return "None";
    return selected.join(", ");
  }, [selected]);

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.28em] text-white/50 sm:text-xs sm:tracking-[0.32em]">
          {label}
        </span>
        <span className="text-[10px] text-white/70 sm:text-xs">
          {summary}
        </span>
      </div>
      {selected.map((value) => (
        <input key={`${name}-${value}`} type="hidden" name={name} value={value} />
      ))}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white/80 focus:border-[#f5d68c]/60 focus:outline-none"
        >
          <span className={selected.length ? "text-white/90" : "text-white/50"}>
            {selected.length ? "Selected services" : "Select your services"}
          </span>
          <span className="text-white/50">v</span>
        </button>

        {open && (
          <div className="absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#0b0c10] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
            {options.map((option) => {
              const checked = selected.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleValue(option)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/5"
                >
                  <span>{option}</span>
                  <span className="text-white/60">{checked ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
