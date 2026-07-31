# 🎬 PROJET : Portfolio Monteur Vidéo Haute Conversion

## 🎯 1. CONTEXTE ET OBJECTIF COMMERCIAL
- **Cible :** Créateurs de contenu (YouTubeurs), Agences Web, Marques.
- **Objectif principal :** Démontrer la capacité à retenir l'attention (Watch Time) et générer des leads (Prises de contact).
- **Règle d'or de l'UX :** Zéro friction. Les vidéos doivent se lancer en 1 clic sans jamais faire quitter le site à l'utilisateur.

## 🛠 2. STACK TECHNIQUE DÉTAILLÉE
- **Framework :** Next.js 14+ (App Router obligatoire).
- **Langage :** TypeScript (Typage strict pour éviter les erreurs de rendu).
- **Styling :** Tailwind CSS.
- **Animations :** Framer Motion (Utilisation parcimonieuse : uniquement pour le *fade-in* au chargement et les micro-interactions au *hover*).
- **Icônes :** Lucide React.
- **Hébergement :** Vercel (Optimisation Edge et Image requise).
- **Base de données :** Fichier local statique `src/data/projects.json`[cite: 1].

## 🎨 3. DESIGN SYSTEM (Le "Look & Feel")
- **Thème global :** "Deep Dark Mode" premium[cite: 1].
- **Palette de couleurs :**
  - Background principal : `#0A0A0A` (Presque noir).
  - Background secondaire (Cartes/Modales) : `#111111` ou `zinc-900`.
  - Texte principal : `#EDEDED` (Gris très clair, évite le blanc pur pour la fatigue visuelle).
  - Texte secondaire (Stats, sous-titres) : `#A1A1AA` (zinc-400).
  - Accent / Call-to-Action : Un rouge vif ou un violet électrique (ex: `#E53935` ou `#6D28D9`) pour contraster avec le fond sombre et attirer l'œil.
- **Typographie :** 
  - *Inter* ou *Geist* pour l'ensemble du site[cite: 1]. 
  - Titres en `font-bold` avec un `tracking-tight` (lettres légèrement resserrées).
  - Chiffres (Stats) en `font-mono` pour un aspect analytique et précis.
- **Formes :** Bordures subtiles (`border-zinc-800`), coins très légèrement arrondis (`rounded-md` ou `rounded-lg`, pas de ronds excessifs)[cite: 1].

## 🏗 4. ARCHITECTURE DES COMPOSANTS CLÉS
L'IA doit structurer le code autour de ces composants précis :
1. **`HeroSection` :** Une accroche textuelle percutante en gros, centrée, avec un bouton "Voir mon travail" et un bouton "Me contacter".
2. **`ProjectGrid` :** Grille responsive (`grid-cols-1` sur mobile, `md:grid-cols-2`, `lg:grid-cols-3`).
3. **`ProjectCard` :** 
   - Miniature de la vidéo avec effet de zoom subtil au survol (`hover:scale-105 transition-transform duration-300`).
   - Superposition d'un bouton "Play".
   - Sous la vidéo : Titre du projet, Nom du client, et **Badges de statistiques** (ex: "👁️ 1.2M Vues", "📈 65% Rétention").
4. **`VideoModal` :** Lorsqu'on clique sur une carte, ouverture d'une modale assombrissant le fond (`backdrop-blur-sm`). La vidéo s'affiche via un composant iFrame (YouTube/Vimeo) et se lance automatiquement (`autoplay=1`).

## 🚀 5. RÈGLES DE PERFORMANCE ET OPTIMISATION (Vercel)
- **Images :** Utiliser obligatoirement le composant `next/image` de Next.js pour toutes les miniatures afin d'optimiser le poids et le chargement (Lazy loading natif).
- **Vidéos :** AUCUNE vidéo `.mp4` ne doit être hébergée localement ou dans le dossier `public/`. Tout passe par des iFrames externes.
- **Rendu :** Les composants contenant la logique de la modale doivent avoir la directive `"use client"`. Le reste de la page doit être rendu côté serveur (Server Components) pour un chargement instantané.

## 💾 6. STRUCTURE DES DONNÉES (projects.json)
Le fichier JSON doit respecter cette interface TypeScript :
```typescript
interface Project {
  id: string;
  title: string;
  clientName: string;
  thumbnailUrl: string;
  videoUrl: string; // Lien embed YouTube/Vimeo
  views: string;
  retention?: string; // Optionnel
  category: "Short" | "Long Format" | "Documentaire";
}