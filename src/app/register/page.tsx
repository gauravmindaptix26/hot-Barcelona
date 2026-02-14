"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
          <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
            Create Account
          </p>
          <h1
            className="mt-4 text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Register to continue
          </h1>

          <form
            className="mt-8 grid gap-4"
            autoComplete="off"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setIsSubmitting(true);
              const formData = new FormData(event.currentTarget);
              const payload = {
                name: formData.get("name"),
                email: formData.get("email"),
                password: formData.get("password"),
                gender: formData.get("gender"),
              };

              const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              if (!response.ok) {
                const data = await response.json();
                setError(data.error ?? "Registration failed");
                setIsSubmitting(false);
                return;
              }

              await signIn("credentials", {
                email: payload.email,
                password: payload.password,
                redirect: true,
                callbackUrl: "/post-login",
              });
              setIsSubmitting(false);
            }}
          >
            <input
              name="name"
              placeholder="Full name"
              autoComplete="off"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="off"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
              required
            />
            <input
              name="password"
              type="password"
              placeholder="Password (min 8 chars)"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
              required
              minLength={8}
            />
            <select
              name="gender"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
              required
              defaultValue=""
            >
              <option value="" disabled>
                Select gender
              </option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/60">
            Already have an account?{" "}
            <Link href="/login" className="text-[#f5d68c]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
