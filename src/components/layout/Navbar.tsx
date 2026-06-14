"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Rocket,
  Globe2,
  Users,
  Building2,
  Newspaper,
  Menu,
  X,
  Telescope,
  BrainCircuit,
  Satellite,
} from "lucide-react";

const navLinks = [
  { href: "/rockets",      label: "Rockets",     icon: Rocket },
  { href: "/missions",     label: "Missions",    icon: Telescope },
  { href: "/agencies",     label: "Agencies",    icon: Building2 },
  { href: "/solar-system", label: "Solar System", icon: Globe2 },
  { href: "/astronauts",   label: "Astronauts",  icon: Users },
  { href: "/ask",          label: "Ask AI",      icon: BrainCircuit },
  { href: "/iss",          label: "ISS Tracker", icon: Satellite },
  { href: "/news",         label: "News",        icon: Newspaper },
  { href: "/quiz",         label: "Quiz",        icon: BrainCircuit },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="w-full">
          <nav className="px-12 py-8 flex items-center justify-between w-full bg-transparent">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-display text-white tracking-[2px]">
                SPACEATLAS
              </span>
            </Link>

            {/* Desktop nav + hamburger */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-6 mr-4">
                {navLinks.slice(0, 6).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[13px] font-bold text-white hover:text-space-300 uppercase tracking-[1.17px] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-space-300 transition-colors"
                aria-label="Menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden w-full bg-black border-t border-space-500"
            >
              <div className="p-6 grid grid-cols-1 gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-[13px] font-bold text-white uppercase tracking-[1.17px] hover:text-space-300 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
