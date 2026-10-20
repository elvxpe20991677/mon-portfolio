"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { Project } from "@/types/project";

interface ShowreelCardProps {
  project: Project;
}

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export default function ShowreelCard({ project }: ShowreelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPausedRef = useRef(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Lecture automatique (muette) seulement quand le bloc est visible, sauf si
  // le visiteur l'a mise en pause ou préfère réduire les animations.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!userPausedRef.current) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  }

  function toggleMuted() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function enterFullscreen() {
    const video = videoRef.current as FullscreenVideo | null;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen().catch(() => {});
    else video.webkitEnterFullscreen?.();
  }

  function seek(event: React.MouseEvent<HTMLDivElement>) {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    video.currentTime = ((event.clientX - rect.left) / rect.width) * video.duration;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800 bg-black"
    >
      <Image
        src={project.thumbnailUrl}
        alt=""
        fill
        priority
        sizes="(min-width: 1280px) 1152px, 100vw"
        className="object-cover"
      />
      <video
        ref={videoRef}
        src={project.videoUrl}
        poster={project.thumbnailUrl}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const { currentTime, duration } = event.currentTarget;
          if (duration) setProgress(currentTime / duration);
        }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "Mettre en pause le showreel" : "Lire le showreel"}
        className="absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent"
      >
        <span
          className={`rounded-full bg-black/50 p-4 ring-1 ring-white/25 transition-opacity duration-300 sm:p-5 ${
            playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          }`}
        >
          {playing ? (
            <Pause className="h-8 w-8 fill-foreground text-foreground sm:h-10 sm:w-10" />
          ) : (
            <Play className="h-8 w-8 fill-foreground text-foreground sm:h-10 sm:w-10" />
          )}
        </span>
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-16">
        <div className="flex items-end justify-between gap-4 px-4 pb-4 sm:px-6 sm:pb-5">
          <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground sm:text-3xl">
            {project.title}
          </h3>
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              data-cursor="link"
              onClick={toggleMuted}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              aria-pressed={!muted}
              className="flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-xs font-medium text-foreground ring-1 ring-white/20 transition-colors hover:bg-black/80"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {muted ? "Activer le son" : "Son activé"}
              </span>
            </button>
            <button
              type="button"
              data-cursor="link"
              onClick={enterFullscreen}
              aria-label="Plein écran"
              className="rounded-md bg-black/60 p-2 text-foreground ring-1 ring-white/20 transition-colors hover:bg-black/80"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div
          onClick={seek}
          role="presentation"
          className="pointer-events-auto h-1.5 w-full cursor-pointer bg-white/15"
        >
          <div
            className="h-full bg-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
