import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

const stats = [
  { value: "10+", key: "stats.experience" },
  { value: "300+", key: "stats.projects" },
  { value: "400", key: "stats.facility" },
  { value: "ISO", key: "stats.standards" },
];

const StatsStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-secondary">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12" staggerDelay={0.1}>
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <AnimatedCard>
                <Card className="text-center hover:shadow-xl transition-shadow">
                  <CardContent className="pt-8 pb-8">
                    <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                      {stat.value}
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">
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
