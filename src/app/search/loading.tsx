// Route-level loading state for search page
export default function SearchLoading() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="h-8 w-48 bg-space-800 rounded animate-pulse mb-4" />
        <div className="h-4 w-72 bg-space-800/60 rounded animate-pulse mb-8" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-space-700" />
                <div className="flex-1">
                  <div className="h-5 w-40 bg-space-700 rounded mb-2" />
                  <div className="h-3 w-full bg-space-800 rounded mb-1" />
                  <div className="h-3 w-3/4 bg-space-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
