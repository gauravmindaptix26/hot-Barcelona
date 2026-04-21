export default function RouteLoading({ label = "Loading" }: { label?: string }) {
  return (
    <main className="min-h-screen bg-[#0a0b0d] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="h-24 w-24 rounded-full bg-white/5 sm:h-28 sm:w-28" />
        <div className="mt-8 max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#f5d68c] sm:text-xs">
            {label}
          </p>
          <div className="mt-4 h-10 w-3/4 rounded-2xl bg-white/10 sm:h-14" />
          <div className="mt-4 h-5 w-full rounded-full bg-white/8" />
          <div className="mt-2 h-5 w-2/3 rounded-full bg-white/8" />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-[22px] border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
