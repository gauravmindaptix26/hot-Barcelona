"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get("token") ?? "", [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
            Set a new password
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Choose a new password for your account.
          </p>

          {!token ? (
            <div className="mt-8 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-200">
              Reset token is missing. Please open the reset link from your email.
            </div>
          ) : (
            <form
              className="mt-8 grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setError("");
                setSuccess("");
                setIsSubmitting(true);

                const formData = new FormData(event.currentTarget);
                const password = String(formData.get("password") ?? "");
                const confirmPassword = String(formData.get("confirmPassword") ?? "");

                try {
                  const response = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, password, confirmPassword }),
                  });
                  const data = (await response.json().catch(() => null)) as
                    | { error?: string; ok?: boolean }
                    | null;

                  if (!response.ok) {
                    setError(data?.error ?? "Unable to reset password.");
                    return;
                  }

                  setSuccess("Password updated successfully. You can now log in.");
                  (event.currentTarget as HTMLFormElement).reset();
                } catch {
                  setError("Unable to reset password.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <input
                name="password"
                type="password"
                placeholder="New password (min 8 characters)"
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                required
              />
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                required
              />

              {error && <p className="text-sm text-red-300">{error}</p>}
              {success && <p className="text-sm text-green-300">{success}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition disabled:opacity-60"
              >
                {isSubmitting ? "Updating..." : "Reset Password"}
              </button>
            </form>
          )}

          <p className="mt-6 text-sm text-white/60">
            <Link href="/login" className="text-[#f5d68c]">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
