import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/animations/AnimatedButton";
import heroImage from "@/assets/hero-electrical-room.jpg";

const HeroSection = () => {
  const { t, language } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* Full-width gradient background */}
      <div className="absolute inset-0 z-0 bg-[image:var(--gradient-hero)]" />

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px] py-32 md:py-40">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Hero Image - Left Side on Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="order-1 lg:order-1"
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-premium)]"
              whileInView={{ y: 0 }}
              initial={{ y: 0 }}
              style={{ willChange: "transform" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <img
                src={heroImage}
                alt="Modern industrial electrical switchgear"
                className="w-full h-auto object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Text Content - Right Side on Desktop */}
          <div className="order-2 lg:order-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Title with word-by-word reveal */}
              <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                {t("hero.title").split(" ").map((word, index) => (
                  <motion.span
                    key={index}
                    variants={wordVariants}
                    className="inline-block mr-3 md:mr-4"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={wordVariants}
                className="text-xl md:text-2xl leading-relaxed max-w-2xl text-muted-foreground"
              >
                {t("hero.subtitle")}
              </motion.p>

              {/* Buttons */}
              <motion.div
                variants={wordVariants}
                className="flex flex-col sm:flex-row gap-4"
              >
                <AnimatedButton>
                  <Button
                    asChild
                    size="lg"
                    className="h-14 px-8 bg-accent hover:bg-accent/90 text-white rounded-full text-base font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-[1.03]"
                  >
                    <Link to="/contact" className="relative z-10">
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
                    className="h-14 px-8 bg-white border-2 border-primary/20 text-primary hover:bg-secondary hover:border-primary/40 rounded-full text-base font-semibold w-full sm:w-auto transition-all duration-300"
                  >
                    <Link to="/projects">{t("hero.cta.secondary")}</Link>
                  </Button>
                </AnimatedButton>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
