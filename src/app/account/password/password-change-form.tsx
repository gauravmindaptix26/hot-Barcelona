"use client";

import { useState } from "react";

type Props = {
  email?: string | null;
  isAdmin?: boolean;
};

export default function PasswordChangeForm({ email, isAdmin = false }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div className="rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.32em] text-[#f5d68c] sm:text-xs">
            Security
          </p>
          <h2
            className="mt-3 text-xl font-semibold sm:text-2xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Change Password
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {isAdmin ? "Admin" : "User"} account password update
            {email ? ` for ${email}` : ""}.
          </p>
        </div>
      </div>

      <form
        className="mt-6 grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setSuccess("");
          setIsSubmitting(true);

          const form = event.currentTarget;
          const formData = new FormData(form);
          const payload = {
            currentPassword: String(formData.get("currentPassword") ?? ""),
            newPassword: String(formData.get("newPassword") ?? ""),
            confirmPassword: String(formData.get("confirmPassword") ?? ""),
          };

          try {
            const response = await fetch("/api/account/password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const data = (await response.json().catch(() => null)) as
              | { error?: string; ok?: boolean }
              | null;

            if (!response.ok) {
              setError(data?.error ?? "Failed to change password.");
              return;
            }

            setSuccess("Password changed successfully.");
            form.reset();
          } catch {
            setError("Failed to change password.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <input
          name="currentPassword"
          type="password"
          placeholder="Current password"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
          required
        />
        <input
          name="newPassword"
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
          className="mt-1 rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.32em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
