"use client";

import { useState } from "react";

type Props = {
  email?: string | null;
  isAdmin?: boolean;
};

export default function PasswordChangeForm({ email, isAdmin = false }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [codeMessage, setCodeMessage] = useState("");
  const [debugCode, setDebugCode] = useState("");

  const sendCode = async () => {
    setError("");
    setSuccess("");
    setCodeMessage("");
    setDebugCode("");
    setIsSendingCode(true);

    try {
      const response = await fetch("/api/account/password/code", {
        method: "POST",
      });
      const data = (await response.json().catch(() => null)) as
        | { error?: string; message?: string; debugCode?: string }
        | null;

      if (!response.ok) {
        setError(data?.error ?? "Failed to send code.");
        return;
      }

      setCodeMessage(data?.message ?? "Password change code sent to your email.");
      if (data?.debugCode) {
        setDebugCode(data.debugCode);
      }
    } catch {
      setError("Failed to send code.");
    } finally {
      setIsSendingCode(false);
    }
  };

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
            verificationCode: String(formData.get("verificationCode") ?? ""),
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
            setCodeMessage("");
            setDebugCode("");
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
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <input
            name="verificationCode"
            inputMode="numeric"
            pattern="[0-9]{6}"
            placeholder="6-digit email code"
            autoComplete="one-time-code"
            className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
            required
          />
          <button
            type="button"
            onClick={() => void sendCode()}
            disabled={isSendingCode}
            className="rounded-full border border-[#f5d68c]/35 bg-[#f5d68c]/10 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5d68c] transition hover:bg-[#f5d68c]/15 disabled:opacity-60"
          >
            {isSendingCode ? "Sending..." : "Send Code"}
          </button>
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
        {codeMessage && <p className="text-sm text-green-300">{codeMessage}</p>}
        {debugCode && (
          <p className="rounded-2xl border border-[#f5d68c]/25 bg-[#f5d68c]/10 p-3 text-xs text-[#f8dfb3]">
            Dev code: {debugCode}
          </p>
        )}
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
