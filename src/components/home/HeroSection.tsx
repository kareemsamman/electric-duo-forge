import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/animations/AnimatedButton";
import heroImage from "@/assets/hero-electrical-room.jpg";

const HeroSection = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };
  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 24
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const
      }
    }
  };
  return <section className="relative min-h-screen flex items-center overflow-hidden" style={{
    backgroundImage: `url(${heroImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-16 py-32 md:py-40">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl space-y-8">
          {/* Title with word-by-word reveal */}
          <motion.h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-white lg:text-6xl">
            {(content["hero.title"] || "").split(" ").map((word, index) => (
              <motion.span key={index} variants={wordVariants} className="inline-block mr-3 md:mr-4">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={wordVariants} className="text-xl md:text-2xl leading-relaxed max-w-2xl" style={{color: '#E0E0E0'}}>
            {content["hero.subtitle"] || ""}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={wordVariants} className="flex flex-col sm:flex-row gap-4">
            <AnimatedButton>
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-white rounded-full text-base font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-[1.03]"
                style={{backgroundColor: '#1A73E8'}}
                onMouseEnter={e => {e.currentTarget.style.backgroundColor = '#155BB7';}}
                onMouseLeave={e => {e.currentTarget.style.backgroundColor = '#1A73E8';}}
              >
                <Link to="/contact" className="relative z-10">
                  {content["hero.cta.primary"] || "Contact Us"}
                  <ArrowRight className={`${language === "he" ? "mr-2 rotate-180" : "ml-2"}`} size={20} />
                </Link>
              </Button>
            </AnimatedButton>
            <AnimatedButton>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-8 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/40 rounded-full text-base font-semibold w-full sm:w-auto transition-all duration-300"
              >
                <Link to="/projects">{content["hero.cta.secondary"] || "Our Projects"}</Link>
              </Button>
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </div>
    </section>;
};
export default HeroSection;