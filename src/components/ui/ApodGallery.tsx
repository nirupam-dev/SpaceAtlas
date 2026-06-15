"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Telescope, X, Loader2, ImageIcon } from "lucide-react";

interface ApodItem {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  date: string;
  copyright?: string;
}

export default function ApodGallery() {
  const [items, setItems] = useState<ApodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApodItem | null>(null);

  useEffect(() => {
    fetch("/api/apod-gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter to images only and reverse for newest first
          setItems(data.filter((d: ApodItem) => d.media_type === "image").reverse());
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-accent-amber animate-spin mb-4" />
        <p className="text-space-400 text-sm font-micro uppercase tracking-widest">Loading APOD gallery...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <ImageIcon className="w-16 h-16 text-space-600 mx-auto mb-4" />
        <p className="text-space-400 text-lg">No APOD images available.</p>
      </div>
    );
  }

  return (
    <>
      {/* Masonry-style Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {items.map((item, i) => (
          <motion.div
            key={item.date}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            onClick={() => setSelected(item)}
            className="break-inside-avoid group relative cursor-pointer rounded-2xl overflow-hidden border border-space-500/20 hover:border-accent-amber/40 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(251,191,36,0.15)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.title}
              className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm font-semibold line-clamp-2">{item.title}</p>
              <p className="text-space-300 text-xs mt-1">{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
            </div>
          </motion.div>
        ))}
      </div>

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
              className="relative max-w-6xl w-full glass-card rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
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
                    src={selected.hdurl || selected.url}
                    alt={selected.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="lg:w-1/3 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Telescope className="w-5 h-5 text-accent-amber" />
                    <span className="text-accent-amber font-micro text-xs uppercase tracking-[3px]">
                      {new Date(selected.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display text-white mb-4 leading-tight">{selected.title}</h3>
                  <p className="text-space-300 text-sm leading-relaxed max-h-[250px] overflow-y-auto">
                    {selected.explanation}
                  </p>
                  {selected.copyright && (
                    <p className="text-space-500 text-xs mt-4">© {selected.copyright}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
