"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-8 px-6 py-32 text-center"
    >
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
        Je transforme vos idées en vidéos qui retiennent l&apos;attention.
      </h1>
      <p className="max-w-xl text-lg text-muted">
        Montage vidéo pour créateurs de contenu, agences et marques —
        rétention, watch time et conversion au cœur de chaque cut.
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          href="#projects"
          className="rounded-md bg-accent px-6 py-3 font-medium text-foreground transition-colors hover:bg-accent/90"
        >
          Voir mon travail
        </a>
        <a
          href="mailto:perros.elvis@gmail.com"
          className="rounded-md border border-zinc-800 px-6 py-3 font-medium text-foreground transition-colors hover:border-zinc-600"
        >
          Me contacter
        </a>
      </div>
    </motion.section>
  );
}
