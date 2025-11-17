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
          className="w-full h-full object-cover opacity-30"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-engineer-working-on-electrical-panel-28342-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(210,100%,8%)] via-[hsl(210,80%,15%)] to-[hsl(210,50%,25%)]" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px] py-32 md:py-40">
        <div className="max-w-3xl">
          <FadeIn delay={0.2}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
              {t("hero.title")}
            </h1>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-xl md:text-2xl mb-10 text-white/90">
              {t("hero.subtitle")}
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4">
              <AnimatedButton>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-white w-full">
                  <Link to="/contact">
                    {t("hero.cta.primary")}
                    <ArrowRight className={`${language === "he" ? "mr-2 rotate-180" : "ml-2"}`} size={20} />
                  </Link>
                </Button>
              </AnimatedButton>
              <AnimatedButton>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full">
                  <Link to="/projects">{t("hero.cta.secondary")}</Link>
                </Button>
              </AnimatedButton>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};

export default HeroSection;
