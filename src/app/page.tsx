import HeroSection from "@/components/HeroSection";
import ProjectGrid from "@/components/ProjectGrid";
import Footer from "@/components/Footer";
import projectsData from "@/data/projects.json";
import type { Project } from "@/types/project";

// Un projet n'apparaît qu'une fois sa vidéo en ligne (YouTube ou Google Drive).
const projects = (projectsData as Project[]).filter(
  (p) => p.youtubeId || p.driveId
);

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <ProjectGrid projects={projects} />
      <Footer />
    </main>
  );
}
