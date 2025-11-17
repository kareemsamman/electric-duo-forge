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
    <section className="py-32 md:py-40">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t("projects.title")}
            </h2>
            <div className="w-20 h-1 bg-accent/30 mx-auto mt-6" />
            <p className="text-muted-foreground mt-6 max-w-2xl mx-auto text-base">
              {t("projects.subtitle")}
            </p>
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-10 lg:gap-12 mb-16" staggerDelay={0.15}>
          {projects.map((project) => (
            <StaggerItem key={project.id}>
              <AnimatedCard>
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] group cursor-pointer">
                  <div className="h-56 bg-secondary overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={language === "he" ? project.project_name : project.project_name_en || project.project_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="pt-8 pb-8">
                    <h3 className="text-2xl font-bold mb-3 tracking-tight">
                      {language === "he" ? project.project_name : project.project_name_en || project.project_name}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 mr-2" />
                      {language === "he" ? project.location : project.location_en || project.location}
                    </div>
                    <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                      {language === "he" ? project.description : project.description_en || project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(language === "he" ? project.tags : project.tags_en || project.tags)?.slice(0, 3).map((tag: string, idx: number) => (
                        <span 
                          key={idx}
                          className="text-xs px-3 py-1.5 bg-accent/10 text-accent rounded-lg font-medium"
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
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all group"
                >
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
