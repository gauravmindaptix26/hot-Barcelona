"use client";

import { getSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ["/", "/register", "/forgot-password", "/my-ad", "/profile/me", "/admin"].forEach((route) => {
      router.prefetch(route);
    });
  }, [router]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0b0d] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,179,92,0.22),_rgba(245,179,92,0)_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -left-32 top-36 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,_rgba(212,106,122,0.18),_rgba(212,106,122,0)_70%)] blur-2xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,214,140,0.14),_rgba(245,214,140,0)_65%)] blur-2xl" />

      <main className="relative z-10">
        <section className="relative overflow-hidden pb-6 pt-0 sm:pb-8 sm:pt-1">
          <Navbar />

          <div className="mx-auto flex w-full max-w-5xl px-4 pb-6 pt-0 sm:px-6 sm:pb-8 sm:pt-0 lg:-mt-14 lg:min-h-[calc(100vh-9rem)] lg:items-start xl:-mt-20">
            <div className="w-full rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-6 lg:p-7">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center rounded-full border border-white/20 bg-black/50 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/75 transition hover:text-white sm:text-xs sm:tracking-[0.35em]"
                >
                  Back
                </button>
              </div>
              <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
                User Access
              </p>
              <h1
                className="mt-3 text-3xl font-semibold sm:text-4xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-white/60">
                Girls and trans can create and edit their profiles here.
              </p>

              <form
                className="mt-6 grid gap-3.5 sm:mt-7"
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
                      : undefined;

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

                  if (callbackUrl) {
                    router.replace(callbackUrl);
                    setIsSubmitting(false);
                    return;
                  }

                  const session = await getSession();
                  const target =
                    session?.user?.isAdmin
                      ? "/admin"
                      : session?.user?.gender === "female"
                        ? "/profile/me"
                        : "/my-ad";

                  router.replace(target);
                  setIsSubmitting(false);
                }}
              >
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="off"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 text-white focus:border-[#f5d68c]/70 focus:outline-none"
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-2.5 text-white focus:border-[#f5d68c]/70 focus:outline-none"
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
                  className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.35em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.3)] transition disabled:opacity-60"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="mt-4 text-sm text-white/60">
                New here?{" "}
                <Link href="/register" className="text-[#f5d68c]">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
