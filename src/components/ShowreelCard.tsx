"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { Project } from "@/types/project";

interface ShowreelCardProps {
  project: Project;
  onSelect: () => void;
}

export default function ShowreelCard({ project, onSelect }: ShowreelCardProps) {
  const [previewReady, setPreviewReady] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      type="button"
      data-cursor="project"
      onClick={onSelect}
      aria-label={`Lire ${project.title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-surface text-left transition-colors duration-300 hover:border-accent/60"
    >
      <Image
        src={project.thumbnailUrl}
        alt={project.title}
        fill
        priority
        sizes="(min-width: 1280px) 1152px, 100vw"
        className="object-cover"
      />
      <motion.video
        initial={{ opacity: 0 }}
        animate={{ opacity: previewReady ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        src={project.previewUrl}
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        onCanPlay={() => setPreviewReady(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full bg-black/50 p-4 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-110 sm:p-5">
          <Play className="h-8 w-8 fill-foreground text-foreground sm:h-10 sm:w-10" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
          {project.title}
        </h3>
      </div>
    </motion.button>
  );
}
