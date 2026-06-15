"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Rocket, Globe2, Telescope, Users, Building2,
  Newspaper, Loader2, Sparkles, Filter, Zap, Clock, Brain,
} from "lucide-react";
import { Suspense, useState, useEffect, useCallback } from "react";
import type { SearchResponse, EntityType } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { icon: typeof Rocket; href: (s: string) => string; color: string; label: string }> = {
  rocket: { icon: Rocket, href: (s) => `/rockets/${s}`, color: "text-accent-blue", label: "Rockets" },
  planet: { icon: Globe2, href: (s) => `/solar-system/${s}`, color: "text-accent-cyan", label: "Celestial Bodies" },
  mission: { icon: Telescope, href: (s) => `/missions/${s}`, color: "text-accent-purple", label: "Missions" },
  astronaut: { icon: Users, href: (s) => `/astronauts/${s}`, color: "text-accent-amber", label: "Astronauts" },
  agency: { icon: Building2, href: (s) => `/agencies/${s}`, color: "text-accent-green", label: "Agencies" },
  news: { icon: Newspaper, href: (s) => `/news`, color: "text-accent-pink", label: "News" },
};

const SEARCH_MODES = [
  { id: 'hybrid', label: 'Hybrid', icon: Brain, description: 'Semantic + Keyword' },
  { id: 'semantic', label: 'Semantic', icon: Sparkles, description: 'AI-powered meaning' },
  { id: 'keyword', label: 'Keyword', icon: Search, description: 'Exact text match' },
] as const;

// ─── Search Results Component ─────────────────────────────────

function SearchResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  // Local state for the search input so users can type
  const [inputValue, setInputValue] = useState(q);

  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'hybrid' | 'semantic' | 'keyword'>('hybrid');
  const [typeFilter, setTypeFilter] = useState<EntityType[]>([]);

  // Update local input if URL changes (e.g. back button)
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    } else {
      router.push(`/search`);
    }
  };

  const performSearch = useCallback(async () => {
    if (!q.trim()) {
      setResponse(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: q.trim(),
        mode: searchMode,
        limit: '30',
      });
      if (typeFilter.length > 0) {
        params.set('types', typeFilter.join(','));
      }

      const res = await fetch(`/api/semantic-search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      
      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [q, searchMode, typeFilter]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const toggleTypeFilter = (type: EntityType) => {
    setTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <>
      {/* ─── Search Input Form ─── */}
      <form onSubmit={handleSearchSubmit} className="relative mb-8">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-space-400" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="block w-full p-4 pl-12 text-sm text-white bg-space-800/50 border border-space-700 rounded-2xl focus:ring-accent-blue focus:border-accent-blue placeholder-space-500 backdrop-blur-sm shadow-xl shadow-space-900/20"
          placeholder="Search for reusable rockets, Mars missions, astronauts..."
        />
        <button
          type="submit"
          className="text-white absolute right-2.5 bottom-2.5 bg-accent-blue hover:bg-accent-blue/80 focus:ring-4 focus:outline-none focus:ring-accent-blue/50 font-medium rounded-xl text-sm px-4 py-2 transition-colors"
        >
          Search
        </button>
      </form>

      {!q.trim() && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 mx-auto mb-6 text-space-600 opacity-30" />
          <p className="text-space-400 text-lg">Enter a search query to explore the cosmos</p>
          <p className="text-space-600 text-sm mt-2">Try: &quot;reusable rockets&quot;, &quot;missions to Mars&quot;, &quot;who walked on the moon&quot;</p>
        </div>
      )}

      {q.trim() && (
        <>
          {/* Search Mode Selector */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-[10px] font-micro text-space-500 uppercase tracking-widest mr-1">Mode:</span>
            {SEARCH_MODES.map(({ id, label, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setSearchMode(id as typeof searchMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  searchMode === id
                    ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40'
                    : 'bg-space-800/50 text-space-400 border border-space-700/50 hover:border-space-500/50'
                }`}
                title={description}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Entity Type Filter */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <Filter className="w-3.5 h-3.5 text-space-500" />
            <span className="text-[10px] font-micro text-space-500 uppercase tracking-widest mr-1">Filter:</span>
            {Object.entries(TYPE_CONFIG).map(([type, { icon: Icon, color, label }]) => (
              <button
                key={type}
                onClick={() => toggleTypeFilter(type as EntityType)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-300 ${
                  typeFilter.includes(type as EntityType)
                    ? `${color} bg-white/5 border border-current/30`
                    : 'text-space-500 bg-space-800/30 border border-space-700/30 hover:text-space-300'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
            {typeFilter.length > 0 && (
              <button
                onClick={() => setTypeFilter([])}
                className="text-[10px] text-space-500 hover:text-white underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </>
      )}

      {/* Loading State */}
      {loading && q.trim() && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-accent-blue" />
          <span className="text-space-400 font-micro text-sm uppercase tracking-widest">
            Searching the cosmos...
          </span>
        </div>
      )}

      {/* Error State */}
      {error && q.trim() && (
        <div className="text-center py-16">
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={performSearch} className="text-accent-blue hover:underline text-sm">
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {response && !loading && q.trim() && (
        <>
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-[10px] font-micro uppercase tracking-widest text-space-500">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-accent-blue" />
              {response.totalResults} result{response.totalResults !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {response.latencyMs}ms
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="w-3 h-3" />
              {response.searchMode} search
            </span>
            {response.expandedTerms && response.expandedTerms.length > 0 && (
              <span className="text-space-600">
                +{response.expandedTerms.length} expanded terms
              </span>
            )}
          </div>

          {/* Result List */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {response.results.map((result, i) => {
                const config = TYPE_CONFIG[result.entity.type];
                if (!config) return null;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={result.entity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={config.href(result.entity.slug)}
                      className="glass-card glass-card-hover p-5 block group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-white font-semibold group-hover:text-accent-blue transition-colors truncate">
                              {result.entity.name}
                            </h3>
                            <span className={`badge text-[8px] ${config.color} opacity-70`}>
                              {result.entity.type}
                            </span>
                            {/* Relevance score */}
                            <span className="text-[9px] font-mono text-space-600 ml-auto shrink-0">
                              {(result.score * 100).toFixed(0)}%
                            </span>
                          </div>
                          {result.entity.description && (
                            <p className="text-sm text-space-400 line-clamp-2 leading-relaxed">
                              {result.entity.description.substring(0, 200)}
                              {result.entity.description.length > 200 ? '...' : ''}
                            </p>
                          )}
                          {/* Match type indicator */}
                          <div className="flex items-center gap-2 mt-2">
                            {result.matchType === 'semantic' && (
                              <span className="text-[8px] font-micro text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded-full">
                                Semantic Match
                              </span>
                            )}
                            {result.matchType === 'keyword' && (
                              <span className="text-[8px] font-micro text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">
                                Keyword Match
                              </span>
                            )}
                            {result.matchType === 'hybrid' && (
                              <span className="text-[8px] font-micro text-accent-blue bg-accent-blue/10 px-2 py-0.5 rounded-full">
                                Hybrid Match
                              </span>
                            )}
                            {result.highlights && result.highlights.length > 0 && (
                              <span className="text-[8px] text-space-600">
                                Matched: {result.highlights.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {response.totalResults === 0 && (
            <div className="text-center py-20 text-space-500">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg mb-2">No results found</p>
              <p className="text-sm text-space-600">
                Try different keywords or switch to a different search mode
              </p>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-accent-blue" />
          <h1 className="text-3xl font-bold text-white">Semantic Search</h1>
        </div>
        <p className="text-space-400 text-sm mb-8">
          AI-powered search that understands meaning, context, and intent — not just keywords
        </p>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-accent-blue" />
              <span className="text-space-400">Initializing search...</span>
            </div>
          }
        >
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
