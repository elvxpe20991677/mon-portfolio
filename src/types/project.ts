export type Category = "fiction-documentaire" | "motion-design" | "reseaux-sociaux";

export interface Project {
  id: string;
  title: string;
  clientName?: string;
  thumbnailUrl: string;
  /** Clip muet de quelques secondes, servi par le site, pour l'aperçu au survol. */
  previewUrl: string;
  /** Identifiant de la vidéo YouTube (non répertoriée). Absent tant qu'elle n'est pas en ligne. */
  youtubeId?: string;
  /** Identifiant d'un fichier Google Drive partagé (« Tous les utilisateurs disposant du lien »). */
  driveId?: string;
  /** largeur / hauteur de la vidéo (16/9 ≈ 1.778, vertical 9/16 = 0.5625). */
  aspectRatio: number;
  category: Category;
  featured: boolean;
}
