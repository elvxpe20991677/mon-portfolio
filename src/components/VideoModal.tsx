"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { Project } from "@/types/project";

interface VideoModalProps {
  project: Project;
  onClose: () => void;
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
        <video
          src={project.videoUrl}
          autoPlay
          controls
          playsInline
          className="aspect-video w-full bg-black"
        />
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
