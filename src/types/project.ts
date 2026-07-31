export interface Project {
  id: string;
  title: string;
  clientName: string;
  thumbnailUrl: string;
  videoUrl: string;
  views: string;
  retention?: string;
  category: "Short" | "Long Format" | "Documentaire";
}
