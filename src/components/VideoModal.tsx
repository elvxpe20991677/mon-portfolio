"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Project } from "@/types/project";

interface VideoModalProps {
  project: Project;
  onClose: () => void;
}

function embedUrl({ youtubeId, driveId }: Project) {
  if (youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  }
  return `https://drive.google.com/file/d/${driveId}/preview`;
}

export default function VideoModal({ project, onClose }: VideoModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 rounded-md bg-black/60 p-2 text-foreground hover:bg-black/80"
        >
          <X className="h-5 w-5" />
        </button>
        <div
          className="mx-auto w-full bg-black"
          style={{
            aspectRatio: project.aspectRatio,
            maxWidth: `calc(75dvh * ${project.aspectRatio})`,
          }}
        >
          <iframe
            src={embedUrl(project)}
            title={project.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="p-4">
          <h3 className="font-bold tracking-tight text-foreground">
            {project.title}
          </h3>
          {project.clientName && (
            <p className="text-sm text-muted">{project.clientName}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
