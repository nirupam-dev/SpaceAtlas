/**
 * ─── HeroBanner ─────────────────────────────────────────────────
 *
 * Reusable hero banner with background image, gradient overlays,
 * badge, title, and description. Replaces duplicated hero markup
 * across all observatory tab components.
 */

import type { LucideIcon } from "lucide-react";
import Image from "next/image";

interface HeroBannerProps {
  imageSrc: string;
  imageAlt: string;
  badge: {
    icon: LucideIcon;
    text: string;
    colorClasses: string;
  };
  title: string;
  description: string;
  /** Optional top-right overlay content */
  topRight?: React.ReactNode;
}

export default function HeroBanner({
  imageSrc,
  imageAlt,
  badge,
  title,
  description,
  topRight,
}: HeroBannerProps) {
  const BadgeIcon = badge.icon;

  return (
    <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/80 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 p-8">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-micro uppercase tracking-widest border mb-3 ${badge.colorClasses}`}
        >
          <BadgeIcon className="w-3 h-3" />
          {badge.text}
        </span>
        <h3 className="text-2xl md:text-3xl font-display text-white tracking-widest">
          {title}
        </h3>
        <p className="text-space-400 text-sm mt-1 max-w-md">{description}</p>
      </div>
      {topRight && (
        <div className="absolute top-6 right-6">{topRight}</div>
      )}
    </div>
  );
}
