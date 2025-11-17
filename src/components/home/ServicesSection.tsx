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
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t("services.title")}
          </h2>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={index}>
                <AnimatedCard>
                  <Card className="border-border hover:border-accent hover:shadow-xl transition-all group">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                        <Icon className="text-accent group-hover:text-white transition-colors" size={32} />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">
                        {t(service.titleKey)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
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
