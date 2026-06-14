"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Telescope } from "lucide-react";
import { SectionHeading } from "./Cards";

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl: string;
  media_type: string;
  date: string;
}

export default function NasaApod() {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/apod")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setApod(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="w-8 h-8 rounded-full border-t-2 border-space-500 animate-spin" />
      </div>
    );
  }

  if (!apod) return null;

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          badge="NASA API"
          title="Astronomy Picture of the Day"
          subtitle="Live image pulled directly from NASA's official database"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 relative min-h-[400px]">
              {apod.media_type === "image" ? (
                <img 
                  src={apod.hdurl || apod.url} 
                  alt={apod.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <iframe
                  src={apod.url}
                  title={apod.title}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                />
              )}
            </div>
            <div className="lg:w-1/2 p-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Telescope className="w-6 h-6 text-space-400" />
                <span className="text-space-300 font-micro uppercase tracking-widest">{apod.date}</span>
              </div>
              <h3 className="text-3xl font-display text-white mb-6 leading-tight">{apod.title}</h3>
              <p className="text-space-200 leading-relaxed max-h-[300px] overflow-y-auto custom-scrollbar">
                {apod.explanation}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
