import HeroSection from "@/components/HeroSection";
import ProjectGrid from "@/components/ProjectGrid";
import projectsData from "@/data/projects.json";
import type { Project } from "@/types/project";

const projects = projectsData as Project[];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <ProjectGrid projects={projects} />
    </main>
  );
}
