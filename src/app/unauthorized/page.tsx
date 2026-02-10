import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
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
      </div>
    </div>
  );
}
