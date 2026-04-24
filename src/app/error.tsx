"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0b0d] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.42)] sm:p-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#f5d68c] sm:text-xs">
            Temporary Error
          </p>
          <h1
            className="mt-4 text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            This page needs a fresh retry
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
            The website is still running, but this screen hit an unexpected issue.
            Retry once, or go back to the main page.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-black/35 px-6 py-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/82 transition hover:border-[#f5d68c]/35 hover:text-white"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
