"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const [cursorState, setCursorState] = useState<"idle" | "project" | "link">(
    "idle"
  );

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    let raf: number;

    function handleMove(event: MouseEvent) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`;
        dotRef.current.style.top = `${mouseY}px`;
      }
    }

    function animate() {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      if (outlineRef.current) {
        outlineRef.current.style.left = `${outlineX}px`;
        outlineRef.current.style.top = `${outlineY}px`;
      }
      raf = requestAnimationFrame(animate);
    }

    const cleanups: Array<() => void> = [];
    function bindTargets() {
      document.querySelectorAll<HTMLElement>("[data-cursor]").forEach((el) => {
        const type = (el.dataset.cursor as "project" | "link") || "link";
        const onEnter = () => setCursorState(type);
        const onLeave = () => setCursorState("idle");
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
        cleanups.push(() => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    bindTargets();
    window.addEventListener("mousemove", handleMove);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
      cleanups.forEach((off) => off());
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
      />
      <div
        ref={outlineRef}
        className={`fixed left-0 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ${
          cursorState === "project"
            ? "h-20 w-20 border-foreground/20 bg-foreground/10"
            : cursorState === "link"
              ? "h-10 w-10 border-foreground/15 bg-foreground/10"
              : "h-4 w-4 border-foreground/40 bg-transparent"
        }`}
      >
        <span
          className={`font-display text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
            cursorState === "project"
              ? "scale-100 opacity-100"
              : "scale-0 opacity-0"
          }`}
        >
          Play
        </span>
      </div>
    </div>
  );
}
