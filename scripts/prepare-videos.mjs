// Convertit les vidéos sources en MP4 H.264 léger, prêt pour le web.
//
//   node scripts/prepare-videos.mjs
//
// Pour chaque projet de src/data/projects.json, cherche un fichier source dont
// le nom correspond au titre du projet (dans youtube-upload/ puis assets/),
// puis écrit web-videos/<titre-slug>.mp4. Les projets sans source sont ignorés
// (ils restent sur Drive). Un fichier déjà converti n'est pas refait.
//
// Réglages : 1280 px de large max (720 px en vertical), CRF 24, débit plafonné,
// moov atom en tête de fichier (+faststart) pour démarrer sans tout télécharger.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { slugify } from "./prepare-videos-lib.mjs";

const root = resolve(import.meta.dirname, "..");
const outDir = join(root, "web-videos");
const sourceRoots = ["youtube-upload", "assets", "drive-sources"].map((dir) => join(root, dir));
const projects = JSON.parse(
  readFileSync(join(root, "src/data/projects.json"), "utf8")
);

const normalize = (text) => text.normalize("NFC").toLowerCase();

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(join(dir, entry.name))
      : [join(dir, entry.name)]
  );
}

const videoExtensions = new Set([".mov", ".mp4", ".mkv", ".m4v"]);
const sources = sourceRoots
  .flatMap(listFiles)
  .filter((file) => videoExtensions.has(extname(file).toLowerCase()));

function findSource(project) {
  const wanted = normalize(project.title);
  return sources.find(
    (file) => normalize(basename(file, extname(file))) === wanted
  );
}

function encode(input, output) {
  const args = [
    "-v", "error", "-y", "-i", input,
    "-map", "0:v:0", "-map", "0:a:0?",
    "-vf", "scale='if(gt(a,1),min(1280,iw),min(720,iw))':-2",
    "-c:v", "libx264", "-preset", "slow", "-crf", "24",
    "-maxrate", "3M", "-bufsize", "6M",
    "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "128k",
    "-movflags", "+faststart",
    output,
  ];
  return new Promise((done, fail) => {
    const child = spawn("ffmpeg", args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", fail);
    child.on("exit", (code) =>
      code === 0 ? done() : fail(new Error(`ffmpeg a échoué (${code})`))
    );
  });
}

mkdirSync(outDir, { recursive: true });
let converted = 0;
const skipped = [];

for (const project of projects) {
  if (project.category === "showreel") continue;
  const source = findSource(project);
  if (!source) {
    skipped.push(project.title);
    continue;
  }
  const output = join(outDir, `${slugify(project.title)}.mp4`);
  if (existsSync(output) && statSync(output).mtimeMs > statSync(source).mtimeMs) {
    console.log(`= ${project.title} (déjà converti)`);
    continue;
  }
  console.log(`> ${project.title}`);
  await encode(source, output);
  const mb = (statSync(output).size / 1048576).toFixed(1);
  console.log(`  ${mb} Mo`);
  converted += 1;
}

console.log(`\n${converted} converti(s).`);
if (skipped.length) {
  console.log(`Sans fichier source (restent sur Drive) : ${skipped.join(", ")}`);
}
