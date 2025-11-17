import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { FadeIn } from "@/components/animations/FadeIn";

const stats = [
  { value: "10+", key: "stats.experience" },
  { value: "300+", key: "stats.projects" },
  { value: "400", key: "stats.facility" },
  { value: "ISO", key: "stats.standards" },
];

const StatsStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 md:py-40 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t("stats.title")}
            </h2>
            <div className="w-20 h-1 bg-accent/30 mx-auto mt-6" />
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-12" staggerDelay={0.1}>
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <AnimatedCard>
                <Card className="text-center transition-all duration-300 hover:shadow-[var(--shadow-card-hover)]">
                  <CardContent className="pt-10 pb-10">
                    <div className="text-5xl md:text-6xl font-bold text-accent mb-3 tracking-tight">
                      {stat.value}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">
                      {t(stat.key)}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default StatsStrip;
