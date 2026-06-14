"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const planets = [
  { name: "Mercury", slug: "mercury",  color: "#b5b5b5", size: 5,  orbit: 70,  duration: 4,   glow: "rgba(181,181,181,0.5)" },
  { name: "Venus",   slug: "venus",    color: "#e8c97e", size: 8,  orbit: 105, duration: 10,  glow: "rgba(232,201,126,0.5)" },
  { name: "Earth",   slug: "earth",    color: "#4da6ff", size: 9,  orbit: 145, duration: 16,  glow: "rgba(77,166,255,0.5)" },
  { name: "Mars",    slug: "mars",     color: "#e05a2b", size: 7,  orbit: 185, duration: 30,  glow: "rgba(224,90,43,0.5)" },
  { name: "Jupiter", slug: "jupiter",  color: "#c88b3a", size: 18, orbit: 240, duration: 60,  glow: "rgba(200,139,58,0.5)" },
  { name: "Saturn",  slug: "saturn",   color: "#e4d191", size: 15, orbit: 295, duration: 100, glow: "rgba(228,209,145,0.5)", hasRings: true },
  { name: "Uranus",  slug: "uranus",   color: "#7de8e8", size: 12, orbit: 345, duration: 140, glow: "rgba(125,232,232,0.5)" },
  { name: "Neptune", slug: "neptune",  color: "#3f54ba", size: 11, orbit: 388, duration: 180, glow: "rgba(63,84,186,0.5)" },
];

export default function SolarSystemOrrery() {
  const size = 820; // total container px (scaled with CSS)
  const center = size / 2;

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 border border-[#38bdf8]/30 text-[#38bdf8] text-xs font-micro mb-4 uppercase tracking-widest rounded-full bg-[#38bdf8]/5">
            Live Orrery
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display gradient-text pb-2">
            Interactive Solar System
          </h2>
          <p className="mt-4 text-[#cbd5e1] text-lg max-w-2xl mx-auto font-light tracking-wide">
            Orbital periods scaled for visualization. Click any planet to explore.
          </p>
        </motion.div>

        <div className="flex items-center justify-center">
          <div
            className="relative"
            style={{ width: size, height: size, maxWidth: "100%", aspectRatio: "1 / 1" }}
          >
            {/* Orbit rings */}
            {planets.map((p) => (
              <div
                key={`orbit-${p.name}`}
                className="absolute rounded-full border border-white/5"
                style={{
                  width:  p.orbit * 2,
                  height: p.orbit * 2,
                  top:    center - p.orbit,
                  left:   center - p.orbit,
                }}
              />
            ))}

            {/* Sun */}
            <div
              className="absolute rounded-full"
              style={{
                width:  50,
                height: 50,
                top:    center - 25,
                left:   center - 25,
                background: "radial-gradient(circle, #fff7c0 0%, #ffb347 40%, #ff6600 80%, transparent 100%)",
                boxShadow: "0 0 60px 20px rgba(255,160,0,0.5), 0 0 120px 60px rgba(255,100,0,0.2)",
                zIndex: 10,
              }}
            />

            {/* Planets */}
            {planets.map((p) => (
              <div
                key={p.name}
                className="absolute"
                style={{
                  width:  p.orbit * 2,
                  height: p.orbit * 2,
                  top:    center - p.orbit,
                  left:   center - p.orbit,
                  animation: `spin ${p.duration}s linear infinite`,
                }}
              >
                <Link
                  href={`/solar-system/${p.slug}`}
                  className="group absolute"
                  style={{
                    top:  -p.size,
                    left: p.orbit - p.size,
                    width:  p.size * 2,
                    height: p.size * 2,
                  }}
                  title={p.name}
                >
                  {/* Planet body */}
                  <div
                    className="rounded-full w-full h-full transition-transform duration-300 group-hover:scale-150"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, white 0%, ${p.color} 40%, ${p.color}99 100%)`,
                      boxShadow: `0 0 12px 4px ${p.glow}`,
                    }}
                  />

                  {/* Saturn rings */}
                  {p.hasRings && (
                    <div
                      className="absolute rounded-full border-2"
                      style={{
                        width:  p.size * 3.5,
                        height: p.size * 1.1,
                        top:    "50%",
                        left:   "50%",
                        transform: "translate(-50%, -50%) rotateX(70deg)",
                        borderColor: `${p.color}66`,
                      }}
                    />
                  )}

                  {/* Label — counter-rotates so it stays upright */}
                  <div
                    className="absolute left-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      top: p.size * 2 + 4,
                      transform: "translateX(-50%)",
                      animation: `spin-reverse ${p.duration}s linear infinite`,
                    }}
                  >
                    <span
                      className="text-[10px] font-micro text-white whitespace-nowrap px-2 py-0.5 rounded"
                      style={{ background: "rgba(2,6,23,0.85)", border: `1px solid ${p.color}55` }}
                    >
                      {p.name.toUpperCase()}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: translateX(-50%) rotate(0deg); }
          to   { transform: translateX(-50%) rotate(-360deg); }
        }
      `}</style>
    </section>
  );
}
