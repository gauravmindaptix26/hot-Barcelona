"use client";

import Image from "next/image";
import Link from "next/link";
import NavIcon from "./NavIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Girls", href: "/girls" },
  { label: "Trans Zone", href: "/trans-escorts" },
  { label: "Contact", href: "/contact" },
];

const getUserInitial = (name?: string | null, email?: string | null) => {
  const raw = (name ?? "").trim() || (email ?? "").trim();
  if (!raw) return "U";
  return raw.charAt(0).toUpperCase();
};

export default function Navbar() {
  const { data: session } = useSession();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const accountItemClass =
    "rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm uppercase tracking-[0.22em] text-white/85 transition hover:text-white";

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

  return (
    <header className="relative z-20 -mt-3 sm:-mt-4 lg:-mt-5">
      <nav className="mx-auto flex w-full max-w-[88rem] items-start justify-between px-4 py-0 sm:px-6 lg:py-1">
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="Go to home"
            className="block -ml-1 -mt-6 sm:-mt-8 lg:-mt-10"
          >
            <div className="relative h-[240px] w-[240px] sm:h-[300px] sm:w-[300px] lg:h-[380px] lg:w-[380px]">
              <Image
                src="/images/2.png"
                alt="Hot Barcelona"
                width={240}
                height={240}
                priority
                className="h-full w-full object-contain object-top"
              />
            </div>
          </Link>
        </div>

        <div className="hidden items-center gap-3 rounded-full border border-white/20 bg-black/45 px-4 py-2.5 text-base font-semibold text-white shadow-[0_16px_38px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:mt-24 lg:flex xl:mt-28">
          {navItems.map((item) => {
            const itemClass =
              "group relative rounded-full px-7 py-3 text-white/85 transition hover:bg-white/10 hover:text-white";

            if (item.href) {
              return (
                <Link key={item.label} href={item.href} className={itemClass}>
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

        <div className="flex items-center gap-2 sm:gap-3 lg:mt-24 lg:gap-3 xl:mt-28">
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/registro-escorts"
              className="rounded-full border border-white/20 bg-black/45 px-8 py-3 text-base font-semibold uppercase tracking-[0.34em] text-white/95 shadow-[0_14px_34px_rgba(0,0,0,0.45)] transition hover:border-[#f5d68c]/45 hover:bg-black/65"
            >
              Advertise
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/90 shadow-[0_14px_32px_rgba(0,0,0,0.5)] backdrop-blur transition hover:bg-black/70 lg:hidden"
            aria-label="Search"
          >
            <NavIcon path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" />
          </button>
          <div className="lg:hidden">
            <LanguageSwitcher compact />
          </div>
          {session?.user && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f5d68c]/40 bg-black/60 text-[10px] font-semibold tracking-[0.2em] text-[#f5d68c] lg:hidden">
              {getUserInitial(session.user.name, session.user.email)}
            </span>
          )}

          <div
            ref={accountRef}
            className="relative hidden items-center gap-3 rounded-full border border-white/20 bg-black/40 px-4 py-2.5 text-white/90 shadow-[0_14px_34px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:flex"
          >
            <button className="rounded-full p-2 transition hover:bg-black/60">
              <NavIcon path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" />
            </button>
            <div className="h-5 w-px bg-white/15" />
            <LanguageSwitcher />
            <div className="h-5 w-px bg-white/15" />
            <button
              type="button"
              onClick={() => setIsAccountOpen((prev) => !prev)}
              className="rounded-full p-2 transition hover:bg-black/60"
            >
              {session?.user ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f5d68c]/40 bg-black/60 text-xs font-semibold tracking-[0.2em] text-[#f5d68c]">
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
                        <span className="notranslate">Admin</span>
                      </Link>
                    )}
                    <Link
                      href="/my-ad"
                      className={accountItemClass}
                    >
                      <span className="notranslate">My Ad</span>
                    </Link>
                    <Link
                      href="/profile/me"
                      className={accountItemClass}
                    >
                      <span className="notranslate">My Profile</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className={accountItemClass}
                    >
                      <span className="notranslate">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/login"
                      className={accountItemClass}
                    >
                      <span className="notranslate">Login</span>
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-3 py-2.5 text-sm font-semibold uppercase tracking-[0.22em] text-black"
                    >
                      <span className="notranslate">Register</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/90 shadow-[0_14px_32px_rgba(0,0,0,0.5)] backdrop-blur transition hover:bg-black/70 lg:hidden"
            aria-label="Open menu"
          >
            <NavIcon path="M4 7h16M4 12h16M4 17h16" />
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="mx-auto w-full max-w-[88rem] px-4 pb-4 sm:px-6 lg:hidden">
          <div className="rounded-[24px] border border-white/10 bg-[#0b0c10]/95 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.5)] backdrop-blur">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/80 transition hover:text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/registro-escorts"
                className="rounded-2xl bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-4 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-black shadow-[0_16px_30px_rgba(245,179,92,0.35)] transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Advertise
              </Link>
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
