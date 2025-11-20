import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

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
  const videoUrl = content["hero.video_url"] || "https://cdn.pixabay.com/video/2023/09/04/178622-861162226_large.mp4";

  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-16 py-32 md:py-40">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto">
          {/* Title with word-by-word reveal */}
          <motion.h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-white">
            {(content["hero.title"] || "").split(" ").map((word, index) => (
              <motion.span key={index} variants={wordVariants} className="inline-block mr-3 md:mr-4">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={wordVariants} className="text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-3xl" style={{color: '#E0E0E0'}}>
            {content["hero.subtitle"] || ""}
          </motion.p>

          {/* Buttons */}
          <motion.div variants={wordVariants} className="flex flex-col sm:flex-row gap-6 mt-4">
            <AnimatedButton>
              <Button
                asChild
                size="lg"
                className="h-16 px-12 text-white rounded-full text-lg font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-[1.03] shadow-[0_8px_30px_rgba(26,115,232,0.4)] hover:shadow-[0_12px_40px_rgba(26,115,232,0.6)]"
                style={{backgroundColor: '#1A73E8'}}
                onMouseEnter={e => {e.currentTarget.style.backgroundColor = '#155BB7';}}
                onMouseLeave={e => {e.currentTarget.style.backgroundColor = '#1A73E8';}}
              >
                <Link to="/contact" className="relative z-10">
                  {content["hero.cta.primary"] || "Contact Us"}
                  <ArrowRight className={`${language === "he" ? "mr-2 rotate-180" : "ml-2"}`} size={22} />
                </Link>
              </Button>
            </AnimatedButton>
            <AnimatedButton>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-16 px-12 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-full text-lg font-semibold w-full sm:w-auto transition-all duration-300"
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