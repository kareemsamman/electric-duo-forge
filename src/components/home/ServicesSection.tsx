import { useLanguage } from "@/contexts/LanguageContext";
import { ClipboardCheck, Factory, Wrench, FlaskConical, Headphones } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const services = [
  {
    icon: ClipboardCheck,
    titleKey: "services.planning.title",
    descKey: "services.planning.desc",
  },
  {
    icon: Factory,
    titleKey: "services.manufacturing.title",
    descKey: "services.manufacturing.desc",
  },
  {
    icon: Wrench,
    titleKey: "services.integration.title",
    descKey: "services.integration.desc",
  },
  {
    icon: FlaskConical,
    titleKey: "services.testing.title",
    descKey: "services.testing.desc",
  },
  {
    icon: Headphones,
    titleKey: "services.maintenance.title",
    descKey: "services.maintenance.desc",
  },
];

const ServicesSection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/20 to-background" dir="rtl">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Right Column - Text (Sticky on desktop) */}
          <FadeIn>
            <div className="lg:sticky lg:top-28">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                {t("services.title")}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                {t("services.subtitle")}
              </p>
              <Link 
                to="/solutions" 
                className="inline-flex items-center gap-2 text-[#1A73E8] hover:text-[#155BB7] font-medium transition-colors group"
              >
                <span>{t("services.viewAll")}</span>
                {language === "he" ? (
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            </div>
          </FadeIn>

          {/* Left Column - Services List */}
          <StaggerContainer className="space-y-1" staggerDelay={0.1}>
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <StaggerItem key={index}>
                  <div className="flex items-start gap-6 py-6 border-b border-border/40 last:border-b-0">
                    <div className="flex-shrink-0 w-14 h-14 bg-[#1A73E8]/10 rounded-full flex items-center justify-center">
                      <Icon className="text-[#1A73E8]" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 tracking-tight">
                        {t(service.titleKey)}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {t(service.descKey)}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
