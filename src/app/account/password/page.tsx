import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import PasswordChangeForm from "./password-change-form";

export default async function AccountPasswordPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#f5d68c] sm:text-xs sm:tracking-[0.5em]">
              Account
            </p>
            <h1
              className="mt-3 text-2xl font-semibold sm:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Password Settings
            </h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/75 transition hover:text-white sm:text-xs"
          >
            Back
          </Link>
        </div>

        <div className="mt-8 sm:mt-10">
          <PasswordChangeForm
            email={session.user.email}
            isAdmin={Boolean(session.user.isAdmin)}
          />
        </div>
      </div>
    </div>
  );
}
