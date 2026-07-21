"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";
import { createLogger } from "@/lib/logger";

const log = createLogger("SpaceNews");

interface NewsArticle {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
}

export default function SpaceNewsSection() {
  const [liveNews, setLiveNews] = useState<NewsArticle[]>([]);

  useEffect(() => {
    fetch("/api/space-news?limit=8")
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setLiveNews(data.results.slice(0, 8));
      })
      .catch((err: unknown) => {
        log.error("Failed to fetch space news", {
          error: err instanceof Error ? err.message : String(err),
        });
      });
  }, []);

  if (liveNews.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {liveNews.map((article, i) => (
        <motion.a
          key={article.id}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.07 }}
          className="glass-card glass-card-hover group flex flex-col h-full overflow-hidden cursor-pointer"
        >
          {/* Image */}
          <div className="relative h-44 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent z-10" />
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              unoptimized={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-3 left-3 z-20">
              <span className="badge badge-active bg-black/60 backdrop-blur-md border-white/10 text-[9px]">
                {article.news_site}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-micro text-space-400 uppercase tracking-widest">
              <Calendar className="w-3 h-3 text-accent-blue" />
              <span>{new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-accent-blue transition-colors mb-2 leading-snug line-clamp-2">
              {article.title}
            </h3>
            <p className="text-xs text-space-500 line-clamp-2 mb-4 flex-grow">{article.summary}</p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-accent-blue mt-auto">
              Read Article
              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
