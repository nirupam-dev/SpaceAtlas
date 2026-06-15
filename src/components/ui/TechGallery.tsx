"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, ImageIcon, ExternalLink, X } from "lucide-react";
import { SectionHeading } from "./Cards";

interface NasaImage {
  title: string;
  description: string;
  nasa_id: string;
  date_created: string;
  center?: string;
  thumb: string;
}

export default function TechGallery({ embedded = false }: { embedded?: boolean }) {
  const [images, setImages] = useState<NasaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("space technology");
  const [searchInput, setSearchInput] = useState("space technology");
  const [selectedImage, setSelectedImage] = useState<NasaImage | null>(null);

  const fetchImages = (q: string) => {
    setLoading(true);
    fetch(`/api/nasa-images?q=${encodeURIComponent(q)}&media_type=image`)
      .then((res) => res.json())
      .then((data) => {
        if (data.collection?.items) {
          const mapped = data.collection.items
            .filter((item: any) => item.links?.[0]?.href)
            .slice(0, 12)
            .map((item: any) => ({
              title: item.data?.[0]?.title || "Untitled",
              description: item.data?.[0]?.description || "",
              nasa_id: item.data?.[0]?.nasa_id || "",
              date_created: item.data?.[0]?.date_created || "",
              center: item.data?.[0]?.center || "",
              thumb: item.links[0].href,
            }));
          setImages(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchImages(query);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(searchInput);
  };

  const quickFilters = [
    "Space Technology",
    "James Webb Telescope",
    "Mars Rover",
    "Spacecraft Engineering",
    "Satellite Technology",
    "Space Station",
    "Rocket Engine",
    "Space Suit",
  ];

  const coreContent = (
    <>

        {/* Search & Quick Filters */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-space-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search NASA imagery..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#0f172a]/80 border border-space-500/40 text-white placeholder:text-space-500 focus:outline-none focus:border-accent-blue/60 backdrop-blur-xl transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-accent-blue to-accent-purple text-white font-micro text-sm uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setSearchInput(filter);
                  setQuery(filter);
                }}
                className={`px-4 py-2 rounded-full text-xs font-micro uppercase tracking-wider transition-all duration-300 ${
                  query === filter
                    ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/40"
                    : "bg-white/5 text-space-400 border border-white/10 hover:border-white/30 hover:text-white"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 rounded-full border-t-2 border-accent-blue animate-spin" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-space-600 mx-auto mb-4" />
            <p className="text-space-400 text-lg">No images found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {images.map((img, i) => (
              <motion.div
                key={img.nasa_id + i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => setSelectedImage(img)}
                className="group relative cursor-pointer rounded-2xl overflow-hidden bg-[#0f172a] border border-space-500/20 hover:border-accent-blue/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.15)]"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.thumb}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-white line-clamp-2 leading-snug mb-2 group-hover:text-accent-blue transition-colors">
                    {img.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] font-micro text-space-500 uppercase tracking-widest">
                    <span>{img.center || "NASA"}</span>
                    <span>{img.date_created ? new Date(img.date_created).getFullYear() : ""}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full glass-card rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-2/3 min-h-[300px] lg:min-h-[500px] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImage.thumb}
                    alt={selectedImage.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="lg:w-1/3 p-8 flex flex-col justify-center">
                  <span className="text-[10px] font-micro text-accent-blue uppercase tracking-[3px] mb-3">
                    {selectedImage.center || "NASA"} · {selectedImage.date_created ? new Date(selectedImage.date_created).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : ""}
                  </span>
                  <h3 className="text-2xl font-display text-white mb-4 leading-tight">{selectedImage.title}</h3>
                  <p className="text-space-300 text-sm leading-relaxed max-h-[250px] overflow-y-auto">
                    {selectedImage.description?.slice(0, 600) || "No description available."}
                    {(selectedImage.description?.length || 0) > 600 ? "..." : ""}
                  </p>
                  <a
                    href={`https://images.nasa.gov/details/${selectedImage.nasa_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-accent-blue text-sm font-micro uppercase tracking-widest hover:underline"
                  >
                    View on NASA <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
    </>
  );

  if (embedded) return coreContent;

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="NASA Image Library"
          title="Space Technology Gallery"
          subtitle="Explore thousands of images from NASA's vast archive"
        />
        {coreContent}
      </div>
    </section>
  );
}
