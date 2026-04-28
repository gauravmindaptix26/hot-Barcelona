"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const digest = typeof error?.digest === "string" ? error.digest : null;
  const showMessage = process.env.NODE_ENV !== "production";
  const message = showMessage ? error?.message : null;

  return (
    <html lang="es">
      <body className="bg-[#0a0b0d] text-white">
        <main className="min-h-screen px-4 py-10 sm:px-6">
          <div className="mx-auto flex min-h-[80vh] w-full max-w-3xl items-center justify-center">
            <div className="w-full rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_70px_rgba(0,0,0,0.42)] sm:p-8">
              <p className="text-[10px] uppercase tracking-[0.4em] text-[#f5d68c] sm:text-xs">
                Recovery Mode
              </p>
              <h1
                className="mt-4 text-3xl font-semibold sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                We can recover this page
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/68 sm:text-base">
                A global app error interrupted the screen. Retry the app once, or
                return to the home page.
              </p>
              {(digest || message) && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
                  {digest && (
                    <p>
                      <span className="font-semibold text-white/85">Digest:</span>{" "}
                      {digest}
                    </p>
                  )}
                  {message && (
                    <p className="mt-1 break-words">
                      <span className="font-semibold text-white/85">Error:</span>{" "}
                      {message}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-black shadow-[0_18px_34px_rgba(245,179,92,0.35)] transition hover:brightness-110"
                >
                  Reload App
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
      </body>
    </html>
  );
}
