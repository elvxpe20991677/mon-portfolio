"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  aspectRatio: number;
  title: string;
  /** Appelé si le fichier ne peut pas être lu (le parent peut proposer un repli). */
  onError?: () => void;
}

type FullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
};
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

const HIDE_CONTROLS_DELAY = 3000;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

function currentFullscreenElement() {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/**
 * Lecteur maison pour les vidéos servies par le site : les contrôles sont
 * toujours visibles sous l'image (rien à attendre), un tap sur la vidéo met
 * en pause, et le plein écran utilise le lecteur natif de l'iPhone.
 * Le fichier n'est chargé qu'à l'ouverture (preload="metadata").
 */
export default function VideoPlayer({
  src,
  poster,
  aspectRatio,
  title,
  onError,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [activity, setActivity] = useState(0);
  const isLandscapeVideo = aspectRatio > 1;

  // Lecture dès l'ouverture ; si le navigateur refuse (son non autorisé), le
  // bouton lecture reste affiché.
  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    function sync() {
      const active = currentFullscreenElement() === container;
      setFullscreen(active);
      setControlsVisible(true);
      if (!active) screen.orientation?.unlock?.();
    }
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
      if (currentFullscreenElement() === container) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // En plein écran, la barre se masque seule pendant la lecture ; sinon elle
  // reste toujours visible sous la vidéo. Chaque action relance le compte à rebours.
  const revealControls = useCallback(() => {
    setControlsVisible(true);
    setActivity((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!fullscreen || !playing) return;
    const timer = setTimeout(
      () => setControlsVisible(false),
      HIDE_CONTROLS_DELAY,
    );
    return () => clearTimeout(timer);
  }, [fullscreen, playing, activity]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    if (fullscreen) revealControls();
  }

  function toggleMuted() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function seek(event: React.ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current;
    if (!video || !duration) return;
    const time = (Number(event.target.value) / 1000) * duration;
    video.currentTime = time;
    setCurrentTime(time);
  }

  async function enterFullscreen() {
    const container = containerRef.current as FullscreenElement | null;
    const video = videoRef.current as FullscreenVideo | null;
    if (!container || !video) return;
    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen({ navigationUI: "hide" });
      } else if (container.webkitRequestFullscreen) {
        await container.webkitRequestFullscreen();
      } else {
        // iPhone : seul le lecteur natif de la balise <video> passe en plein écran.
        video.webkitEnterFullscreen?.();
        return;
      }
    } catch {
      video.webkitEnterFullscreen?.();
      return;
    }
    if (isLandscapeVideo) {
      try {
        await (screen.orientation as LockableOrientation)?.lock?.("landscape");
      } catch {
        // Verrouillage d'orientation indisponible : on l'ignore.
      }
    }
  }

  function exitFullscreen() {
    const doc = document as FullscreenDocument;
    const exit = document.exitFullscreen ?? doc.webkitExitFullscreen;
    Promise.resolve(exit?.call(document)).catch(() => {});
  }

  const progress = duration ? (currentTime / duration) * 1000 : 0;
  const barHidden = fullscreen && playing && !controlsVisible;

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${fullscreen ? "h-full w-full" : ""}`}
      onPointerMove={fullscreen ? revealControls : undefined}
    >
      <div
        className={
          fullscreen
            ? "absolute inset-0"
            : "video-stage video-stage--bar relative mx-auto w-full"
        }
        style={
          fullscreen
            ? undefined
            : {
                aspectRatio,
                maxWidth: `calc(var(--video-height-share) * ${aspectRatio})`,
              }
        }
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          title={title}
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onCanPlay={() => setLoading(false)}
          onPlaying={() => setLoading(false)}
          onLoadedMetadata={(event) =>
            setDuration(event.currentTarget.duration)
          }
          onTimeUpdate={(event) =>
            setCurrentTime(event.currentTarget.currentTime)
          }
          onError={onError}
          className="h-full w-full object-contain"
        />
        {/* Toute l'image sert de bouton lecture/pause : un tap suffit. */}
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Mettre en pause" : "Lire la vidéo"}
          className="absolute inset-0 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-accent"
        >
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin text-foreground/80" />
          ) : (
            !playing && (
              <span className="rounded-full bg-black/55 p-4 ring-1 ring-white/25">
                <Play className="h-8 w-8 fill-foreground text-foreground" />
              </span>
            )
          )}
        </button>
      </div>

      <div
        className={
          fullscreen
            ? `absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent px-4 pb-4 pt-10 transition-opacity duration-300 ${
                barHidden ? "pointer-events-none opacity-0" : "opacity-100"
              }`
            : "px-4 py-3"
        }
      >
        <div className="flex items-center gap-3 font-mono text-xs tabular-nums text-muted">
          <span className="w-10 shrink-0 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={1000}
            value={progress}
            onChange={seek}
            aria-label="Position dans la vidéo"
            className="video-seek h-8 min-w-0 flex-1"
          />
          <span className="w-10 shrink-0">{formatTime(duration)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-cursor="link"
              onClick={togglePlay}
              aria-label={playing ? "Mettre en pause" : "Lire la vidéo"}
              className="flex items-center gap-2 rounded-md bg-white/10 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-white/20"
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
              {playing ? "Pause" : "Lecture"}
            </button>
            <button
              type="button"
              data-cursor="link"
              onClick={toggleMuted}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              aria-pressed={!muted}
              className="rounded-md bg-white/10 p-2.5 text-foreground hover:bg-white/20"
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
          <button
            type="button"
            data-cursor="link"
            onClick={fullscreen ? exitFullscreen : enterFullscreen}
            aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}
            className="flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            {fullscreen ? (
              <Minimize className="h-5 w-5" />
            ) : (
              <Maximize className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">
              {fullscreen ? "Quitter" : "Plein écran"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
