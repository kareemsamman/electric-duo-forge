import { useLanguage } from "@/contexts/LanguageContext";
import ServicesSection from "@/components/home/ServicesSection";

const Solutions = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          {t("services.title")}
        </h1>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
          {t("hero.subtitle")}
        </p>
      </div>
      <ServicesSection />
    </div>
  );
};

export default Solutions;
