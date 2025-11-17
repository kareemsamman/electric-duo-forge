import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

const mockProjects = [
  {
    title: "Industrial Complex A",
    location: "Tel Aviv",
    desc: "Main electrical panel installation",
    tags: ["Low Voltage", "Control", "Industry"],
  },
  {
    title: "Medical Center B",
    location: "Jerusalem",
    desc: "High voltage panel upgrade",
    tags: ["High Voltage", "Healthcare"],
  },
  {
    title: "Commercial Building C",
    location: "Haifa",
    desc: "Complete electrical system",
    tags: ["Low Voltage", "Commercial"],
  },
];

const Projects = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">{t("projects.title")}</h1>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {mockProjects.map((project, index) => (
            <Card 
              key={index} 
              className="overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-48 bg-secondary" />
              <CardContent className="pt-6 pb-6">
                <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{project.location}</p>
                <p className="text-sm mb-4">{project.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-3 py-1 bg-accent/10 text-accent rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
