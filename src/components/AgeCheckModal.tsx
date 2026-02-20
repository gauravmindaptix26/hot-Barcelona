"use client";

import { useEffect, useState } from "react";

const AGE_CHECK_KEY = "hb_age_verified_v1";

export default function AgeCheckModal() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return window.localStorage.getItem(AGE_CHECK_KEY) !== "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleConfirm = () => {
    try {
      window.localStorage.setItem(AGE_CHECK_KEY, "true");
    } catch {
      // Ignore localStorage errors and allow entry for this session.
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-check-title"
        className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0b0c10] p-6 text-white shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:p-8"
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
          Age Check
        </p>
        <h2
          id="age-check-title"
          className="mt-3 text-2xl font-semibold sm:text-3xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Confirm you are 18+
        </h2>
        <p className="mt-3 text-sm text-white/70 sm:text-base">
          This website is only for adults. Click below to continue.
        </p>

        <button
          type="button"
          onClick={handleConfirm}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_16px_32px_rgba(245,179,92,0.35)] transition hover:brightness-110"
        >
          I am 18+
        </button>
      </div>
    </div>
  );
}
