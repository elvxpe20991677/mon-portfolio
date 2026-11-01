// Envoie les vidéos de web-videos/ sur Cloudflare R2 (stockage gratuit jusqu'à
// 10 Go, sans frais de bande passante), puis renseigne `videoUrl` dans
// src/data/projects.json pour que le site les lise avec son propre lecteur.
//
//   node scripts/upload-videos.mjs
//
// Variables attendues dans .env (voir docs/videos-r2.md) :
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_URL

import { existsSync, readdirSync, readFileSync, statSync, createReadStream, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { slugify } from "./prepare-videos-lib.mjs";

const root = resolve(import.meta.dirname, "..");
const videosDir = join(root, "web-videos");
const projectsFile = join(root, "src/data/projects.json");

if (existsSync(join(root, ".env"))) process.loadEnvFile(join(root, ".env"));

const required = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error(`Variables manquantes dans .env : ${missing.join(", ")}`);
  process.exit(1);
}

const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function alreadyUploaded(key, size) {
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key })
    );
    return head.ContentLength === size;
  } catch {
    return false;
  }
}

const files = readdirSync(videosDir).filter((name) => name.endsWith(".mp4"));
const uploaded = new Set();

for (const name of files) {
  const path = join(videosDir, name);
  const size = statSync(path).size;
  if (await alreadyUploaded(name, size)) {
    console.log(`= ${name} (déjà en ligne)`);
    uploaded.add(name);
    continue;
  }
  console.log(`> ${name} (${(size / 1048576).toFixed(1)} Mo)`);
  await new Upload({
    client,
    params: {
      Bucket: process.env.R2_BUCKET,
      Key: name,
      Body: createReadStream(path),
      ContentType: "video/mp4",
      // Le nom change si la vidéo change : on peut la garder un an en cache.
      CacheControl: "public, max-age=31536000, immutable",
    },
  }).done();
  uploaded.add(name);
}

// Renseigne videoUrl juste après thumbnailUrl / previewUrl, sans toucher au reste.
const projects = JSON.parse(readFileSync(projectsFile, "utf8"));
let updated = 0;
const next = projects.map((project) => {
  const file = `${slugify(project.title)}.mp4`;
  if (project.category === "showreel" || !uploaded.has(file)) return project;
  const videoUrl = `${publicUrl}/${file}`;
  if (project.videoUrl === videoUrl) return project;
  updated += 1;
  const entries = Object.entries(project).filter(([key]) => key !== "videoUrl");
  const after = entries.findLastIndex(([key]) =>
    ["thumbnailUrl", "previewUrl"].includes(key)
  );
  entries.splice(after + 1, 0, ["videoUrl", videoUrl]);
  return Object.fromEntries(entries);
});

writeFileSync(
  projectsFile,
  JSON.stringify(next, null, 2).replace(/\n/g, "\r\n") + "\r\n"
);
console.log(`\n${uploaded.size} vidéo(s) en ligne, ${updated} projet(s) mis à jour dans projects.json.`);
