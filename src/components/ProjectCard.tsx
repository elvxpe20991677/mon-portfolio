import Image from "next/image";
import { Play, Eye, TrendingUp } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-surface text-left"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={project.thumbnailUrl}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Play className="h-12 w-12 fill-foreground text-foreground" />
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-bold tracking-tight text-foreground">
          {project.title}
        </h3>
        {project.clientName && (
          <p className="text-sm text-muted">{project.clientName}</p>
        )}
        <div className="flex flex-wrap gap-3 pt-1 font-mono text-xs text-muted">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {project.views}
          </span>
          {project.retention && (
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {project.retention}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
