"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";

const offerTitle = "SPECIAL LAUNCH OFFER:";
const offerDiscounts = [
  "Week 1: 10%\u00A0off",
  "Week 2: 15%\u00A0off",
  "Month 1: 25%\u00A0off",
];
const OFFER_SEEN_KEY = "hb_launch_offer_seen_v2";

const offerLines = [
  "For every new girl/guy you recommend to our site, you'll get 1 week of free advertising.",
  "For every 3 new girls/guys you recommend to our site, you'll get 1 month of free advertising.",
];

export default function LaunchOfferPopup() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return window.sessionStorage.getItem(OFFER_SEEN_KEY) !== "true";
    } catch {
      return true;
    }
  });

  useBodyScrollLock(isOpen);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    try {
      window.sessionStorage.setItem(OFFER_SEEN_KEY, "true");
    } catch {
      // Ignore storage errors.
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[220] bg-[radial-gradient(circle_at_top,rgba(245,214,140,0.12),rgba(0,0,0,0.88)_55%)] p-3 backdrop-blur-md sm:p-6"
      >
        <div className="flex min-h-dvh items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="launch-offer-title"
            className="relative flex w-full max-w-5xl max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[34px] border border-[#f5d68c]/18 bg-[#07080b] text-white shadow-[0_36px_120px_rgba(0,0,0,0.68)] sm:max-h-[calc(100dvh-3rem)]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_left,rgba(245,214,140,0.26),rgba(245,179,92,0.08)_34%,rgba(0,0,0,0)_72%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_24%,transparent_76%,rgba(255,255,255,0.03))]" />
            <div className="pointer-events-none absolute -left-12 top-8 h-40 w-40 rounded-full bg-[#f5d68c]/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-10 bottom-4 h-40 w-40 rounded-full bg-[#d46a7a]/10 blur-3xl" />

            <div className="relative flex-1 overflow-y-auto p-4 sm:p-7">
              <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0 lg:max-w-[42rem]">
                    <h2
                      id="launch-offer-title"
                      className="text-2xl font-semibold leading-tight text-[#fff7df] sm:text-4xl"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {offerTitle}
                    </h2>

                    <p className="mt-4 flex flex-wrap gap-2 text-base font-medium leading-relaxed text-white/90 sm:text-xl xl:text-2xl">
                      {offerDiscounts.map((discount, index) => (
                        <span
                          key={discount}
                          className="whitespace-nowrap rounded-full border border-[#f5d68c]/22 bg-black/30 px-3 py-1.5"
                        >
                          {discount}
                          {index < offerDiscounts.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-full border border-[#f8dea4] bg-[#f5d68c] px-6 py-3.5 text-sm font-extrabold uppercase tracking-[0.22em] text-[#07080b] shadow-[0_18px_34px_rgba(245,179,92,0.42)] transition hover:bg-[#ffe5aa] hover:shadow-[0_20px_40px_rgba(245,179,92,0.52)] focus:outline-none focus:ring-2 focus:ring-[#fff3cf] focus:ring-offset-2 focus:ring-offset-[#07080b] sm:text-base lg:w-auto lg:min-w-[190px]"
                  >
                    Thanks
                  </button>
                </div>

                <div className="my-6 h-px w-full bg-gradient-to-r from-white/0 via-[#f5d68c]/35 to-white/0" />

                <div className="grid gap-4">
                  {offerLines.map((line) => (
                    <div
                      key={line}
                      className="rounded-[24px] border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] px-5 py-4"
                    >
                      <p className="text-sm leading-relaxed text-white/84 sm:text-base">
                        {line}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-white/0 via-white/18 to-white/0" />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
