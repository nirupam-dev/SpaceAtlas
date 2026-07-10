"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, Image as ImageIcon, X, Loader2, ExternalLink } from "lucide-react";

interface NasaImageItem {
  data: {
    title: string;
    description: string;
    date_created: string;
    nasa_id: string;
  }[];
  links?: { href: string }[];
}

interface InlineNasaSearchProps {
  query: string;
  /** Icon component to show in the header */
  icon?: React.ReactNode;
  /** Category label like "rockets", "missions" */
  category?: string;
}

export default function InlineNasaSearch({ query, icon, category = "items" }: InlineNasaSearchProps) {
  const [results, setResults] = useState<NasaImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NasaImageItem | null>(null);

  // Map each category to contextual keywords appended to the search
  const CATEGORY_CONTEXT: Record<string, string> = {
    rockets: "rocket launch vehicle spacecraft",
    missions: "space mission exploration",
    astronauts: "astronaut cosmonaut crew spaceflight",
    agencies: "space agency program",
  };

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const userQuery = query.replace(/-/g, " ");
    const context = CATEGORY_CONTEXT[category] || "";
    const searchQuery = context ? `${userQuery} ${context}` : userQuery;

    fetch(
      `https://images-api.nasa.gov/search?q=${encodeURIComponent(searchQuery)}&media_type=image&page_size=12`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.collection?.items) {
          setResults(
            data.collection.items
              .filter((item: NasaImageItem) => item.links?.[0]?.href && item.data?.[0])
              .slice(0, 12)
          );
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [query, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayQuery = query.replace(/-/g, " ");

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-accent-blue animate-spin mb-4" />
          <p className="text-space-400 text-xs font-micro uppercase tracking-widest">
            Searching NASA archives for &quot;{displayQuery}&quot;…
          </p>
        </div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-8"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent-blue/5 border border-accent-blue/20">
          <Telescope className="w-3.5 h-3.5 text-accent-blue" />
          <span className="text-[10px] font-micro uppercase tracking-[2px] text-accent-blue">
            NASA Archives · {results.length} results
          </span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-blue/30 to-transparent" />
      </div>

      <p className="text-center text-space-400 text-sm mb-8">
        No local {category} matched <span className="text-white font-medium">&quot;{displayQuery}&quot;</span>
        {" "}— here&apos;s what we found in the NASA Image &amp; Video Library:
      </p>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item, i) => {
          const info = item.data[0];
          const imageUrl = item.links?.[0]?.href;
          if (!info || !imageUrl) return null;

          return (
            <motion.div
              key={info.nasa_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              onClick={() => setSelected(item)}
              className="group relative flex flex-col h-full bg-[#0f172a]/40 border border-space-500/30 backdrop-blur-xl rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)] hover:border-accent-blue/40 cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-[220px] w-full overflow-hidden bg-black shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={info.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-all duration-700 opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 rounded-full text-[10px] font-micro tracking-widest bg-accent-blue/20 border border-accent-blue/30 text-accent-blue backdrop-blur-md">
                    NASA ARCHIVE
                  </span>
                </div>
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="text-[18px] font-display text-white group-hover:text-[#38bdf8] transition-colors leading-tight drop-shadow-lg line-clamp-2">
                    {info.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-[#0f172a] to-black">
                <p className="text-[13px] font-light text-[#cbd5e1] line-clamp-3 leading-relaxed mb-4">
                  {info.description || "No description available."}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-space-500/30 mt-auto text-[10px] font-micro uppercase tracking-wider">
                  <span className="text-accent-blue flex items-center gap-1">
                    <Telescope className="w-3 h-3" />
                    NASA
                  </span>
                  <span className="text-space-500">
                    {info.date_created ? new Date(info.date_created).getFullYear() : "—"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && selected.data?.[0] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full glass-card rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-2/3 relative min-h-[300px] lg:min-h-[500px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.links?.[0]?.href || ""}
                    alt={selected.data[0].title}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                </div>
                <div className="lg:w-1/3 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Telescope className="w-5 h-5 text-accent-blue" />
                    <span className="text-accent-blue font-micro text-xs uppercase tracking-[3px]">
                      NASA Archive
                    </span>
                  </div>
                  <h3 className="text-xl font-display text-white mb-4 leading-tight">
                    {selected.data[0].title}
                  </h3>
                  <p className="text-space-400 text-sm leading-relaxed mb-6 max-h-[200px] overflow-y-auto pr-2">
                    {selected.data[0].description || "No description available."}
                  </p>
                  <div className="space-y-3 text-sm border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-space-500">Date</span>
                      <span className="text-white">
                        {selected.data[0].date_created
                          ? new Date(selected.data[0].date_created).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-space-500">NASA ID</span>
                      <span className="text-white text-xs">{selected.data[0].nasa_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-space-500">Source</span>
                      <span className="text-accent-blue flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> NASA Image Library
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
