import Link from "next/link";
import { Rocket, Code, MessageSquare, Mail } from "lucide-react";

const footerLinks = [
  {
    title: "Explore",
    links: [
      { label: "Rockets", href: "/rockets" },
      { label: "Missions", href: "/missions" },
      { label: "Solar System", href: "/solar-system" },
      { label: "Astronauts", href: "/astronauts" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Launch Tracker", href: "/launches" },
      { label: "ISS Tracker",    href: "/iss" },
      { label: "Space News",     href: "/news" },
      { label: "Space Quiz",     href: "/quiz" },
      { label: "Compare Rockets", href: "/compare/rockets" },
    ],
  },
  {
    title: "Agencies",
    links: [
      { label: "NASA", href: "/agencies/nasa" },
      { label: "ISRO", href: "/agencies/isro" },
      { label: "ESA", href: "/agencies/esa" },
      { label: "SpaceX", href: "/agencies/spacex" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="w-full bg-black border-t border-space-500">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display text-white">SpaceAtlas</span>
            </Link>
            <p className="text-space-400 text-[13px] leading-relaxed max-w-sm">
              Your comprehensive encyclopedia of the cosmos. Explore rockets,
              missions, planets, and everything space.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-space-400 hover:text-white transition-colors">
                <Code className="w-4 h-4" />
              </a>
              <a href="#" className="text-space-400 hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
              <a href="#" className="text-space-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-micro text-white mb-4">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-space-400 hover:text-white transition-colors uppercase tracking-[0.96px]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="border-t border-space-500 mt-12 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-micro text-space-500">
            © {new Date().getFullYear()} SPACEATLAS
          </p>
          <p className="text-xs font-micro text-space-500">
            DATA SOURCED FROM NASA, SPACEX, AND PUBLIC APIS
          </p>
        </div>
      </div>
    </footer>
  );
}
