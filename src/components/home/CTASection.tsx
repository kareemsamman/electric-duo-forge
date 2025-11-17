import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const CTASection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-[hsl(210,80%,25%)] to-[hsl(210,100%,8%)]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px] text-center">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {t("cta.title")}
          </h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            {t("cta.subtitle")}
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <Link to="/contact">
            <AnimatedButton>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-accent hover:bg-white/90 border-0"
              >
                {t("cta.button")}
                {language === "he" ? (
                  <ArrowLeft className="mr-2" size={20} />
                ) : (
                  <ArrowRight className="ml-2" size={20} />
                )}
              </Button>
            </AnimatedButton>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
};

export default CTASection;
