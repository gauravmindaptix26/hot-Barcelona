"use client";

import { useEffect, useState } from "react";

const AGE_CHECK_KEY = "hb_age_verified_session_v2";

export default function AgeCheckModal() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return window.sessionStorage.getItem(AGE_CHECK_KEY) !== "true";
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
      window.sessionStorage.setItem(AGE_CHECK_KEY, "true");
    } catch {
      // Ignore storage errors and allow entry for this session.
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto overscroll-contain bg-black/75 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex min-h-screen min-h-dvh items-center justify-center py-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-check-title"
          className="flex w-full max-w-md max-h-[calc(100vh-1rem)] max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0b0c10] text-white shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:max-h-[calc(100vh-2rem)] sm:max-h-[calc(100dvh-2rem)]"
        >
          <div className="flex-1 overflow-y-auto px-5 pt-5 sm:px-8 sm:pt-8">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.45em]">
              Age Check
            </p>
            <h2
              id="age-check-title"
              className="mt-3 text-xl font-semibold sm:text-3xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Confirm you are 18+
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
              This website is only for adults. Click below to continue.
            </p>
          </div>

          <div className="shrink-0 border-t border-white/10 bg-[#0b0c10]/95 px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 backdrop-blur sm:border-0 sm:bg-transparent sm:px-8 sm:pb-8 sm:pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="min-h-[3.25rem] w-full rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_16px_32px_rgba(245,179,92,0.35)] transition hover:brightness-110"
            >
              I am 18+
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
