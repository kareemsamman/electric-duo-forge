import { useLanguage } from "@/contexts/LanguageContext";
import { Zap, PenTool, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

const services = [
  {
    icon: Zap,
    titleKey: "services.manufacturing.title",
    descKey: "services.manufacturing.desc",
  },
  {
    icon: PenTool,
    titleKey: "services.engineering.title",
    descKey: "services.engineering.desc",
  },
  {
    icon: Wrench,
    titleKey: "services.execution.title",
    descKey: "services.execution.desc",
  },
];

const ServicesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 md:py-40">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t("services.title")}
            </h2>
            <div className="w-20 h-1 bg-accent/30 mx-auto mt-6" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-10 lg:gap-12" staggerDelay={0.15}>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={index}>
                <AnimatedCard>
                  <Card className="h-full transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]">
                    <CardContent className="pt-10 pb-10 text-center">
                      <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-8 transition-all duration-300 group-hover:bg-accent group-hover:scale-105">
                        <Icon className="text-accent transition-colors" size={36} />
                      </div>
                      <h3 className="text-2xl font-bold mb-4 tracking-tight">
                        {t(service.titleKey)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {t(service.descKey)}
                      </p>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default ServicesSection;
