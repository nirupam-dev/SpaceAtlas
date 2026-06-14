"use client";

import { motion } from "framer-motion";
import { Rocket, Plus, X, ArrowLeftRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/Cards";
import { rockets } from "@/lib/data";
import { useState } from "react";

export default function CompareRocketsPage() {
  const [selected, setSelected] = useState<string[]>([]);

  const addRocket = (id: string) => {
    if (selected.length < 3 && !selected.includes(id)) setSelected([...selected, id]);
  };

  const removeRocket = (id: string) => setSelected(selected.filter((s) => s !== id));

  const selectedRockets = rockets.filter((r) => selected.includes(r.id));
  const available = rockets.filter((r) => !selected.includes(r.id));

  const fields = [
    { key: "manufacturer", label: "Manufacturer" },
    { key: "country", label: "Country" },
    { key: "status", label: "Status" },
    { key: "height", label: "Height (m)" },
    { key: "diameter", label: "Diameter (m)" },
    { key: "mass", label: "Mass (kg)", format: (v: number) => v?.toLocaleString() },
    { key: "payloadToLEO", label: "Payload to LEO (kg)", format: (v: number) => v?.toLocaleString() },
    { key: "stages", label: "Stages" },
    { key: "engines", label: "Engines" },
    { key: "thrust", label: "Thrust (kN)", format: (v: number) => v?.toLocaleString() },
    { key: "costPerLaunch", label: "Cost/Launch", format: (v: number) => `$${(v / 1e6).toFixed(0)}M` },
    { key: "successRate", label: "Success Rate", format: (v: number) => `${v}%` },
    { key: "totalLaunches", label: "Total Launches" },
  ];

  return (
    <div className="pt-28 pb-20 px-6 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <SectionHeading badge="Compare" title="Rocket Comparison" subtitle="Side-by-side comparison of launch vehicles" />

        {/* Selector */}
        {selected.length < 3 && (
          <div className="glass-card p-4 mb-8">
            <p className="text-sm text-space-400 mb-3">Select up to 3 rockets to compare ({3 - selected.length} remaining)</p>
            <div className="flex flex-wrap gap-2">
              {available.map((r) => (
                <button key={r.id} onClick={() => addRocket(r.id)} className="px-4 py-2 rounded-xl bg-space-800 border border-space-700 text-sm text-space-300 hover:border-accent-blue/50 hover:text-white transition-all flex items-center gap-1">
                  <Plus className="w-3 h-3" /> {r.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedRockets.map((r) => (
              <span key={r.id} className="px-4 py-2 rounded-xl bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-sm flex items-center gap-2">
                <Rocket className="w-4 h-4" /> {r.name}
                <button onClick={() => removeRocket(r.id)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        {/* Comparison table */}
        {selectedRockets.length >= 2 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-space-700">
                  <th className="py-4 px-6 text-left text-space-400 font-medium">Specification</th>
                  {selectedRockets.map((r) => (
                    <th key={r.id} className="py-4 px-6 text-center text-white font-semibold">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-space-800 hover:bg-space-800/30 transition-colors">
                    <td className="py-3 px-6 text-space-400">{field.label}</td>
                    {selectedRockets.map((r) => {
                      const val = (r as Record<string, unknown>)[field.key];
                      const formatted = field.format ? field.format(val as number) : String(val ?? "N/A");
                      return <td key={r.id} className="py-3 px-6 text-center text-white font-medium">{formatted}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <div className="text-center py-20 text-space-500">
            <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Select at least 2 rockets to compare</p>
          </div>
        )}
      </div>
    </div>
  );
}
