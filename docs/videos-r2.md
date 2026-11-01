# Vidéos du site : lecteur maison + Cloudflare R2

Les vidéos sont lues par `VideoPlayer` (contrôles toujours visibles, tap pour pause, plein écran natif sur iPhone) dès qu'un projet a un `videoUrl`. Sans `videoUrl`, la modale retombe sur Google Drive.

Hébergement : **Cloudflare R2** — 10 Go de stockage gratuits, **aucun frais de bande passante** (contrairement à Sirv ou Vercel Blob).

## 1. Convertir les vidéos (déjà fait pour 23 projets)

```bash
node scripts/prepare-videos.mjs
```

Cherche, pour chaque projet, un fichier dont le nom est le titre du projet dans `youtube-upload/` puis `assets/`, et écrit `web-videos/<titre>.mp4` (H.264, 1280 px max, ~1,3 Mb/s, démarrage rapide). Pour ajouter un projet : déposer son fichier dans `youtube-upload/` sous le titre exact du projet, puis relancer.

## 2. Créer le bucket R2 (une seule fois, ~5 min)

1. Compte gratuit sur https://dash.cloudflare.com → **R2 Object Storage** → *Create bucket* (nom : `portfolio-videos`).
2. Dans le bucket → **Settings → Public access → R2.dev subdomain → Allow**. Noter l'URL `https://pub-xxxx.r2.dev`.
3. **R2 → Manage API tokens → Create API token** : permission *Object Read & Write*, limité à ce bucket. Noter *Access Key ID*, *Secret Access Key* et l'*Account ID* (affiché sur la page R2).
4. Ajouter dans `.env` :

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=portfolio-videos
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

L'adresse `r2.dev` est limitée en débit par Cloudflare ; si le trafic grandit, rattacher un nom de domaine au bucket (Settings → Custom domains) et mettre cette adresse dans `R2_PUBLIC_URL`.

## 3. Envoyer

```bash
node scripts/upload-videos.mjs
```

Envoie les fichiers de `web-videos/` (ceux déjà en ligne sont ignorés) et renseigne `videoUrl` dans `src/data/projects.json`. Il reste à commiter ce fichier et pousser.
