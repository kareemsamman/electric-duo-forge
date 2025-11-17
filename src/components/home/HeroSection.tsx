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
      {/* Animated Background Layers */}
      <div className="absolute inset-0 z-0">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-35"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-engineer-working-on-electrical-panel-28342-large.mp4" type="video/mp4" />
        </video>
        
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" />
        
        {/* Industrial Texture */}
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'var(--texture-noise)' }} />
        
        {/* Animated Light Streaks */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-r from-transparent via-accent/10 to-transparent blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-l from-transparent via-electric/10 to-transparent blur-3xl animate-[pulse_10s_ease-in-out_infinite_2s]" />
        </div>
        
        {/* Radial Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,27,43,0.4)_100%)]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px] py-48 md:py-56">
        <div className="max-w-5xl">
          <FadeIn delay={0.2}>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-12 text-white leading-[1.1] tracking-tight">
              {t("hero.title")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-2xl md:text-3xl mb-16 text-white/95 leading-relaxed max-w-3xl font-light">
              {t("hero.subtitle")}
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-6">
              <AnimatedButton>
                <Button 
                  asChild 
                  size="lg" 
                  className="h-16 px-10 bg-gradient-to-br from-accent via-accent to-accent/90 hover:from-accent/95 hover:via-accent/90 hover:to-accent/85 text-white shadow-2xl shadow-accent/30 rounded-2xl text-lg font-bold w-full sm:w-auto relative overflow-hidden group"
                >
                  <Link to="/contact" className="relative z-10">
                    <span className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {t("hero.cta.primary")}
                    <ArrowRight className={`${language === "he" ? "mr-2 rotate-180" : "ml-2"}`} size={22} />
                  </Link>
                </Button>
              </AnimatedButton>
              <AnimatedButton>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="h-16 px-10 bg-white/15 backdrop-blur-md border-2 border-white/40 text-white hover:bg-white/25 hover:border-white/60 rounded-2xl text-lg font-bold w-full sm:w-auto transition-all duration-300"
                >
                  <Link to="/projects">{t("hero.cta.secondary")}</Link>
                </Button>
              </AnimatedButton>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
