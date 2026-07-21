"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

// ─── Hero Image with animated entrance and fallback ────────────
export function HeroImage({ src, alt }: { src: string; alt: string }) {
  return (
    <motion.img
      initial={{ scale: 1.1, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.6 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      src={src || "/placeholder.jpg"}
      alt={alt}
      className="w-full h-full object-cover"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}

// ─── Scroll-triggered content reveal ───────────────────────────
export function ScrollReveal({
  children,
  className,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "right";
}) {
  const initial = direction === "right"
    ? { opacity: 0, x: 20 }
    : { opacity: 0, y: 20 };
  const animate = direction === "right"
    ? { opacity: 1, x: 0 }
    : { opacity: 1, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
