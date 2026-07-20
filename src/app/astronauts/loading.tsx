export default function AstronautsLoading() {
  return (
    <div className="relative bg-[#020617] min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="relative z-10 w-full max-w-[700px] px-8 mx-auto mt-20">
          <div className="h-16 w-[400px] max-w-full bg-white/[0.06] rounded animate-pulse mb-8 mx-auto" />
          <div className="h-5 w-full bg-white/[0.04] rounded animate-pulse mb-3 mx-auto" />
          <div className="h-5 w-3/4 bg-white/[0.04] rounded animate-pulse mb-12 mx-auto" />
          <div className="h-12 w-40 bg-white/[0.06] rounded animate-pulse mx-auto" />
        </div>
      </section>
      <section className="relative z-10 py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-white/[0.06] rounded animate-pulse mb-8 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#0f172a]/40 border border-space-500/30 rounded-2xl overflow-hidden">
                <div className="h-[220px] bg-white/[0.03] animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-20 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-6 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-4 w-full bg-white/[0.04] rounded animate-pulse" />
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-space-500/30">
                    {[1, 2].map((j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 w-full bg-white/[0.04] rounded animate-pulse" />
                        <div className="h-5 w-1/2 bg-white/[0.06] rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
