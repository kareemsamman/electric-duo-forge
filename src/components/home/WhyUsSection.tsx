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
    <section className="py-20 md:py-28 bg-secondary">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t("whyus.title")}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {t("hero.subtitle")}
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-2 gap-6" staggerDelay={0.1}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <AnimatedCard>
                    <Card className="border-border hover:shadow-xl transition-shadow">
                      <CardContent className="pt-6 pb-6">
                        <Icon className="text-accent mb-4" size={32} />
                        <p className="font-medium leading-snug">
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
