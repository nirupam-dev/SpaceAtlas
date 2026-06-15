"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

// ─── SectionHeading ───────────────────────────────────────────────────────────

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}

export function SectionHeading({ badge, title, subtitle, center = true }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${center ? "text-center" : ""}`}
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-micro mb-4 uppercase tracking-widest rounded-full bg-[#38bdf8]/5">
          {badge}
        </span>
      )}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-display gradient-text pb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-[#cbd5e1] text-lg max-w-2xl mx-auto font-light tracking-wide">{subtitle}</p>
      )}
    </motion.div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  delay?: number;
  color?: string;
}

export function StatCard({ icon, value, label, delay = 0, color }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-6 text-center border-t border-t-space-500"
    >
      <div className="w-12 h-12 border border-space-500 rounded-sm mx-auto mb-4 flex items-center justify-center">
        {icon}
      </div>
      <div className={`text-3xl font-display mb-1 ${color ? `bg-clip-text text-transparent bg-gradient-to-r ${color}` : 'text-white'}`}>
        {value}
      </div>
      <div className="text-xs font-micro text-space-400">{label}</div>
    </motion.div>
  );
}
