import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const TeamPreview = () => {
  const { t, language } = useLanguage();

  const { data: team } = useQuery({
    queryKey: ["team-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .order("display_order", { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  if (!team || team.length === 0) return null;

  return (
    <section className="py-32 md:py-40 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t("team.preview.title")}
            </h2>
            <div className="w-20 h-1 bg-accent/30 mx-auto mt-6" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-10 lg:gap-12 mb-16" staggerDelay={0.15}>
          {team.map((member) => (
            <StaggerItem key={member.id}>
              <AnimatedCard>
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]">
                  <div className="aspect-square bg-secondary">
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-8 pb-8 text-center">
                    <h3 className="text-2xl font-bold mb-2 tracking-tight">{member.name}</h3>
                    <p className="text-sm text-accent font-semibold mb-4">
                      {language === "he" ? member.role : member.role_en || member.role}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {language === "he" ? member.description : member.description_en || member.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.5}>
          <div className="text-center">
            <Link to="/about">
              <AnimatedButton>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 rounded-xl text-base font-semibold hover:shadow-md transition-all group"
                >
                  {t("team.preview.viewAll")}
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

export default TeamPreview;
