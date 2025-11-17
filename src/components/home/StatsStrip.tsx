import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { FadeIn } from "@/components/animations/FadeIn";
import { motion } from "framer-motion";

const stats = [
  { 
    value: "10+", 
    key: "stats.experience",
    descKey: "stats.experienceDesc"
  },
  { 
    value: "300+", 
    key: "stats.projects",
    descKey: "stats.projectsDesc"
  },
  { 
    value: "400", 
    key: "stats.facility",
    descKey: "stats.facilityDesc"
  },
  { 
    value: "ISO", 
    key: "stats.standards",
    descKey: "stats.standardsDesc"
  },
  { 
    value: "15+", 
    key: "stats.countries",
    descKey: "stats.countriesDesc"
  },
  { 
    value: "98%", 
    key: "stats.delivery",
    descKey: "stats.deliveryDesc"
  },
];

const StatsStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="py-32 md:py-40 bg-secondary/50" dir="rtl">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {t("stats.title")}
            </h2>
            <div className="w-[70px] h-1 bg-gradient-to-r from-[#1A73E8] to-[#00B0FF] mx-auto rounded-full" />
          </div>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" staggerDelay={0.1}>
          {stats.map((stat, index) => (
            <StaggerItem key={index}>
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.15,
                }}
              >
                <Card className="text-center transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                  <CardContent className="pt-10 pb-10 px-6">
                    <div className="text-5xl md:text-6xl font-bold text-[#1A73E8] mb-4 tracking-tight">
                      {stat.value}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-foreground mb-3">
                      {t(stat.key)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(stat.descKey)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default StatsStrip;
