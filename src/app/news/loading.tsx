export default function NewsLoading() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 w-48 bg-white/[0.06] rounded animate-pulse mb-4 mx-auto" />
        <div className="h-4 w-80 bg-white/[0.04] rounded animate-pulse mb-12 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0f172a]/40 border border-space-500/30 rounded-2xl overflow-hidden">
              <div className="h-48 bg-white/[0.03] animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-32 bg-white/[0.06] rounded animate-pulse" />
                <div className="h-6 w-full bg-white/[0.06] rounded animate-pulse" />
                <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-white/[0.04] rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
