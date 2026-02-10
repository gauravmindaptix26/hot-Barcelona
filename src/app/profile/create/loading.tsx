export default function ProfileCreateLoading() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-10 h-48 animate-pulse rounded-3xl bg-white/10" />
        <div className="mt-10 h-80 animate-pulse rounded-3xl bg-white/10" />
      </div>
    </div>
  );
}
