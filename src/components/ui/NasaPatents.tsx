"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Code2, Zap, ExternalLink, Loader2 } from "lucide-react";

interface TechItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
}

export default function NasaPatents() {
  const [items, setItems] = useState<TechItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"patent" | "software" | "spinoff">("patent");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nasa-tech?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          const mapped = data.results.slice(0, 12).map((item: string[], idx: number) => {
            // NASA TechTransfer returns arrays: [id, patentNum, title, desc, ...]
            return {
              id: item[0] || `${category}-${idx}`,
              title: item[2] || "Untitled",
              description: item[3] || "",
              category: category,
              imageUrl: item[10] || undefined,
            };
          });
          setItems(mapped);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  const categories = [
    { id: "patent" as const, label: "Patents", icon: FileText, color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
    { id: "software" as const, label: "Software", icon: Code2, color: "text-violet-400 border-violet-500/40 bg-violet-500/10" },
    { id: "spinoff" as const, label: "Spinoffs", icon: Zap, color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10" },
  ];

  const activeColor = categories.find((c) => c.id === category)?.color || "";

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-micro uppercase tracking-widest border transition-all duration-300 ${
              category === cat.id
                ? cat.color
                : "bg-white/5 text-space-400 border-white/10 hover:border-white/30"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-accent-blue animate-spin mb-4" />
          <p className="text-space-400 text-sm font-micro uppercase tracking-widest">
            Fetching NASA {category}s...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-space-600 mx-auto mb-4" />
          <p className="text-space-400 text-lg">No {category}s found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-card glass-card-hover p-6 group flex flex-col"
            >
              {/* Image if available */}
              {item.imageUrl && (
                <div className="relative h-40 -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
                </div>
              )}

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-micro uppercase tracking-widest w-fit mb-4 border ${activeColor}`}>
                {category === "patent" && <FileText className="w-3 h-3" />}
                {category === "software" && <Code2 className="w-3 h-3" />}
                {category === "spinoff" && <Zap className="w-3 h-3" />}
                {category}
              </span>

              <h4 className="text-base font-semibold text-white mb-3 line-clamp-2 group-hover:text-accent-blue transition-colors leading-snug">
                {item.title}
              </h4>

              <p className="text-sm text-space-400 line-clamp-4 leading-relaxed flex-grow">
                {item.description?.replace(/<[^>]*>/g, "").slice(0, 250) || "No description available."}
                {(item.description?.length || 0) > 250 ? "..." : ""}
              </p>

              <div className="mt-5 pt-4 border-t border-space-700 flex items-center justify-between">
                <span className="text-[10px] font-micro text-space-500 uppercase tracking-widest">
                  NASA Tech Transfer
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-space-600 group-hover:text-accent-blue transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
