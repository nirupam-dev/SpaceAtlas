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
  Search,
  Menu,
  X,
  Telescope,
  Timer,
  BrainCircuit,
} from "lucide-react";

const navLinks = [
  { href: "/rockets", label: "Rockets", icon: Rocket },
  { href: "/missions", label: "Missions", icon: Telescope },
  { href: "/agencies", label: "Agencies", icon: Building2 },
  { href: "/solar-system", label: "Solar System", icon: Globe2 },
  { href: "/astronauts", label: "Astronauts", icon: Users },
  { href: "/launches", label: "Launches", icon: Timer },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/quiz", label: "Quiz", icon: BrainCircuit },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

            {/* Right side: Nav + Hamburger */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-6 mr-4">
                {navLinks.slice(0, 5).map((link) => (
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

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
            onClick={() => setSearchOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl mx-4"
            >
              <div className="glass-card p-2">
                <div className="flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-space-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search rockets, missions, planets, astronauts..."
                    className="flex-1 bg-transparent py-4 text-lg outline-none placeholder-space-500 text-white"
                  />
                  <kbd className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-space-700 text-space-400 text-xs font-mono">
                    ESC
                  </kbd>
                </div>
                {searchQuery && (
                  <div className="border-t border-space-700 p-4">
                    <p className="text-sm text-space-400">
                      Search results for &quot;{searchQuery}&quot; — Press Enter to search
                    </p>
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setSearchOpen(false)}
                      className="mt-3 block btn-primary text-center text-sm"
                    >
                      View all results
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
