"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
          <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
            Profile Access
          </p>
          <h1
            className="mt-4 text-3xl font-semibold sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Girls and trans can create and edit their profiles here.
          </p>

          <form
            className="mt-8 grid gap-4"
            autoComplete="off"
            onSubmit={async (event) => {
              event.preventDefault();
              setError("");
              setIsSubmitting(true);
              const formData = new FormData(event.currentTarget);
              const email = formData.get("email");
              const password = formData.get("password");
              const result = await signIn("credentials", {
                email,
                password,
                redirect: true,
                callbackUrl: "/post-login",
              });
              if (result?.error) {
                setError("Invalid email or password");
              }
              setIsSubmitting(false);
            }}
          >
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
              placeholder="Password"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white focus:border-[#f5d68c]/70 focus:outline-none"
              required
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-white/60">
            New here?{" "}
            <Link href="/register" className="text-[#f5d68c]">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
