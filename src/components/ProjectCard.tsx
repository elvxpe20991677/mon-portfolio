"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Eye, TrendingUp } from "lucide-react";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
}

const HOVER_DELAY = 300;
const LONG_PRESS_DELAY = 400;

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function stopPreview() {
    clearTimer();
    setIsPreviewing(false);
    setPreviewReady(false);
  }

  function handleMouseEnter() {
    clearTimer();
    timerRef.current = setTimeout(() => setIsPreviewing(true), HOVER_DELAY);
  }

  function handleMouseLeave() {
    stopPreview();
  }

  function handleTouchStart() {
    clearTimer();
    longPressTriggeredRef.current = false;
    timerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setIsPreviewing(true);
    }, LONG_PRESS_DELAY);
  }

  function handleTouchEnd(event: React.TouchEvent) {
    clearTimer();
    if (longPressTriggeredRef.current) {
      event.preventDefault();
      stopPreview();
      longPressTriggeredRef.current = false;
    }
  }

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      type="button"
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="group flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-surface text-left transition-colors duration-300 hover:border-accent/60"
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={project.thumbnailUrl}
          alt={project.title}
          fill
          sizes="(min-width: 1024px) 33vw, 50vw"
          className="object-cover brightness-90 transition-[transform,filter] duration-300 group-hover:scale-105 group-hover:brightness-100"
        />
        <AnimatePresence>
          {isPreviewing && (
            <motion.video
              initial={{ opacity: 0 }}
              animate={{ opacity: previewReady ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              src={project.videoUrl}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              onCanPlay={() => setPreviewReady(true)}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isPreviewing
              ? "opacity-0"
              : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          }`}
        >
          <div className="rounded-full bg-black/50 p-3 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-110">
            <Play className="h-7 w-7 fill-foreground text-foreground sm:h-8 sm:w-8" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        <h3 className="truncate text-sm font-bold tracking-tight text-foreground sm:text-base">
          {project.title}
        </h3>
        {project.clientName && (
          <p className="text-xs text-muted sm:text-sm">{project.clientName}</p>
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
    </motion.button>
  );
}
