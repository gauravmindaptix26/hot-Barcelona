export default function ProfileMeLoading() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="mt-4 h-10 w-64 animate-pulse rounded-2xl bg-white/10" />
        <div className="mt-10 grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-4 w-full animate-pulse rounded-full bg-white/10" />
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-32 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
