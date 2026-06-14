"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Telescope, Image as ImageIcon, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NasaItem {
  data: {
    title: string;
    description: string;
    date_created: string;
    nasa_id: string;
  }[];
  links?: {
    href: string;
  }[];
}

interface NasaSearchFallbackProps {
  query: string;
  backLink: string;
  backText: string;
}

export default function NasaSearchFallback({ query, backLink, backText }: NasaSearchFallbackProps) {
  const [results, setResults] = useState<NasaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace hyphens with spaces for better search query
    const searchQuery = query.replace(/-/g, " ");
    
    fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(searchQuery)}&media_type=image`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.collection?.items) {
          // Get top 6 results
          setResults(data.collection.items.slice(0, 6));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [query]);

  const displayQuery = query.replace(/-/g, " ").toUpperCase();

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Link href={backLink} className="inline-flex items-center gap-2 text-space-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {backText}
        </Link>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-display text-white mb-4">
            Searching NASA Archives for <span className="gradient-text">"{displayQuery}"</span>
          </h1>
          <p className="text-space-300 max-w-2xl mx-auto">
            This item isn't in our local database yet, but we've automatically connected to the live NASA Image and Video Library to see what we can find.
          </p>
        </div>

        {loading ? (
          <div className="w-full flex justify-center py-20">
            <div className="w-10 h-10 rounded-full border-t-2 border-accent-blue animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((item, i) => {
              const info = item.data?.[0];
              const imageUrl = item.links?.[0]?.href;
              
              if (!info || !imageUrl) return null;

              return (
                <motion.div 
                  key={info.nasa_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group"
                >
                  <div className="h-64 relative overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={info.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full p-2">
                      <ImageIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 text-xs text-space-400 font-micro mb-3">
                      <Telescope className="w-3 h-3" />
                      NASA ARCHIVE • {new Date(info.date_created).getFullYear()}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 line-clamp-2">{info.title}</h3>
                    <p className="text-space-300 text-sm line-clamp-4 flex-grow">
                      {info.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl max-w-2xl mx-auto">
            <Telescope className="w-16 h-16 text-space-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Archives Found</h2>
            <p className="text-space-400">We couldn't find any data for "{displayQuery}" in the local database or the live NASA archives.</p>
          </div>
        )}
      </div>
    </div>
  );
}
