import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const CTASection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="py-40 md:py-52 bg-gradient-to-b from-[#1a2332] to-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'var(--texture-noise)' }} />
      <div className="container relative mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px] text-center">
        <FadeIn>
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white tracking-tight">
            {t("cta.title")}
          </h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xl md:text-2xl mb-16 text-white/70 max-w-3xl mx-auto leading-relaxed">
            {t("cta.subtitle")}
          </p>
        </FadeIn>
        <FadeIn delay={0.4}>
          <Link to="/contact">
            <AnimatedButton>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-16 px-12 bg-white text-accent hover:bg-white/90 border-0 rounded-xl text-lg font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] transition-all group"
              >
                {t("cta.button")}
                {language === "he" ? (
                  <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={22} />
                ) : (
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={22} />
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
