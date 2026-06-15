"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FlaskConical, ExternalLink, Calendar, Loader2, AlertCircle } from "lucide-react";

interface TechProject {
  projectId: number;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  statusDescription?: string;
  leadOrganization?: { organizationName?: string };
  responsibleMd?: string;
  lastUpdated?: string;
}

export default function TechPortProjects() {
  const [projects, setProjects] = useState<TechProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // First get project IDs
      const listRes = await fetch("/api/nasa-techport");
      const listData = await listRes.json();

      if (listData.error) {
        setError(true);
        setLoading(false);
        return;
      }

      // Get IDs from the projects list
      const ids: number[] = [];
      const projectList = Array.isArray(listData.projects) ? listData.projects : listData.projects?.projects;
      
      if (projectList && Array.isArray(projectList)) {
        // Get 9 random project IDs
        const shuffled = [...projectList].sort(() => 0.5 - Math.random());
        ids.push(...shuffled.slice(0, 9).map((p: { projectId: number }) => p.projectId));
      }

      if (ids.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }

      // Fetch details for each project
      const projectPromises = ids.map(async (id) => {
        try {
          const res = await fetch(`/api/nasa-techport?id=${id}`);
          const data = await res.json();
          return data.project || null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(projectPromises);
      setProjects(results.filter(Boolean) as TechProject[]);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-10 h-10 text-accent-purple animate-spin mb-4" />
        <p className="text-space-400 text-sm font-micro uppercase tracking-widest">Loading TechPort projects...</p>
        <p className="text-space-500 text-xs mt-2">Fetching live data from NASA</p>
      </div>
    );
  }

  if (error || projects.length === 0) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-space-600 mx-auto mb-4" />
        <p className="text-space-400 text-lg mb-4">Could not load TechPort projects.</p>
        <button
          onClick={fetchProjects}
          className="px-6 py-3 rounded-full bg-accent-blue/20 text-accent-blue border border-accent-blue/40 text-xs font-micro uppercase tracking-widest hover:bg-accent-blue/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statusColor = (status?: string) => {
    if (!status) return "text-space-400 border-space-500/30 bg-space-500/10";
    const s = status.toLowerCase();
    if (s.includes("active") || s.includes("ongoing")) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (s.includes("completed")) return "text-sky-400 border-sky-500/30 bg-sky-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, i) => (
        <motion.div
          key={project.projectId}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="glass-card glass-card-hover p-6 group flex flex-col cursor-pointer"
          onClick={() => setExpandedId(expandedId === project.projectId ? null : project.projectId)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
              <FlaskConical className="w-6 h-6 text-violet-400" />
            </div>
            {project.statusDescription && (
              <span className={`px-3 py-1 rounded-full text-[10px] font-micro uppercase tracking-widest border ${statusColor(project.statusDescription)}`}>
                {project.statusDescription}
              </span>
            )}
          </div>

          <h4 className="text-base font-semibold text-white mb-3 line-clamp-2 group-hover:text-accent-blue transition-colors leading-snug">
            {project.title}
          </h4>

          <p className={`text-sm text-space-400 leading-relaxed flex-grow ${
            expandedId === project.projectId ? "" : "line-clamp-3"
          }`}>
            {project.description?.replace(/<[^>]*>/g, "").slice(0, expandedId === project.projectId ? 1000 : 200) || "No description available."}
          </p>

          <div className="mt-5 pt-4 border-t border-space-700 space-y-2">
            {project.leadOrganization?.organizationName && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-space-500">Lead Org</span>
                <span className="text-white text-right max-w-[60%] truncate">{project.leadOrganization.organizationName}</span>
              </div>
            )}
            {project.startDate && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-space-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Period</span>
                <span className="text-white">
                  {new Date(project.startDate).getFullYear()} — {project.endDate ? new Date(project.endDate).getFullYear() : "Present"}
                </span>
              </div>
            )}
            <a
              href={`https://techport.nasa.gov/projects/${project.projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 text-accent-blue text-xs font-micro uppercase tracking-widest hover:underline mt-2"
            >
              View on TechPort <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
