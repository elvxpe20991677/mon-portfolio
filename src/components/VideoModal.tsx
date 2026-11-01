"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize, Minimize, X } from "lucide-react";
import type { Project } from "@/types/project";

interface VideoModalProps {
  project: Project;
  onClose: () => void;
}

type FullscreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

function embedUrl({ youtubeId, driveId }: Project) {
  if (youtubeId) {
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1&modestbranding=1`;
  }
  return `https://drive.google.com/file/d/${driveId}/preview`;
}

function currentFullscreenElement() {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function unlockOrientation() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // Pas de verrou actif ou navigateur non compatible : rien à faire.
  }
}

export default function VideoModal({ project, onClose }: VideoModalProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  // Plein écran natif (Android, iPad, ordinateur) ou simulé (iPhone, qui
  // n'autorise le plein écran que sur une balise <video>, pas sur une iframe).
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [simulatedFullscreen, setSimulatedFullscreen] = useState(false);
  const isFullscreen = nativeFullscreen || simulatedFullscreen;
  const isLandscapeVideo = project.aspectRatio > 1;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (simulatedFullscreen) setSimulatedFullscreen(false);
      else onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, simulatedFullscreen]);

  // Empêche la page de défiler derrière la modale (très gênant au doigt).
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    function sync() {
      const active = currentFullscreenElement() === player;
      setNativeFullscreen(active);
      if (!active) unlockOrientation();
    }
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      if (currentFullscreenElement() === player) {
        document.exitFullscreen?.().catch(() => {});
      }
      unlockOrientation();
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    const player = playerRef.current as FullscreenElement | null;
    if (!player) return;
    try {
      // Borné à 1,5 s : certains lecteurs intégrés laissent la demande sans réponse.
      const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
      if (player.requestFullscreen) {
        await Promise.race([
          player.requestFullscreen({ navigationUI: "hide" }),
          timeout,
        ]);
      } else if (player.webkitRequestFullscreen) {
        // Safari iPad : pas de promesse, on laisse un instant pour que ça prenne.
        await player.webkitRequestFullscreen();
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch {
      // Refusé par le navigateur : on bascule sur le plein écran simulé.
    }
    // Aucune demande acceptée (iPhone, refus, demande restée sans réponse).
    if (currentFullscreenElement() !== player) {
      setSimulatedFullscreen(true);
      return;
    }
    if (isLandscapeVideo) {
      try {
        await (screen.orientation as LockableOrientation)?.lock?.("landscape");
      } catch {
        // Le verrouillage de l'orientation n'existe pas partout : on l'ignore.
      }
    }
  }, [isLandscapeVideo]);

  const exitFullscreen = useCallback(() => {
    setSimulatedFullscreen(false);
    if (currentFullscreenElement()) {
      const doc = document as FullscreenDocument;
      const exit = document.exitFullscreen ?? doc.webkitExitFullscreen;
      Promise.resolve(exit?.call(document)).catch(() => {});
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="video-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-4xl overflow-hidden bg-surface sm:rounded-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Hors de la vidéo, pour ne pas se superposer aux boutons du lecteur. */}
        <div className="video-close flex justify-end px-3 py-2">
          <button
            type="button"
            data-cursor="link"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md bg-white/10 p-2 text-foreground hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Même structure dans tous les modes : l'iframe n'est jamais recréée,
            donc la vidéo ne redémarre pas en entrant/sortant du plein écran. */}
        <div
          ref={playerRef}
          className={`bg-black ${
            isFullscreen ? "flex items-center justify-center" : ""
          } ${
            simulatedFullscreen
              ? `video-simulated-fullscreen fixed inset-0 z-[60] ${
                  isLandscapeVideo ? "video-simulated-fullscreen--rotate" : ""
                }`
              : ""
          }`}
          style={isFullscreen ? { containerType: "size" } : undefined}
        >
          <div
            className={isFullscreen ? "relative" : "video-stage relative mx-auto w-full"}
            style={
              isFullscreen
                ? {
                    aspectRatio: project.aspectRatio,
                    width: `min(100cqw, calc(100cqh * ${project.aspectRatio}))`,
                  }
                : {
                    aspectRatio: project.aspectRatio,
                    maxWidth: `calc(var(--video-height-share) * ${project.aspectRatio})`,
                  }
            }
          >
            <iframe
              src={embedUrl(project)}
              title={project.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="h-full w-full"
            />
            {/* Masque l'icône « ouvrir dans un nouvel onglet » de Google Drive,
                qui ferait quitter le site. */}
            {!project.youtubeId && (
              <div
                aria-hidden
                className="absolute right-0 top-0 z-[5] h-14 w-14"
              />
            )}
          </div>
          {isFullscreen && (
            <button
              type="button"
              data-cursor="link"
              onClick={exitFullscreen}
              aria-label="Quitter le plein écran"
              className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-md bg-black/60 px-3 py-2 text-xs font-medium text-foreground ring-1 ring-white/20 hover:bg-black/80"
            >
              <Minimize className="h-4 w-4" />
              Quitter
            </button>
          )}
        </div>

        <div className="video-info flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <h3 className="font-bold tracking-tight text-foreground">
              {project.title}
            </h3>
            {project.clientName && (
              <p className="text-sm text-muted">{project.clientName}</p>
            )}
            {project.aiGenerated && (
              <p className="mt-1 text-xs text-muted">
                * Réalisé par une pipeline IA
              </p>
            )}
          </div>
          <button
            type="button"
            data-cursor="link"
            onClick={enterFullscreen}
            className="flex shrink-0 items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            <Maximize className="h-4 w-4" />
            Plein écran
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
