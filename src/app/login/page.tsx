"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/post-login");
    }
  }, [router, status]);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
          <div className="mb-5 flex justify-end">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center rounded-full border border-white/20 bg-black/50 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/75 transition hover:text-white sm:text-xs sm:tracking-[0.35em]"
            >
              Back
            </button>
          </div>
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
              const email = String(formData.get("email") ?? "");
              const password = String(formData.get("password") ?? "");
              const requestedCallback = new URLSearchParams(
                window.location.search
              ).get("callbackUrl");
              const callbackUrl =
                requestedCallback && requestedCallback.startsWith("/")
                  ? requestedCallback
                  : "/post-login";

              const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl,
              });

              if (!result || result.error) {
                setError("Invalid email or password");
                setIsSubmitting(false);
                return;
              }

              router.replace(callbackUrl);
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
            <div className="-mt-1 text-right">
              <Link href="/forgot-password" className="text-xs text-white/60 transition hover:text-[#f5d68c]">
                Forgot Password?
              </Link>
            </div>
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
