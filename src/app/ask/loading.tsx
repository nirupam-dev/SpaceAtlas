// Route-level loading state for Ask AI page
export default function AskLoading() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col pt-20">
      <div className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center gap-4 border-b border-space-500/20">
        <div className="w-10 h-10 rounded-full bg-space-700 animate-pulse" />
        <div>
          <div className="h-5 w-32 bg-space-700 rounded animate-pulse mb-1" />
          <div className="h-3 w-20 bg-space-800 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-space-700 animate-pulse shrink-0" />
          <div className="glass-card rounded-2xl p-5 max-w-[80%]">
            <div className="h-4 w-64 bg-space-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-space-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
