"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  children?: ReactNode;
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

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  color?: string;
  delay?: number;
}

export function StatCard({ icon, value, label, delay = 0 }: StatCardProps) {
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
      <div className="text-3xl font-display text-white mb-1">{value}</div>
      <div className="text-xs font-micro text-space-400">{label}</div>
    </motion.div>
  );
}

interface EntityCardProps {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  icon?: ReactNode;
  stats?: { label: string; value: string }[];
  delay?: number;
}

export function EntityCard({ href, title, subtitle, badge, badgeColor = "badge-active", icon, stats, delay = 0 }: EntityCardProps) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="glass-card glass-card-hover p-6 block group border-t border-t-space-500"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-sm flex items-center justify-center border border-space-500">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-display text-white group-hover:text-space-300 transition-colors">{title}</h3>
            <p className="text-sm text-space-400 font-micro">{subtitle}</p>
          </div>
        </div>
        {badge && <span className={`badge ${badgeColor}`}>{badge}</span>}
      </div>
      <p className="text-sm text-space-400 line-clamp-2 mb-4">{subtitle}</p>
      {stats && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-space-500">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-xs font-micro text-space-400">{stat.label}</div>
              <div className="text-sm font-medium text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </motion.a>
  );
}
