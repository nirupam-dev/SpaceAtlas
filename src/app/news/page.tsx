"use client";

import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";
import { spaceNews } from "@/lib/data";

export default function NewsPage() {
  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <SectionHeading badge="Updates" title="Space News" subtitle="Latest news from the cosmos" />
        <div className="space-y-6">
          {spaceNews.map((news, i) => (
            <motion.div key={news.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass-card glass-card-hover p-8 group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="badge badge-active">{news.category}</span>
                    <span className="text-xs text-space-500">{new Date(news.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-accent-blue transition-colors mb-2">{news.title}</h3>
                  <p className="text-space-400 leading-relaxed">{news.summary}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-space-500">
                    <Newspaper className="w-4 h-4" />
                    <span>Source: {news.source}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
