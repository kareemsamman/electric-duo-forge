import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

const About = () => {
  const { t, language } = useLanguage();

  const { data: team } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-8">{t("about.title")}</h1>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <div className="prose prose-lg max-w-none mb-16">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="max-w-2xl mx-auto mb-20 hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-32 h-32 bg-secondary rounded-full mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-2">{t("about.founder.name")}</h3>
              <p className="text-accent mb-4">{t("about.founder.title")}</p>
              <p className="text-muted-foreground">
                {t("hero.subtitle")}
              </p>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Team Section */}
        {team && team.length > 0 && (
          <div>
            <FadeIn delay={0.4}>
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                {t("about.team.title")}
              </h2>
            </FadeIn>
            <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
              {team.map((member) => (
                <StaggerItem key={member.id}>
                  <AnimatedCard>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="aspect-square bg-secondary">
                        <img 
                          src={member.photo} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="pt-6 pb-6 text-center">
                        <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                        <p className="text-sm text-accent mb-3">
                          {language === "he" ? member.role : member.role_en || member.role}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === "he" ? member.description : member.description_en || member.description}
                        </p>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
