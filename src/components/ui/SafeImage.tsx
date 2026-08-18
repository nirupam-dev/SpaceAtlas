"use client";

import React, { useState, useEffect, useCallback } from "react";

const FALLBACK_SPACE_IMAGES = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop", // Earth space
  "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=1200&auto=format&fit=crop", // Rocket launch
  "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1200&auto=format&fit=crop", // ISS / Satellite
  "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1200&auto=format&fit=crop", // Deep space nebula
  "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=1200&auto=format&fit=crop", // Launch night
  "https://images.unsplash.com/photo-1447433589675-4aaa569f3e05?q=80&w=1200&auto=format&fit=crop", // Telescope galaxy
];

export function getFallbackImage(seed?: string): string {
  if (!seed) return FALLBACK_SPACE_IMAGES[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_SPACE_IMAGES.length;
  return FALLBACK_SPACE_IMAGES[index];
}

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  fallbackSeed?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
}

export default function SafeImage({
  src,
  alt,
  className = "",
  fill = false,
  fallbackSeed,
  fallbackSrc,
  onLoad,
}: SafeImageProps) {
  const initialSrc = src || fallbackSrc || getFallbackImage(fallbackSeed || alt);
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);
  const [loaded, setLoaded] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setImgSrc(src || fallbackSrc || getFallbackImage(fallbackSeed || alt));
    setErrorCount(0);
  }, [src, fallbackSrc, fallbackSeed, alt]);

  const handleError = useCallback(() => {
    if (errorCount < 2) {
      setErrorCount((prev) => prev + 1);
      const fallback = fallbackSrc || getFallbackImage(fallbackSeed || alt || String(Date.now()));
      setImgSrc(fallback);
    }
  }, [errorCount, fallbackSrc, fallbackSeed, alt]);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  const fillStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
    : {};

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      onLoad={handleLoad}
      style={fillStyle}
      className={`${className} ${loaded ? "opacity-100" : "opacity-90"} transition-opacity duration-300`}
    />
  );
}
