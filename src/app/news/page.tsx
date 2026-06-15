"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Calendar, Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";

interface Article {
  id: number;
  title: string;
  url: string;
  image_url: string;
  news_site: string;
  summary: string;
  published_at: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/space-news")
      .then((res) => res.json())
      .then((data) => {
        if (data.results) {
          setArticles(data.results);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <SectionHeading badge="Live Feed" title="Space News" subtitle="Real-time updates from across the aerospace industry" />
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-accent-blue animate-spin mb-4" />
            <p className="text-space-400 text-sm font-micro uppercase tracking-widest">Fetching latest transmissions...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <motion.div 
                key={article.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: i * 0.05 }} 
                className="glass-card glass-card-hover group flex flex-col h-full overflow-hidden"
              >
                {/* Image Header */}
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] to-transparent z-10" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={article.image_url} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/hero-bg.jpg';
                    }}
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="badge badge-active bg-black/60 backdrop-blur-md border-white/10">
                      {article.news_site}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3 text-[11px] font-micro text-space-400 uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 text-accent-blue" />
                    <span>{new Date(article.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-white group-hover:text-accent-blue transition-colors mb-3 line-clamp-3">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm text-space-400 leading-relaxed mb-6 line-clamp-3 flex-grow">
                    {article.summary.replace(/\n/g, " ")}
                  </p>
                  
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-accent-blue hover:text-accent-cyan transition-colors"
                  >
                    <Newspaper className="w-4 h-4" />
                    Read Full Article
                    <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
