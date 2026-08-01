# Améliorations du portfolio — conception

**Date :** 2026-08-01
**Statut :** validé, prêt pour le plan d'implémentation

## Contexte

Le portfolio est en ligne et fonctionnel (3 commits, dernier `b1b0e2d`). L'audit du 2026-08-01 a relevé neuf problèmes, dont deux qui coûtent des clients aujourd'hui.

**Cible retenue :** décrocher des missions clients (créateurs de contenu, agences, marques). Pas une candidature d'alternance — ce qui écarte le CV, les compétences listées et la disponibilité.

**Contrainte majeure découverte pendant le cadrage :** aucun nom de client citable ni statistique de vues publiable n'est disponible. Le cahier des charges (`claude.md`, section 4.3) prévoyait des badges de preuve sociale (« 1.2M vues », « 65 % rétention ») — **ils sont impossibles à remplir honnêtement**. La conception ci-dessous les supprime au lieu de les laisser à zéro.

## Problèmes traités

### Bloquants

**B1 — Les données sont des placeholders.** Les 23 projets ont un titre égal au nom de fichier (`VF_LogoMotion_MJP`, `0_final`, `v2.1`), un `clientName` vide et `views: "0"`. Chaque carte affiche donc `👁 0` : le site annonce « 0 vue » sur chaque projet, l'inverse exact de l'effet recherché.

**B2 — L'aperçu au survol télécharge la vidéo entière.** `ProjectCard` pointe `<video src>` sur `project.videoUrl`, soit le fichier complet : 151 Mo pour `V4.2 Hq`, 122 Mo pour `v2.1`, 797 Mo cumulés sur les 23. Un visiteur qui balaie la grille en 4G brûle son forfait, et la lecture en boucle re-télécharge en continu.

### Secondaires

**S1 — SEO et partage absents.** Aucun `openGraph` : un lien partagé sur WhatsApp ou LinkedIn s'affiche sans aperçu. Titre générique sans le nom d'Elvis. Ni `robots` ni `sitemap`.

**S2 — `prefers-reduced-motion` ignoré.** L'ancien portfolio le respectait. Le nouveau a plus d'animations (cascade, révélation du titre, curseur, hover) et n'en tient pas compte.

**S3 — Modale peu accessible.** Pas de `role="dialog"` ni `aria-modal`, pas de piège à focus, le fond continue de scroller, et le focus ne revient pas sur la carte d'origine à la fermeture.

**S4 — Curseur personnalisé fragile.** `globals.css` applique `cursor: none` inconditionnellement en `(pointer: fine)`. Si le JS ne s'exécute pas, l'utilisateur n'a plus aucun curseur.

**S5 — Formats non horizontaux recadrés.** `Trailler_Kylian` (720×1280, vertical) et `03-3 OUTILS INDISPENSABLE` (1080×1080, carré) sont forcés en 16:9 avec `object-cover` : le sujet est coupé, dans la grille et dans la modale.

**S6 — Titres tronqués.** `truncate` sur une seule ligne rend `UNBOXING 10PLUS ROUES - V2.1 COLO ON` illisible.

### Écarté volontairement

**Section « à propos » / prestations.** Proposée puis refusée : le site reste minimal, la grille enchaîne sur le pied de page. Risque assumé et documenté : un visiteur repart sans savoir quelles prestations sont proposées. À reconsidérer si les prises de contact ne viennent pas.

## Conception

### 1. Nettoyage des données (B1)

**Suppression des stats.** La ligne `👁 0` disparaît de `ProjectCard`. Les champs `views` et `retention` sortent de l'interface `Project` et de `projects.json` — ils ne sont plus affichés nulle part, les garder ne ferait qu'entretenir des champs morts.

`clientName` passe de `string` à `clientName?: string` et les chaînes vides sont retirées du JSON : plusieurs covers de logos affichent une marque en clair, ces noms pourront être renseignés plus tard sans changer le type. `ProjectCard` et `VideoModal` testent déjà sa présence avant de l'afficher, aucun ajustement n'y est nécessaire.

**Réécriture des titres.** Titres ci-dessous, dérivés des marques visibles dans les covers et du contenu observé, complétés par Elvis pour `v2.1` et `V4.2 Hq`. Un seul reste à confirmer : `0_final`, dont la cover quasi noire ne permet pas de trancher.

Le classement de `Vlog Tunisie` (13 min) et `Blindtest Rappaz` (18 min) en réseaux sociaux est confirmé : ce sont des formats YouTube longs, pas des documentaires.

| Fichier actuel | Titre proposé |
|---|---|
| `VF_LogoMotion_MJP` | Moi Je Progresse — Logo animé |
| `VF_LogoMotion_BABA` | B.A-BA — Logo animé |
| `VF_LogoMotion_FCEM` | Français clés en main — Logo animé |
| `VF_LogoMotion_Bourrelier` | Bourrelier — Logo animé |
| `VF_LogoMotion_Horizon` | L'Horizon — Logo animé |
| `VF_LogoMotion_RiseUP` | Rise UP — Logo animé |
| `VF_LogoMotion_Versologic` | Versologic — Logo animé |
| `LFO_Générique_out` | LFO — Générique de fin |
| `LFO_transitions_IN` | LFO — Transition d'ouverture |
| `VF_CVMOTION_Laura` | Laura — CV animé |
| `0_final` | **à confirmer** — animation avec alpha, 10 s, cover quasi noire |
| `Vf Courtmetrage Horizon` | Horizon — Court-métrage |
| `elvis-montage-final grand huit` | Grand Huit — Montage |
| `Elvis Corbieres Solidaire V2` | Corbières Solidaire — Reportage |
| `Halte au Conservatoire - Stage de prise de vue` | Halte au Conservatoire — Captation |
| `Le bal des jeux - Stage de Prise de Vue` | Le Bal des Jeux — Captation |
| `Tdi Reportage E2 G2` | TDI — Reportage |
| `Trailler_Kylian` | A Simple Riot — Teaser |
| `Hugo_Short` | Hugo — Format court |
| `03-3 OUTILS INDISPENSABLE` | 3 outils indispensables — E-commerce |
| `Unboxing 10Plus Roues - V2.1 Colo On` | 10Plus Roues — Unboxing |
| `v2.1` | Vlog Tunisie |
| `V4.2 Hq` | Blindtest Rappaz |

Les `id` restent inchangés : ils servent de clé React et de correspondance avec `content.json` pour retrouver les fichiers sources locaux.

### 2. Clips d'aperçu légers (B2)

Nouveau champ `previewUrl: string` dans `Project`. `ProjectCard` lit `previewUrl` pour le survol et l'appui long ; `VideoModal` continue de lire `videoUrl` en pleine qualité.

**Génération :** un extrait de 6 s, muet, largeur 640 px, encodé en H.264 CRF 30 avec `-movflags +faststart`. Le point de départ est le même timestamp que celui utilisé pour la cover, afin que le clip enchaîne visuellement depuis l'image fixe. Poids visé : environ 400 Ko par clip.

**Timestamps de départ.** Les scripts qui ont produit les covers ont été supprimés après usage ; les valeurs sont consignées ici pour que les clips restent alignés sur les images fixes.

Douze projets suivent la règle automatique `max(0.5, min(durée × 0.2, durée − 0.3, 15))`. Les onze autres avaient été recadrés à la main après revue des planches-contact :

| Projet | Départ (s) |
|---|---|
| `VF_LogoMotion_FCEM` | 1.4 |
| `VF_LogoMotion_BABA` | 1.5 |
| `VF_LogoMotion_RiseUP` | 1.7 |
| `03-3 OUTILS INDISPENSABLE` | 2.1 |
| `VF_LogoMotion_Horizon` | 3.7 |
| `VF_LogoMotion_Versologic` | 3.7 |
| `VF_LogoMotion_MJP` | 4.0 |
| `VF_LogoMotion_Bourrelier` | 4.0 |
| `VF_CVMOTION_Laura` | 11.8 |
| `Hugo_Short` | 12.6 |
| `Trailler_Kylian` | 28.0 |

Pour les clips plus courts que 6 s (`VF_LogoMotion_BABA` dure 2,6 s, `VF_LogoMotion_FCEM` 2,5 s, `LFO_transitions_IN` 3,0 s, `VF_LogoMotion_RiseUP` 3,0 s), le départ est ramené à 0 et le clip couvre la vidéo entière — elle est déjà plus légère que la cible.

**Destination :** `https://3lvx-portfolio.sirv.com/web/<slug>-preview.mp4`, même convention de nommage que les covers (`<slug>-cover.jpg`) et les vidéos (`<slug>.mp4`).

**Coût de stockage :** environ 10 Mo pour les 23 clips. Le compte Sirv est à 1,33 Go sur 5 Go — aucun risque de dépassement, contrairement à l'épisode du 2026-07-31 où les masters bruts avaient saturé le quota.

**Sources :** les fichiers locaux dans `assets/`, retrouvés via `content.json` comme pour les covers. Les masters ayant été supprimés de Sirv, `assets/` est la seule source.

### 3. Emplacement du showreel

Composant `Showreel.tsx` inséré entre le hero plein écran et `ProjectGrid`. Il lit une constante `SHOWREEL_URL` exportée depuis `src/lib/showreel.ts`, initialisée à `null`, et **ne rend rien tant qu'elle vaut `null`**. Aucun espace vide, aucun conteneur, aucune bordure.

Quand la bande démo existera : transcodage et upload comme pour les autres vidéos, puis renseignement de la constante. Le composant affichera alors un lecteur pleine largeur en lecture automatique muette et en boucle, avec un bouton de réactivation du son.

### 4. Lot de corrections techniques

**SEO (S1)** — Dans `layout.tsx` : titre `Elvis Perros — Monteur Vidéo & Motion Designer`, description orientée prestation, bloc `openGraph` complet (`title`, `description`, `url`, `type: "website"`, `locale: "fr_FR"`, `images`) et `twitter: { card: "summary_large_image" }`. L'image de partage est `https://3lvx-portfolio.sirv.com/web/vf-courtmetrage-horizon-cover.jpg` (gros plan cinématographique, lisible en vignette réduite), déclarée en 1200×630 via les paramètres de redimensionnement Sirv. Ajout de `src/app/robots.ts` et `src/app/sitemap.ts` (conventions Next.js App Router). L'URL de production n'étant pas encore connue, elle est centralisée dans `src/lib/site.ts` sous forme de constante `SITE_URL`, à mettre à jour au moment du déploiement.

**Reduced motion (S2)** — Dans `globals.css`, un bloc `@media (prefers-reduced-motion: reduce)` qui ramène animations et transitions à une durée négligeable. Côté React, un hook `useReducedMotion` de `framer-motion` conditionne les décalages de cascade et la révélation du titre. `CustomCursor` se désactive complètement dans ce mode.

**Modale (S3)** — `role="dialog"`, `aria-modal="true"`, `aria-label` reprenant le titre du projet. Au montage : mémorisation de l'élément actif, `overflow: hidden` sur `document.body`, focus déplacé sur le bouton de fermeture. Au démontage : restauration du scroll et du focus. Piège à focus sur `Tab` limité aux éléments focusables de la modale.

**Curseur (S4)** — `cursor: none` n'est plus appliqué par la feuille de style globale. `CustomCursor` ajoute une classe `cursor-hidden` sur `document.documentElement` uniquement après avoir vérifié `(pointer: fine)` et monté ses éléments, et la retire à son démontage. Si le JS échoue, le curseur natif reste visible.

**Formats (S5)** — Nouveau champ `aspectRatio: "16/9" | "9/16" | "1/1"` dans `Project`, calculé une fois à la génération des données via `ffprobe`. `VideoModal` applique le ratio réel au conteneur vidéo et plafonne la largeur des formats verticaux pour éviter une modale démesurée. Les cartes de la grille restent en 16:9 pour préserver l'alignement, avec `object-cover` — le recadrage y est acceptable puisque la cover est choisie en connaissance de cause.

**Titres (S6)** — Suppression de `truncate` sur le `<h3>` de `ProjectCard`, remplacé par `line-clamp-2` : deux lignes maximum, plus de coupe au milieu d'un mot.

## Fichiers concernés

**Modifiés**
- `src/types/project.ts` — retrait de `views`/`retention`, ajout de `previewUrl` et `aspectRatio`
- `src/data/projects.json` — titres réécrits, champs mis à jour
- `src/components/ProjectCard.tsx` — suppression de la ligne de stats, `previewUrl` au survol, `line-clamp-2`, respect du reduced motion
- `src/components/VideoModal.tsx` — accessibilité, ratio dynamique
- `src/components/CustomCursor.tsx` — `cursor: none` piloté par le composant, désactivation en reduced motion
- `src/components/ProjectGrid.tsx` — cascade conditionnée au reduced motion
- `src/app/layout.tsx` — métadonnées complètes
- `src/app/globals.css` — retrait du `cursor: none` global, bloc reduced motion
- `src/app/page.tsx` — insertion du `Showreel`

**Créés**
- `src/components/Showreel.tsx`
- `src/lib/showreel.ts`
- `src/lib/site.ts`
- `src/app/robots.ts`
- `src/app/sitemap.ts`

**Scripts temporaires** (scratchpad, supprimés après exécution) — génération des clips d'aperçu et relevé des ratios via `ffprobe`, sur le modèle des scripts de transcodage et de génération de covers déjà utilisés dans ce projet.

## Ordre d'exécution

1. **Données** (B1) — supprime l'affichage « 0 vue » dès la première étape
2. **Clips d'aperçu** (B2) — divise le poids des aperçus par 375
3. **Lot technique** (S1 à S6)
4. **Emplacement showreel** — ne bloque rien, arrive en dernier

## Vérification

- `npm run build` sans erreur à chaque étape
- Grille : aucune mention « 0 », titres lisibles sur deux lignes maximum
- Survol d'une carte : l'onglet réseau montre une requête vers `-preview.mp4` de quelques centaines de kilo-octets, pas le fichier complet
- Modale : ouverture au clavier, `Tab` reste captif, `Échap` ferme, le focus revient sur la carte, le fond ne scrolle pas
- Modale sur `Trailler_Kylian` : format vertical respecté, sujet non coupé
- Simulation de `prefers-reduced-motion: reduce` : plus de cascade, plus de révélation, curseur natif
- `curl` sur la page : les balises `og:` sont présentes dans le HTML servi
- Mobile 375 px : appui long fonctionnel sur le clip léger, curseur natif intact
