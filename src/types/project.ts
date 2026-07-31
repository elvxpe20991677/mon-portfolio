export type Category = "fiction-documentaire" | "motion-design" | "reseaux-sociaux";

export interface Project {
  id: string;
  title: string;
  clientName: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: string;
  retention?: string;
  category: Category;
  featured: boolean;
}
