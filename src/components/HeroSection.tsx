"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

function RevealLine({ children, delay }: { children: string; delay: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "120%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay }}
        className="block"
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function HeroSection() {
  return (
    <>
      <section className="relative flex h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-[clamp(2.75rem,13vw,7rem)] font-bold uppercase leading-[0.88] tracking-tight text-foreground">
          <RevealLine delay={0.1}>Elvis</RevealLine>
          <RevealLine delay={0.25}>Perros</RevealLine>
        </h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.9 }}
          className="absolute bottom-10 flex flex-col items-center gap-2"
        >
          <span className="text-[0.65rem] uppercase tracking-[0.3em] text-muted">
            Scroll
          </span>
          <span className="h-10 w-px animate-pulse bg-gradient-to-b from-muted to-transparent" />
        </motion.div>
      </section>

      <section className="flex flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted">
          Monteur Vidéo &amp; Motion Designer
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="#projects"
            data-cursor="link"
            className="rounded-md bg-accent px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent/90"
          >
            Voir mon travail
          </a>
          <a
            href="mailto:3vr.contact@gmail.com"
            data-cursor="link"
            className="rounded-md border border-zinc-800 px-6 py-3 font-medium text-foreground transition-colors hover:border-zinc-600"
          >
            Me contacter
          </a>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-green-500/35 px-4 py-1.5 text-xs font-medium tracking-wide text-green-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
          Disponible pour de nouveaux projets
        </div>
      </section>
    </>
  );
}
