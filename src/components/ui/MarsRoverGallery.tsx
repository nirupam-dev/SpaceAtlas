"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, ImageIcon, Telescope } from "lucide-react";
import Image from "next/image";
import { createLogger } from "@/lib/logger";

const log = createLogger("MarsRoverGallery");

interface NasaImageItem {
  data: {
    title: string;
    description: string;
    date_created: string;
    nasa_id: string;
    photographer?: string;
    location?: string;
  }[];
  links?: { href: string }[];
}

interface MarsPhoto {
  id: string;
  title: string;
  description: string;
  date: string;
  img_src: string;
  rover: string;
  keyword: string;
}

const KEYWORD_PRESETS: Record<string, { label: string; query: string; color: string }[]> = {
  curiosity: [
    { label: "Gale Crater",    query: "Curiosity rover Gale Crater Mars",         color: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
    { label: "Mount Sharp",    query: "Curiosity rover Mount Sharp Mars surface",   color: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
    { label: "Self-Portrait",  query: "Curiosity rover selfie self-portrait Mars",  color: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
    { label: "Rock Samples",   query: "Curiosity rover rock drill sample Mars",     color: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
    { label: "Panorama",       query: "Curiosity rover panorama Mars landscape",    color: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
    { label: "Wheels",         query: "Curiosity rover wheels tracks Mars",         color: "bg-orange-500/10 text-orange-300 border-orange-500/30" },
  ],
  opportunity: [
    { label: "Meridiani",      query: "Opportunity rover Meridiani Planum Mars",   color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
    { label: "Endurance",      query: "Opportunity rover Endurance Crater Mars",   color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
    { label: "Heat Shield",    query: "Opportunity rover heat shield Mars",         color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
    { label: "Spherules",      query: "Opportunity rover blueberries spherules Mars", color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
    { label: "Tracks",         query: "Opportunity rover tracks panorama Mars",    color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
    { label: "Victoria",       query: "Opportunity rover Victoria Crater Mars",    color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
  ],
  spirit: [
    { label: "Columbia Hills", query: "Spirit rover Columbia Hills Mars",           color: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
    { label: "Gusev Crater",   query: "Spirit rover Gusev Crater Mars surface",    color: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
    { label: "Dust Devils",    query: "Spirit rover dust devil Mars",               color: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
    { label: "Sunset",         query: "Spirit rover Mars sunset sky",               color: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
    { label: "Rocks",          query: "Spirit rover rock outcrop Mars geology",     color: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
    { label: "Panorama",       query: "Spirit rover panorama Mars landscape",       color: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
  ],
};

const ROVER_CONFIG = {
  curiosity:   { label: "Curiosity",   activeColor: "text-orange-400 border-orange-500/40 bg-orange-500/10", accent: "text-orange-400" },
  opportunity: { label: "Opportunity", activeColor: "text-sky-400 border-sky-500/40 bg-sky-500/10",          accent: "text-sky-400" },
  spirit:      { label: "Spirit",      activeColor: "text-rose-400 border-rose-500/40 bg-rose-500/10",       accent: "text-rose-400" },
};

export default function MarsRoverGallery() {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rover, setRover] = useState<"curiosity" | "opportunity" | "spirit">("curiosity");
  const [activePreset, setActivePreset] = useState(0);
  const [selected, setSelected] = useState<MarsPhoto | null>(null);
  const [error, setError] = useState(false);

  const presets = KEYWORD_PRESETS[rover];
  const currentPreset = presets[activePreset];

  useEffect(() => {
    setLoading(true);
    setError(false);

    const encoded = encodeURIComponent(currentPreset.query);
    fetch(`https://images-api.nasa.gov/search?q=${encoded}&media_type=image&page_size=20`)
      .then((res) => res.json())
      .then((data) => {
        const items: NasaImageItem[] = data?.collection?.items ?? [];
        const mapped: MarsPhoto[] = items
          .filter((item) => item.links?.[0]?.href && item.data?.[0])
          .slice(0, 20)
          .map((item) => ({
            id: item.data[0].nasa_id,
            title: item.data[0].title,
            description: item.data[0].description ?? "",
            date: item.data[0].date_created,
            img_src: item.links![0].href.replace(/^http:/, "https:").replace(/ /g, "%20"),
            rover: rover,
            keyword: currentPreset.label,
          }));
        if (mapped.length === 0) setError(true);
        setPhotos(mapped);
        setLoading(false);
      })
      .catch((err: unknown) => {
        log.error("Failed to fetch Mars rover images", {
          rover,
          preset: currentPreset.label,
          error: err instanceof Error ? err.message : String(err),
        });
        setError(true);
        setLoading(false);
      });
  }, [rover, activePreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const accentClass = ROVER_CONFIG[rover].accent;

  return (
    <div className="space-y-8">
      {/* Rover Selector */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center gap-3">
          {(Object.keys(ROVER_CONFIG) as (keyof typeof ROVER_CONFIG)[]).map((r) => (
            <button
              key={r}
              onClick={() => { setRover(r); setActivePreset(0); }}
              className={`px-6 py-3 rounded-full text-xs font-micro uppercase tracking-widest border transition-all duration-300 ${
                rover === r
                  ? ROVER_CONFIG[r].activeColor
                  : "bg-white/5 text-space-400 border-white/10 hover:border-white/30"
              }`}
            >
              {ROVER_CONFIG[r].label}
            </button>
          ))}
        </div>

        {/* Keyword Presets */}
        <div className="flex flex-wrap justify-center gap-2">
          {presets.map((p, i) => (
            <button
              key={p.label}
              onClick={() => setActivePreset(i)}
              className={`px-4 py-2 rounded-full text-[10px] font-micro uppercase tracking-wider border transition-all duration-300 ${
                activePreset === i
                  ? p.color
                  : "bg-transparent text-space-500 border-space-700 hover:text-white hover:border-white/20"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-orange-400 animate-spin mb-4" />
          <p className="text-space-400 text-sm font-micro uppercase tracking-widest">
            Scanning NASA archives…
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-20 max-w-2xl mx-auto glass-card border-orange-500/20 p-8">
          <ImageIcon className="w-16 h-16 text-orange-500/40 mx-auto mb-6" />
          <h3 className="text-xl font-display text-white mb-3">No Results Found</h3>
          <p className="text-space-400 text-sm leading-relaxed">
            No images matched this search. Try a different keyword category above.
          </p>
        </div>
      ) : (
        <>
          <p className="text-center text-space-400 text-sm">
            Showing{" "}
            <span className="text-white font-semibold">{photos.length}</span> archival images
            from <span className={`font-semibold capitalize ${accentClass}`}>{ROVER_CONFIG[rover].label}</span>
            {" "}· <span className="text-white">{currentPreset.label}</span>
            {" "}· via NASA Image Library
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                onClick={() => setSelected(photo)}
                className="group relative cursor-pointer rounded-xl overflow-hidden border border-space-500/20 hover:border-orange-500/40 transition-all duration-300 aspect-square"
              >
                                <Image
                  src={photo.img_src}
                  alt={photo.title}
                  fill className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[9px] font-micro text-orange-300 uppercase tracking-widest line-clamp-1">
                    {photo.title}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
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
                                    <Image
                    src={selected.img_src}
                    alt={selected.title}
                    fill className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                </div>
                <div className="lg:w-1/3 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Camera className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-micro text-xs uppercase tracking-[3px]">
                      NASA Archive
                    </span>
                  </div>
                  <h3 className="text-xl font-display text-white mb-4 leading-tight line-clamp-3">
                    {selected.title}
                  </h3>
                  <p className="text-space-400 text-sm leading-relaxed line-clamp-5 mb-4">
                    {selected.description || "No description available."}
                  </p>
                  <div className="space-y-3 text-sm border-t border-white/10 pt-4">
                    <div className="flex justify-between">
                      <span className="text-space-500">Rover</span>
                      <span className="text-white capitalize">{selected.rover}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-space-500">Category</span>
                      <span className="text-white">{selected.keyword}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-space-500">Date</span>
                      <span className="text-white">
                        {selected.date ? new Date(selected.date).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-space-500">Source</span>
                      <span className="text-orange-400 flex items-center gap-1">
                        <Telescope className="w-3 h-3" /> NASA Image Library
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
