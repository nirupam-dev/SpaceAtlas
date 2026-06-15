"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
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
  Cpu,
  Search,
  Zap,
  Trophy,
  ArrowRight,
  Sparkles,
  Radio,
  Star,
  BarChart3,
} from "lucide-react";

/* ─── top‑bar links (visible in the header on large screens) ─── */
const topBarLinks = [
  { href: "/rockets",      label: "Rockets",      icon: Rocket },
  { href: "/missions",     label: "Missions",     icon: Telescope },
  { href: "/agencies",     label: "Agencies",     icon: Building2 },
  { href: "/technology",   label: "Technology",   icon: Cpu },
  { href: "/solar-system", label: "Solar System", icon: Globe2 },
  { href: "/astronauts",   label: "Astronauts",   icon: Users },
  { href: "/ask",          label: "Ask AI",       icon: BrainCircuit },
];

/* ─── full menu: all destinations, grouped ─── */
const menuSections = [
  {
    title: "Explore",
    links: [
      { href: "/rockets",      label: "Rockets",      icon: Rocket,     desc: "Launch vehicles & specs" },
      { href: "/missions",     label: "Missions",     icon: Telescope,  desc: "Past & future missions" },
      { href: "/agencies",     label: "Agencies",     icon: Building2,  desc: "Space organisations" },
      { href: "/astronauts",   label: "Astronauts",   icon: Users,      desc: "The people of space" },
    ],
  },
  {
    title: "Discover",
    links: [
      { href: "/solar-system", label: "Solar System", icon: Globe2,      desc: "Planets, moons & more" },
      { href: "/technology",   label: "Technology",   icon: Cpu,         desc: "Research & innovations" },
      { href: "/news",         label: "Space News",   icon: Newspaper,   desc: "Live feed from industry" },
      { href: "/launches",     label: "Launches",     icon: Zap,         desc: "Upcoming launch schedule" },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/ask",          label: "Ask AI",       icon: BrainCircuit, desc: "AI-powered Q&A" },
      { href: "/iss",          label: "ISS Tracker",  icon: Satellite,    desc: "Live position of the ISS" },
      { href: "/compare",      label: "Compare",      icon: BarChart3,    desc: "Side-by-side comparisons" },
      { href: "/search",       label: "Search",       icon: Search,       desc: "Search the entire atlas" },
      { href: "/quiz",         label: "Space Quiz",   icon: Trophy,       desc: "Test your knowledge" },
    ],
  },
];

/* ─── animation presets ─── */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit:    { opacity: 0, transition: { duration: 0.25, ease: "easeIn"  } },
};

const panelVariants = {
  hidden:  { x: "100%" },
  visible: { x: "0%", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit:    { x: "100%", transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* lock body scroll when the overlay is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  /* close on Escape */
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  /* close when route changes */
  useEffect(() => { setIsOpen(false); }, [pathname]);

  return (
    <>
      {/* ──── Fixed header bar ──── */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/70 backdrop-blur-md border-b border-white/5 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="w-full">
          <nav
            className={`px-4 sm:px-6 md:px-8 lg:px-12 flex items-center justify-between w-full transition-all duration-300 ${
              scrolled ? "py-3 sm:py-4" : "py-4 sm:py-6 lg:py-8"
            }`}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-lg sm:text-xl lg:text-2xl font-display text-white tracking-[2px]">
                SPACEATLAS
              </span>
            </Link>

            {/* Desktop nav + hamburger */}
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="hidden lg:flex items-center gap-4 xl:gap-6 mr-4">
                {topBarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-[13px] font-bold uppercase tracking-[1.17px] transition-colors ${
                      pathname === link.href
                        ? "text-accent-blue"
                        : "text-white hover:text-space-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-[60] text-white hover:text-accent-blue transition-colors cursor-pointer"
                aria-label="Open menu"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* ──── Full‑screen overlay menu ──── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* backdrop */}
            <motion.div
              key="overlay-backdrop"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
            />

            {/* slide‑in panel */}
            <motion.div
              key="overlay-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 bottom-0 z-[58] w-full max-w-[520px] bg-[#060918]/95 backdrop-blur-2xl border-l border-white/[0.06] overflow-y-auto"
            >
              {/* decorative glow */}
              <div className="absolute top-0 left-0 w-72 h-72 bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent-purple/5 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative px-5 sm:px-8 pt-20 sm:pt-28 pb-12">
                {/* sections */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-10"
                >
                  {menuSections.map((section) => (
                    <motion.div key={section.title} variants={itemVariants}>
                      <h3 className="text-[11px] font-micro uppercase tracking-[3px] text-space-500 mb-4 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-accent-purple" />
                        {section.title}
                      </h3>
                      <div className="space-y-1">
                        {section.links.map((link) => {
                          const Icon = link.icon;
                          const isActive = pathname === link.href;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                              className={`group/item flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                                isActive
                                  ? "bg-accent-blue/10 border border-accent-blue/20"
                                  : "hover:bg-white/[0.04] border border-transparent"
                              }`}
                            >
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                                  isActive
                                    ? "bg-accent-blue/20 text-accent-blue"
                                    : "bg-white/[0.04] text-space-400 group-hover/item:text-accent-blue group-hover/item:bg-accent-blue/10"
                                }`}
                              >
                                <Icon className="w-[18px] h-[18px]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span
                                  className={`block text-sm font-bold tracking-wide ${
                                    isActive ? "text-accent-blue" : "text-white"
                                  }`}
                                >
                                  {link.label}
                                </span>
                                <span className="block text-[11px] text-space-500 mt-0.5 truncate">
                                  {link.desc}
                                </span>
                              </div>
                              <ArrowRight
                                className={`w-4 h-4 transition-all ${
                                  isActive
                                    ? "text-accent-blue opacity-100"
                                    : "text-space-600 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1"
                                }`}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}

                  {/* ── Quick actions strip ── */}
                  <motion.div variants={itemVariants}>
                    <h3 className="text-[11px] font-micro uppercase tracking-[3px] text-space-500 mb-4 flex items-center gap-2">
                      <Radio className="w-3 h-3 text-accent-green" />
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/search"
                        onClick={() => setIsOpen(false)}
                        className="group/qa flex flex-col items-center gap-2 px-4 py-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-blue/30 hover:bg-accent-blue/5 transition-all"
                      >
                        <Search className="w-5 h-5 text-space-400 group-hover/qa:text-accent-blue transition-colors" />
                        <span className="text-xs font-bold text-space-300 group-hover/qa:text-white transition-colors">
                          Search Atlas
                        </span>
                      </Link>
                      <Link
                        href="/iss"
                        onClick={() => setIsOpen(false)}
                        className="group/qa flex flex-col items-center gap-2 px-4 py-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-green/30 hover:bg-accent-green/5 transition-all"
                      >
                        <Satellite className="w-5 h-5 text-space-400 group-hover/qa:text-accent-green transition-colors" />
                        <span className="text-xs font-bold text-space-300 group-hover/qa:text-white transition-colors">
                          Track ISS
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-accent-green font-micro">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                          LIVE
                        </span>
                      </Link>
                      <Link
                        href="/ask"
                        onClick={() => setIsOpen(false)}
                        className="group/qa flex flex-col items-center gap-2 px-4 py-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-purple/30 hover:bg-accent-purple/5 transition-all"
                      >
                        <BrainCircuit className="w-5 h-5 text-space-400 group-hover/qa:text-accent-purple transition-colors" />
                        <span className="text-xs font-bold text-space-300 group-hover/qa:text-white transition-colors">
                          Ask AI
                        </span>
                      </Link>
                      <Link
                        href="/quiz"
                        onClick={() => setIsOpen(false)}
                        className="group/qa flex flex-col items-center gap-2 px-4 py-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-accent-amber/30 hover:bg-accent-amber/5 transition-all"
                      >
                        <Trophy className="w-5 h-5 text-space-400 group-hover/qa:text-accent-amber transition-colors" />
                        <span className="text-xs font-bold text-space-300 group-hover/qa:text-white transition-colors">
                          Space Quiz
                        </span>
                      </Link>
                    </div>
                  </motion.div>

                  {/* ── Featured highlight ── */}
                  <motion.div variants={itemVariants}>
                    <Link
                      href="/news"
                      onClick={() => setIsOpen(false)}
                      className="group/feat block relative overflow-hidden rounded-2xl border border-accent-blue/10 bg-gradient-to-br from-accent-blue/[0.06] to-accent-purple/[0.04] p-6 hover:border-accent-blue/30 transition-all"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full blur-[60px] pointer-events-none" />
                      <div className="relative flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-blue/10">
                          <Star className="w-6 h-6 text-accent-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-bold text-white">
                            Latest Space News
                          </span>
                          <span className="block text-xs text-space-400 mt-0.5">
                            Live updates from across the industry
                          </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-accent-blue opacity-60 group-hover/feat:opacity-100 group-hover/feat:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </motion.div>

                  {/* Keyboard hint */}
                  <motion.div variants={itemVariants} className="pt-2 border-t border-white/[0.04]">
                    <p className="text-[11px] text-space-600 text-center">
                      Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-space-400 font-mono text-[10px]">ESC</kbd> to close
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
