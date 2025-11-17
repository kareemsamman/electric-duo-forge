import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const HeroSection = () => {
  const { t, language } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-engineer-working-on-electrical-panel-28342-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'var(--texture-noise)' }} />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px] py-40 md:py-48">
        <div className="max-w-4xl">
          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-white leading-tight tracking-tight">
              {t("hero.title")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed max-w-2xl">
              {t("hero.subtitle")}
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-5">
              <AnimatedButton>
                <Button 
                  asChild 
                  size="lg" 
                  className="h-14 px-8 bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 text-white shadow-lg shadow-accent/20 rounded-xl text-lg font-semibold w-full sm:w-auto"
                >
                  <Link to="/contact">
                    {t("hero.cta.primary")}
                    <ArrowRight className={`${language === "he" ? "mr-2 rotate-180" : "ml-2"}`} size={20} />
                  </Link>
                </Button>
              </AnimatedButton>
              <AnimatedButton>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="h-14 px-8 bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 rounded-xl text-lg font-semibold w-full sm:w-auto"
                >
                  <Link to="/projects">{t("hero.cta.secondary")}</Link>
                </Button>
              </AnimatedButton>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
