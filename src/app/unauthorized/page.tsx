import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function UnauthorizedPage() {
  return (
    <PageShell centered widthClassName="max-w-3xl" contentClassName="text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-[#f5d68c]">
          Access Denied
        </p>
        <h1
          className="mt-4 text-3xl font-semibold sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          You are not authorized to view this page
        </h1>
        <p className="mt-4 text-sm text-white/60">
          Only verified female users can create profiles and upload images.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full border border-white/20 px-6 py-2 text-xs uppercase tracking-[0.35em] text-white/70 transition hover:text-white"
        >
          Back to home
        </Link>
    </PageShell>
  );
}
