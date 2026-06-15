"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface EpicImage {
  identifier: string;
  caption: string;
  image: string;
  date: string;
  centroid_coordinates: { lat: number; lon: number };
}

export default function EpicEarth() {
  const [images, setImages] = useState<EpicImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [collection, setCollection] = useState<"natural" | "enhanced">("natural");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nasa-epic?collection=${collection}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setImages(data.slice(0, 12));
          setCurrentIdx(0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [collection]);

  const getEpicImageUrl = (img: EpicImage) => {
    const dateStr = img.date.split(" ")[0];
    const [year, month, day] = dateStr.split("-");
    const type = collection === "enhanced" ? "enhanced" : "natural";
    return `https://epic.gsfc.nasa.gov/archive/${type}/${year}/${month}/${day}/png/${img.image}.png`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-accent-blue animate-spin mb-4" />
        <p className="text-space-400 text-sm font-micro uppercase tracking-widest">Loading Earth imagery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-20">
        <Globe2 className="w-16 h-16 text-space-600 mx-auto mb-4" />
        <p className="text-space-400 text-lg">No Earth images available right now.</p>
      </div>
    );
  }

  const current = images[currentIdx];

  return (
    <div className="space-y-8">
      {/* Collection Toggle */}
      <div className="flex justify-center gap-3">
        {(["natural", "enhanced"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCollection(c)}
            className={`px-6 py-3 rounded-full text-xs font-micro uppercase tracking-widest transition-all duration-300 ${
              collection === c
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-white/5 text-space-400 border border-white/10 hover:border-white/30"
            }`}
          >
            {c === "natural" ? "🌍 Natural Color" : "✨ Enhanced Color"}
          </button>
        ))}
      </div>

      {/* Main Viewer */}
      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Image */}
          <div className="lg:w-2/3 relative min-h-[400px] lg:min-h-[550px] bg-black">
            <AnimatePresence mode="wait">
              <motion.img
                key={current.identifier}
                src={getEpicImageUrl(current)}
                alt={current.caption}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            </AnimatePresence>
            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentIdx((p) => (p - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIdx((p) => (p + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-white text-xs font-micro tracking-widest">
              {currentIdx + 1} / {images.length}
            </div>
          </div>

          {/* Details */}
          <div className="lg:w-1/3 p-8 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <Globe2 className="w-6 h-6 text-emerald-400" />
              <span className="text-emerald-400 font-micro text-xs uppercase tracking-[3px]">
                DSCOVR/EPIC
              </span>
            </div>
            <h3 className="text-2xl font-display text-white mb-4 leading-tight">
              Earth from L1
            </h3>
            <p className="text-space-300 text-sm leading-relaxed mb-6">
              {current.caption || "Full-disc image of Earth captured by NASA's EPIC camera aboard the DSCOVR spacecraft at Lagrange Point 1, approximately 1.5 million km from Earth."}
            </p>
            <div className="space-y-3 pt-4 border-t border-space-700">
              <div className="flex justify-between text-sm">
                <span className="text-space-500">Date</span>
                <span className="text-white">{new Date(current.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-space-500">Latitude</span>
                <span className="text-white">{current.centroid_coordinates?.lat?.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-space-500">Longitude</span>
                <span className="text-white">{current.centroid_coordinates?.lon?.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-space-500">Type</span>
                <span className="text-white capitalize">{collection}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, i) => (
          <button
            key={img.identifier}
            onClick={() => setCurrentIdx(i)}
            className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              i === currentIdx
                ? "border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                : "border-transparent opacity-50 hover:opacity-80"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getEpicImageUrl(img)}
              alt={`Earth ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
