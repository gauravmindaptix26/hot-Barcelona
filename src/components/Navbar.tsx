"use client";

import Image from "next/image";
import Link from "next/link";
import NavIcon from "./NavIcon";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Girls", href: "/girls" },
  { label: "Trans", href: "/trans-escorts" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

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
    <header className="relative z-20">
      <nav className="mx-auto -mt-4 flex w-full max-w-[88rem] items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="relative h-[150px] w-[150px]">
            <Image
              src="/images/HOT-BARCELONA-FINAL-Black.jpg.jpeg"
              alt="Hot Barcelona"
              width={150}
              height={150}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="hidden items-center gap-12 rounded-full border border-white/15 bg-black/40 px-14 py-3 text-lg font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur lg:flex">
          {navItems.map((item) => {
            const itemClass =
              "group relative text-white/80 transition hover:text-white";

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

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/registro-escorts"
              className="rounded-full border border-white/15 bg-black/45 px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-white/90 shadow-[0_14px_32px_rgba(0,0,0,0.5)] transition hover:bg-black/60"
            >
              Advertise
            </Link>
            <Link
              href="/trans-escorts"
              className="rounded-full bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-6 py-2.5 text-sm font-semibold uppercase tracking-widest text-black shadow-[0_16px_30px_rgba(245,179,92,0.35)] transition hover:brightness-110"
            >
              Trans Zone
            </Link>
          </div>

          <div
            ref={accountRef}
            className="relative flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-white/90 shadow-[0_14px_32px_rgba(0,0,0,0.5)] backdrop-blur"
          >
            <button className="rounded-full p-2 transition hover:bg-white/10">
              <NavIcon path="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" />
            </button>
            <div className="h-5 w-px bg-white/15" />
            <div className="flex items-center gap-2 pr-1">
              <span className="h-7 w-7 rounded-full bg-[conic-gradient(from_110deg,_#d46a7a,_#f5d68c,_#d46a7a)] shadow-[0_0_0_2px_rgba(255,255,255,0.12)]" />
              <span className="text-xs font-semibold tracking-widest">ES</span>
            </div>
            <div className="h-5 w-px bg-white/15" />
            <button
              type="button"
              onClick={() => setIsAccountOpen((prev) => !prev)}
              className="rounded-full p-2 transition hover:bg-white/10"
            >
              <NavIcon path="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" />
            </button>

            {isAccountOpen && (
              <div className="absolute right-0 top-12 z-30 w-44 rounded-2xl border border-white/10 bg-[#0b0c10] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                {session?.user ? (
                  <div className="grid gap-2">
                    <Link
                      href="/profile/me"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
                    >
                      My Profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/login"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl bg-gradient-to-r from-[#f5d68c] via-[#f5b35c] to-[#d46a7a] px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-black"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white/90 shadow-[0_14px_32px_rgba(0,0,0,0.5)] backdrop-blur transition hover:bg-black/60 lg:hidden">
            <NavIcon path="M4 7h16M4 12h16M4 17h16" />
          </button>
        </div>
      </nav>
    </header>
  );
}
