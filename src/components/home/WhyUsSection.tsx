import { useLanguage } from "@/contexts/LanguageContext";
import { Award, Clock, Shield, Users, Layers, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

const features = [
  { icon: Award, key: "whyus.iso" },
  { icon: Clock, key: "whyus.delivery" },
  { icon: Shield, key: "whyus.quality" },
  { icon: Users, key: "whyus.service" },
  { icon: Layers, key: "whyus.design" },
  { icon: CheckCircle2, key: "whyus.testing" },
];

const WhyUsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 md:py-40 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <FadeIn>
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                {t("whyus.title")}
              </h2>
              <div className="w-20 h-1 bg-accent/30 mb-8" />
              <p className="text-muted-foreground text-lg leading-relaxed">
                {t("hero.subtitle")}
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 gap-6" staggerDelay={0.1}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <AnimatedCard>
                    <Card className="transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]">
                      <CardContent className="pt-8 pb-8">
                        <Icon className="text-accent mb-5" size={36} />
                        <p className="font-semibold leading-snug text-base">
                          {t(feature.key)}
                        </p>
                      </CardContent>
                    </Card>
                  </AnimatedCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
