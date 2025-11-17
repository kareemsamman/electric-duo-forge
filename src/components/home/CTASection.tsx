import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-primary via-primary to-accent">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px] text-center animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t("cta.title")}
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t("cta.subtitle")}
        </p>
        <Button 
          asChild 
          size="lg" 
          className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300"
        >
          <Link to="/contact">
            {t("cta.button")}
            <ArrowRight className={`${language === "he" ? "mr-2 rotate-180" : "ml-2"}`} size={20} />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
