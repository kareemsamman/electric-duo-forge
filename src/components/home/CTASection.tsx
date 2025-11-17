import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const CTASection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-32 md:py-40 bg-[image:var(--gradient-cta)] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'var(--texture-noise)' }} />
      <div className="container relative mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px] text-center">
        <FadeIn>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            {t("cta.title")}
          </h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xl mb-12 text-white/90 max-w-2xl mx-auto leading-relaxed">
            {t("cta.subtitle")}
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <Link to="/contact">
            <AnimatedButton>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-10 bg-white text-accent hover:bg-white/90 border-0 rounded-xl text-base font-semibold shadow-xl hover:shadow-2xl transition-all"
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
