import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const ProjectsPreview = () => {
  const { t, language } = useLanguage();

  const { data: projects } = useQuery({
    queryKey: ["projects-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            {t("projects.title")}
          </h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            {t("projects.subtitle")}
          </p>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-8 mb-12" staggerDelay={0.15}>
          {projects.map((project) => (
            <StaggerItem key={project.id}>
              <AnimatedCard>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-secondary">
                    <img 
                      src={project.image} 
                      alt={language === "he" ? project.project_name : project.project_name_en || project.project_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-6 pb-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {language === "he" ? project.project_name : project.project_name_en || project.project_name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {language === "he" ? project.location : project.location_en || project.location}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {language === "he" ? project.description : project.description_en || project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(language === "he" ? project.tags : project.tags_en || project.tags)?.slice(0, 3).map((tag: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-xs px-2 py-1 bg-accent/10 text-accent rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.5}>
          <div className="text-center">
            <Link to="/projects">
              <AnimatedButton>
                <Button size="lg" className="group">
                  {t("projects.viewAll")}
                  {language === "he" ? (
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                  ) : (
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  )}
                </Button>
              </AnimatedButton>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ProjectsPreview;
