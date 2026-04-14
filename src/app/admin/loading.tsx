import PageShell from "@/components/PageShell";

const skeletonCards = Array.from({ length: 6 }, (_, index) => index);

export default function AdminLoading() {
  return (
    <PageShell widthClassName="max-w-[88rem]" contentClassName="pt-2 sm:pt-3">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <div className="h-3 w-28 animate-pulse rounded-full bg-[#f5d68c]/20" />
            <div className="mt-3 h-10 w-56 animate-pulse rounded-2xl bg-white/10" />
          </div>
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <div className="h-12 w-full animate-pulse rounded-full bg-white/10 sm:w-64" />
            <div className="h-12 w-full animate-pulse rounded-full bg-white/10 sm:w-72" />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-3xl border border-white/10 bg-white/5"
            />
          ))}
        </div>

        <div className="mt-8 grid gap-4">
          {skeletonCards.map((card) => (
            <div
              key={card}
              className="h-40 animate-pulse rounded-3xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
