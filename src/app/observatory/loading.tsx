export default function ObservatoryLoading() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-64 bg-white/[0.06] rounded animate-pulse mb-4 mx-auto" />
        <div className="h-4 w-96 bg-white/[0.04] rounded animate-pulse mb-12 mx-auto" />
        {/* Tab bar skeleton */}
        <div className="flex gap-2 mb-12 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-white/[0.06] rounded-full animate-pulse" />
          ))}
        </div>
        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 space-y-3">
              <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-6 w-3/4 bg-white/[0.06] rounded animate-pulse" />
              <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-white/[0.04] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
