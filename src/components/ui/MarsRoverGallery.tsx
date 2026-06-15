"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Loader2, ImageIcon } from "lucide-react";

interface MarsPhoto {
  id: number;
  sol: number;
  img_src: string;
  earth_date: string;
  camera: {
    name: string;
    full_name: string;
  };
  rover: {
    name: string;
    status: string;
  };
}

export default function MarsRoverGallery() {
  const [photos, setPhotos] = useState<MarsPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rover, setRover] = useState("curiosity");
  const [sol, setSol] = useState("1000");
  const [selected, setSelected] = useState<MarsPhoto | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nasa-mars?rover=${rover}&sol=${sol}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.photos) {
          setPhotos(data.photos.slice(0, 20));
        } else {
          setPhotos([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [rover, sol]);

  const rovers = [
    { id: "curiosity", label: "Curiosity", defaultSol: "1000", color: "text-orange-400 border-orange-500/40 bg-orange-500/10" },
    { id: "opportunity", label: "Opportunity", defaultSol: "500", color: "text-sky-400 border-sky-500/40 bg-sky-500/10" },
    { id: "spirit", label: "Spirit", defaultSol: "500", color: "text-rose-400 border-rose-500/40 bg-rose-500/10" },
  ];

  const solPresets = [
    { label: "Sol 1", value: "1" },
    { label: "Sol 100", value: "100" },
    { label: "Sol 500", value: "500" },
    { label: "Sol 1000", value: "1000" },
    { label: "Sol 2000", value: "2000" },
    { label: "Sol 3000", value: "3000" },
  ];

  return (
    <div className="space-y-8">
      {/* Rover Selector */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex justify-center gap-3">
          {rovers.map((r) => (
            <button
              key={r.id}
              onClick={() => { setRover(r.id); setSol(r.defaultSol); }}
              className={`px-6 py-3 rounded-full text-xs font-micro uppercase tracking-widest border transition-all duration-300 ${
                rover === r.id ? r.color : "bg-white/5 text-space-400 border-white/10 hover:border-white/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Sol Presets */}
        <div className="flex flex-wrap justify-center gap-2">
          {solPresets.map((s) => (
            <button
              key={s.value}
              onClick={() => setSol(s.value)}
              className={`px-4 py-2 rounded-full text-[10px] font-micro uppercase tracking-wider border transition-all duration-300 ${
                sol === s.value
                  ? "bg-white/10 text-white border-white/30"
                  : "bg-transparent text-space-500 border-space-700 hover:text-white hover:border-white/20"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-orange-400 animate-spin mb-4" />
          <p className="text-space-400 text-sm font-micro uppercase tracking-widest">Receiving Mars transmissions...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-20">
          <ImageIcon className="w-16 h-16 text-space-600 mx-auto mb-4" />
          <p className="text-space-400 text-lg mb-2">No photos for this Sol.</p>
          <p className="text-space-500 text-sm">Try a different Sol value or rover.</p>
        </div>
      ) : (
        <>
          <p className="text-center text-space-400 text-sm">
            Showing <span className="text-white font-semibold">{photos.length}</span> photos from{" "}
            <span className="text-orange-400 font-semibold capitalize">{rover}</span> · Sol {sol} · Earth date: {photos[0]?.earth_date}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                onClick={() => setSelected(photo)}
                className="group relative cursor-pointer rounded-xl overflow-hidden border border-space-500/20 hover:border-orange-500/40 transition-all duration-300 aspect-square"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.img_src}
                  alt={`Mars ${photo.camera.full_name}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[9px] font-micro text-orange-300 uppercase tracking-widest">{photo.camera.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl w-full glass-card rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-2/3 relative min-h-[300px] lg:min-h-[500px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.img_src}
                    alt={selected.camera.full_name}
                    className="absolute inset-0 w-full h-full object-contain bg-black"
                  />
                </div>
                <div className="lg:w-1/3 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Camera className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-micro text-xs uppercase tracking-[3px]">
                      Mars Surface
                    </span>
                  </div>
                  <h3 className="text-2xl font-display text-white mb-4 leading-tight">
                    {selected.camera.full_name}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-space-500">Rover</span><span className="text-white capitalize">{selected.rover.name}</span></div>
                    <div className="flex justify-between"><span className="text-space-500">Camera</span><span className="text-white">{selected.camera.name}</span></div>
                    <div className="flex justify-between"><span className="text-space-500">Sol</span><span className="text-white">{selected.sol}</span></div>
                    <div className="flex justify-between"><span className="text-space-500">Earth Date</span><span className="text-white">{selected.earth_date}</span></div>
                    <div className="flex justify-between"><span className="text-space-500">Rover Status</span><span className="text-white capitalize">{selected.rover.status}</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
