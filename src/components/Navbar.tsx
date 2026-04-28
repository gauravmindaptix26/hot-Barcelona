"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import NavIcon from "./NavIcon";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const LanguageSwitcher = dynamic(() => import("./LanguageSwitcher"), {
  ssr: false,
});

const navItems = [
  { label: "Girls", href: "/girls" },
  { label: "Trans Zone", href: "/trans-escorts" },
  { label: "Contact", href: "/contact" },
];

const getUserInitial = (name?: string | null, email?: string | null) => {
  const raw = (name ?? "").trim() || (email ?? "").trim();
  if (!raw) return "U";
  return Array.from(raw)[0]?.toUpperCase() ?? "U";
};

export default function Navbar({
  compactDesktop = false,
  logoPriority = false,
}: {
  compactDesktop?: boolean;
  logoPriority?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const pendingResetTimeoutRef = useRef<number | null>(null);
  const accountItemClass =
    "rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm uppercase tracking-[0.22em] text-white/85 transition hover:text-white";

  const prefetchRoute = useCallback((route: string) => {
    router.prefetch(route);
  }, [router]);

  const triggerPendingRoute = (route: string) => {
    setPendingRoute(route);
    if (pendingResetTimeoutRef.current) {
      window.clearTimeout(pendingResetTimeoutRef.current);
    }
    pendingResetTimeoutRef.current = window.setTimeout(() => {
      setPendingRoute(null);
      pendingResetTimeoutRef.current = null;
    }, 1400);
  };

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const isSmallScreen = (() => {
      if (typeof window === "undefined") return false;
      if (typeof window.matchMedia === "function") {
        return window.matchMedia("(max-width: 767px)").matches;
      }
      return window.innerWidth < 768;
    })();

    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;

    const isDataSaver = Boolean(connection?.saveData);
    const effectiveType = connection?.effectiveType ?? "";
    const isSlowConnection = effectiveType === "slow-2g" || effectiveType === "2g";

    if (isSmallScreen || isDataSaver || isSlowConnection) {
      return;
    }

    const routesToPrefetch = ["/girls", "/trans-escorts", "/contact"];

    let timeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;
    let idleId: number | null = null;

    const runPrefetch = () => {
      routesToPrefetch.forEach((route) => prefetchRoute(route));
    };

    if ("requestIdleCallback" in globalThis) {
      idleId = globalThis.requestIdleCallback(runPrefetch, { timeout: 1200 });
    } else {
      timeoutId = globalThis.setTimeout(runPrefetch, 0);
    }

    return () => {
      if (timeoutId !== null) {
        globalThis.clearTimeout(timeoutId);
      }
      if (idleId !== null && "cancelIdleCallback" in globalThis) {
        globalThis.cancelIdleCallback(idleId);
      }
    };
  }, [prefetchRoute, session]);

  useEffect(() => {
    return () => {
      if (pendingResetTimeoutRef.current) {
        window.clearTimeout(pendingResetTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className={`relative z-20 ${compactDesktop ? "" : "lg:-mt-5"}`}>
      {pendingRoute && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-0.5 overflow-hidden">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-[#f5d68c] to-transparent" />
        </div>
      )}
      <nav
        className={`mx-auto flex w-full max-w-[88rem] items-center justify-between px-3 py-2.5 sm:px-6 sm:py-4 ${
          compactDesktop ? "lg:py-4" : "lg:items-start lg:py-1"
        }`}
      >
        <div className="flex items-center">
            <Link
              href="/"
              aria-label="Go to home"
              className={`block -ml-6 -mt-6 sm:-ml-5 sm:-mt-5 ${
                compactDesktop
                  ? "lg:ml-0 lg:mt-0"
                  : "lg:-ml-28 lg:-mt-36"
              }`}
            >
            <div
              className={`relative h-[13.5rem] w-[13.5rem] sm:h-[14rem] sm:w-[14rem] ${
                compactDesktop
                  ? "lg:h-28 lg:w-28"
                  : "lg:h-[580px] lg:w-[580px]"
              }`}
            >
              <Image
                src="/images/added%20logo.png"
                alt="Hot Barcelona"
                width={2000}
                height={2000}
                sizes={
                  compactDesktop
                    ? "(max-width: 639px) 13.5rem, (max-width: 1023px) 14rem, 7rem"
                    : "(max-width: 639px) 13.5rem, (max-width: 1023px) 14rem, 580px"
                }
                quality={72}
                priority={logoPriority}
                loading={logoPriority ? undefined : "lazy"}
                fetchPriority={logoPriority ? "high" : "low"}
                className="h-full w-full object-contain object-top"
              />
            </div>
          </Link>
        </div>

        <div
          className={`hidden items-center gap-3 rounded-full border border-white/20 bg-black/45 px-4 py-2.5 text-base font-semibold text-white shadow-[0_16px_38px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:flex ${
            compactDesktop ? "" : "lg:mt-24 xl:mt-28"
          }`}
        >
          {navItems.map((item) => {
            const itemClass =
              "group relative rounded-full px-7 py-3 text-white/85 transition hover:bg-white/10 hover:text-white";

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={itemClass}
                  onMouseEnter={() => prefetchRoute(item.href)}
                  onFocus={() => prefetchRoute(item.href)}
                  onTouchStart={() => prefetchRoute(item.href)}
                  onClick={() => triggerPendingRoute(item.href)}
                >
                  {item.label}
                  <span className="absolute -bottom-2 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#f5b35c] via-[#d46a7a] to-[#f5d68c] transition group-hover:scale-x-100" />
                </Link>
              );
            }

            return (
              <button key={item.label} type="button" className={itemClass}>
                {item.label}
                <span className="absolute -bottom-2 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-[#f5b35c] via-[#d46a7a] to-[#f5d68c] transition group-hover:scale-x-100" />
              </button>
            );
          })}
        </div>

        <div
          className={`flex items-center gap-1.5 sm:gap-3 lg:gap-3 ${
            compactDesktop ? "" : "lg:mt-24 xl:mt-28"
          }`}
        >
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/registro-escorts"
              className="rounded-full border border-white/20 bg-black/45 px-8 py-3 text-base font-semibold uppercase tracking-[0.34em] text-white/95 shadow-[0_14px_34px_rgba(0,0,0,0.45)] transition hover:border-[#f5d68c]/45 hover:bg-black/65"
              onMouseEnter={() => prefetchRoute("/registro-escorts")}
              onFocus={() => prefetchRoute("/registro-escorts")}
              onTouchStart={() => prefetchRoute("/registro-escorts")}
              onClick={() => triggerPendingRoute("/registro-escorts")}
            >
              Advertise
            </Link>
          </div>

          <div className="shrink-0 lg:hidden">
            <div className="min-h-9 min-w-[5.5rem]">
              <LanguageSwitcher compact />
            </div>
          </div>
          {session?.user && (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#f5d68c]/40 bg-black/25 text-[11px] font-semibold leading-none tracking-normal text-[#f5d68c] backdrop-blur lg:hidden"
            >
              {getUserInitial(session.user.name, session.user.email)}
            </span>
          )}

          <div
            ref={accountRef}
            className="relative hidden items-center gap-3 rounded-full border border-white/20 bg-black/40 px-4 py-2.5 text-white/90 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex"
          >
            <button
              type="button"
              aria-label="Search profiles"
              className="rounded-full p-2 transition hover:bg-black/60"
            >
              <NavIcon path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" />
            </button>
            <div className="h-5 w-px bg-white/15" />
            <div className="min-h-10 min-w-[6rem]">
              <LanguageSwitcher />
            </div>
            <div className="h-5 w-px bg-white/15" />
            <button
              type="button"
              onClick={() => setIsAccountOpen((prev) => !prev)}
              aria-label={session?.user ? "Open account menu" : "Open account options"}
              aria-expanded={isAccountOpen}
              className="rounded-full p-2 transition hover:bg-black/60"
            >
              {session?.user ? (
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#f5d68c]/40 bg-transparent text-xs font-semibold leading-none tracking-normal text-[#f5d68c]"
                >
                  {getUserInitial(session.user.name, session.user.email)}
                </span>
              ) : (
                <NavIcon path="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" />
              )}
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 top-12 z-30 w-56 rounded-2xl border border-white/10 bg-[#0b0c10] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                {session?.user ? (
                  <div className="grid gap-2">
                    {session.user.isAdmin && (
                      <Link
                        href="/admin"
                        className={accountItemClass}
                      >
                        <span>Admin</span>
                      </Link>
                    )}
                    <Link
                      href="/my-ad"
                      className={accountItemClass}
                    >
                      <span>My Ad</span>
                    </Link>
                    <Link
                      href="/profile/me"
                      className={accountItemClass}
                    >
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/account/password"
                      className={accountItemClass}
                    >
                      <span>Change Password</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className={accountItemClass}
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/login"
                      className={accountItemClass}
                    >
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-black"
                    >
                      <span>Register</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/90 shadow-[0_14px_32px_rgba(0,0,0,0.5)] backdrop-blur transition hover:bg-black/70 lg:hidden"
            aria-label="Open menu"
          >
            <NavIcon path="M4 7h16M4 12h16M4 17h16" />
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="mx-auto w-full max-w-[88rem] px-3 pb-4 sm:px-6 lg:hidden">
          <div className="rounded-[24px] border border-white/10 bg-[#0b0c10]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#f5d68c]">
                  Hot Barcelona
                </p>
                <p className="mt-1 text-xs text-white/60">Quick navigation</p>
              </div>
              <Link
                href="/registro-escorts"
                className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black"
                onMouseEnter={() => prefetchRoute("/registro-escorts")}
                onFocus={() => prefetchRoute("/registro-escorts")}
                onTouchStart={() => prefetchRoute("/registro-escorts")}
                onClick={() => {
                  triggerPendingRoute("/registro-escorts");
                  setIsMenuOpen(false);
                }}
              >
                Advertise
              </Link>
            </div>
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                  onMouseEnter={() => prefetchRoute(item.href)}
                  onFocus={() => prefetchRoute(item.href)}
                  onTouchStart={() => prefetchRoute(item.href)}
                  onClick={() => {
                    triggerPendingRoute(item.href);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}
              {session?.user ? (
                <>
                  {session.user.isAdmin && (
                    <Link
                      href="/admin"
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/my-ad"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Ad
                  </Link>
                  <Link
                    href="/profile/me"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/account/password"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Change Password
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-2xl bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-black"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
