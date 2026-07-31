"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Project } from "@/types/project";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/categories";
import ProjectCard from "@/components/ProjectCard";
import VideoModal from "@/components/VideoModal";

type Filter = "all" | Category;

interface ProjectGridProps {
  projects: Project[];
}

function ProjectRow({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (project: Project) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => onSelect(project)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    null
  );
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const featured = useMemo(() => projects.filter((p) => p.featured), [
    projects,
  ]);

  const groups = useMemo(() => {
    if (activeFilter !== "all") {
      return [
        {
          category: activeFilter,
          items: projects.filter((p) => p.category === activeFilter),
        },
      ];
    }
    return CATEGORIES.map((category) => ({
      category,
      items: projects.filter((p) => p.category === category),
    })).filter((group) => group.items.length > 0);
  }, [projects, activeFilter]);

  return (
    <section id="projects" className="px-4 py-16 sm:px-6">
      {featured.length > 0 && (
        <div className="mb-14">
          <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Meilleure sélection
          </h2>
          <ProjectRow projects={featured} onSelect={setSelectedProject} />
        </div>
      )}

      <div className="relative mb-8 flex gap-2 overflow-x-auto pb-2">
        {(["all", ...CATEGORIES] as Filter[]).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "border-accent text-foreground"
                : "border-zinc-800 text-muted hover:border-zinc-600"
            }`}
          >
            {activeFilter === filter && (
              <motion.span
                layoutId="active-filter-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-full bg-accent"
              />
            )}
            <span className="relative">
              {filter === "all" ? "Tout" : CATEGORY_LABELS[filter]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-12">
        {groups.map((group) => (
          <div key={group.category}>
            {activeFilter === "all" && (
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-6 bg-accent" />
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
                  {CATEGORY_LABELS[group.category]}
                  <span className="ml-2 text-muted/60">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </h3>
              </div>
            )}
            <ProjectRow projects={group.items} onSelect={setSelectedProject} />
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedProject && (
          <VideoModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
