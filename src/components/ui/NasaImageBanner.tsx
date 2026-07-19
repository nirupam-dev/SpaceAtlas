"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, ExternalLink } from "lucide-react";

interface NasaImage {
  href: string;
  data: {
    title: string;
    description?: string;
    date_created: string;
    nasa_id: string;
    center?: string;
  }[];
  links?: { href: string; rel: string }[];
}

interface Props {
  query: string;
  count?: number;
  title?: string;
  cols?: 3 | 4 | 5 | 6;
}

export default function NasaImageBanner({ query, count = 6, title, cols = 3 }: Props) {
  const [images, setImages] = useState<NasaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NasaImage | null>(null);

  useEffect(() => {
    fetch(`/api/nasa-images?q=${encodeURIComponent(query)}&page=1`)
      .then(r => r.json())
      .then(data => {
        const items = data?.collection?.items || [];
        // Filter to only items with image links
        const withImages = items.filter((item: NasaImage) =>
          item.links?.some((l: { rel: string }) => l.rel === "preview")
        );
        setImages(withImages.slice(0, count));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query, count]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-4 h-4 text-accent-blue" />
          <span className="text-[10px] font-micro text-space-500 uppercase tracking-widest">Loading NASA imagery...</span>
        </div>
        <div className={`grid grid-cols-2 md:grid-cols-${cols} gap-3`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) return null;

  const gridClass = {
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  }[cols];

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-accent-blue" />
          <span className="text-[10px] font-micro text-space-500 uppercase tracking-widest">
            {title || `NASA Imagery · ${query}`}
          </span>
        </div>
        <span className="text-[9px] font-micro text-space-600 uppercase tracking-widest">
          {images.length} images
        </span>
      </div>

      {/* Image Grid */}
      <div className={`grid ${gridClass} gap-3`}>
        {images.map((img, i) => {
          const thumbUrl = img.links?.find(l => l.rel === "preview")?.href;
          const imgTitle = img.data[0]?.title || "";
          const imgDate = img.data[0]?.date_created;
          const center = img.data[0]?.center;

          return (
            <motion.div
              key={img.data[0]?.nasa_id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-accent-blue/30 transition-all duration-300"
              onClick={() => setSelected(selected?.data[0]?.nasa_id === img.data[0]?.nasa_id ? null : img)}
            >
              {thumbUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbUrl}
                  alt={imgTitle}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-[11px] font-medium text-white line-clamp-2 leading-snug">{imgTitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  {center && (
                    <span className="text-[9px] font-micro text-space-400 uppercase tracking-widest">
                      {center}
                    </span>
                  )}
                  {imgDate && (
                    <span className="text-[9px] font-mono text-space-500">
                      {new Date(imgDate).getFullYear()}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Expanded image detail */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 glass-card p-6 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.links?.find(l => l.rel === "preview")?.href || ""}
                alt={selected.data[0]?.title || ""}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-2">{selected.data[0]?.title}</h4>
              <p className="text-xs text-space-400 leading-relaxed line-clamp-6 mb-4">
                {selected.data[0]?.description || "No description available."}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-micro text-space-500 uppercase tracking-widest">
                {selected.data[0]?.center && <span>Center: {selected.data[0].center}</span>}
                {selected.data[0]?.date_created && (
                  <span>{new Date(selected.data[0].date_created).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
