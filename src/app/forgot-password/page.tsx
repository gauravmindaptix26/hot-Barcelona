"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [debugLink, setDebugLink] = useState("");

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
          <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
            Password Reset
          </p>
          <h1
            className="mt-4 text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Enter your email and we will send you a reset link.
          </p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setMessage("");
              setDebugLink("");
              setIsSubmitting(true);

              const formData = new FormData(event.currentTarget);
              const email = String(formData.get("email") ?? "").trim();

              try {
                const response = await fetch("/api/auth/forgot-password", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                const data = (await response.json().catch(() => null)) as
                  | { error?: string; message?: string; debugResetUrl?: string }
                  | null;

                if (!response.ok) {
                  setError(data?.error ?? "Unable to process request.");
                  return;
                }

                setMessage(
                  data?.message ??
                    "If this email exists, a password reset link has been sent."
                );
                if (data?.debugResetUrl) {
                  setDebugLink(data.debugResetUrl);
                }
              } catch {
                setError("Unable to process request.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
              required
            />

            {error && <p className="text-sm text-red-300">{error}</p>}
            {message && <p className="text-sm text-green-300">{message}</p>}
            {debugLink && (
              <div className="rounded-2xl border border-[#f5d68c]/25 bg-[#f5d68c]/10 p-3 text-xs text-[#f8dfb3]">
                Dev reset link:{" "}
                <a
                  href={debugLink}
                  className="break-all underline"
                >
                  {debugLink}
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition disabled:opacity-60"
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/60">
            Remembered it?{" "}
            <Link href="/login" className="text-[#f5d68c]">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
