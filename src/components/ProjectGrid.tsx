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
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
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
          <h2 className="mb-4 font-display text-xl font-bold uppercase tracking-tight text-foreground sm:text-2xl">
            Meilleure sélection
          </h2>
          <ProjectRow projects={featured} onSelect={setSelectedProject} />
        </div>
      )}

      <div className="relative mb-8 border-b border-zinc-800 after:pointer-events-none after:absolute after:right-0 after:top-0 after:h-full after:w-10 after:bg-gradient-to-r after:from-transparent after:to-background md:after:hidden">
        <div className="flex gap-6 overflow-x-auto sm:gap-8">
          {(["all", ...CATEGORIES] as Filter[]).map((filter) => (
            <button
              key={filter}
              type="button"
              data-cursor="link"
              onClick={() => setActiveFilter(filter)}
              className={`relative shrink-0 whitespace-nowrap pb-3 text-sm font-medium uppercase tracking-wide transition-colors ${
                activeFilter === filter
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {filter === "all" ? "Tout" : CATEGORY_LABELS[filter]}
              {activeFilter === filter && (
                <motion.span
                  layoutId="active-filter-underline"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute bottom-0 left-0 h-0.5 w-full bg-accent"
                />
              )}
            </button>
          ))}
        </div>
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
