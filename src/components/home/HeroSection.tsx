import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import {
  ArrowRight,
  Shield,
  Wrench,
  Zap,
  CheckCircle,
  Clock,
  Users,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/animations/AnimatedButton";
import { FaTiktok } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { SiWaze } from "react-icons/si";

const HeroSection = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 24,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    },
  };

  const backgroundType = content["hero.background_type"] || "video";
  const videoUrl = content["hero.video_url"] || "https://cdn.pixabay.com/video/2023/09/04/178622-861162226_large.mp4";
  const imageDesktopUrl = content["hero.image_desktop_url"] || "";
  const imageMobileUrl = content["hero.image_mobile_url"] || "";

  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    return null;
  };

  const youtubeId = backgroundType === "youtube" ? extractYouTubeId(videoUrl) : null;

  const cards = [
    {
      icon: Shield,
      titleHe: "פתרון אמין למארזים",
      titleEn: "Reliable solution",
    },
    {
      icon: Wrench,
      titleHe: "מותאם לפרויקט שלך",
      titleEn: "Customized",
    },
    {
      icon: Zap,
      titleHe: "טכנולוגיה מתקדמת",
      titleEn: "Advanced tech",
    },
    {
      icon: CheckCircle,
      titleHe: "אישורים ותקנים",
      titleEn: "Certifications",
    },
    {
      icon: Clock,
      titleHe: "זמינות ושירות",
      titleEn: "24/7 Service",
    },
    {
      icon: Users,
      titleHe: "צוות מקצועי",
      titleEn: "Pro team",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - Video, YouTube, or Image */}
      {backgroundType === "youtube" && youtubeId ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${youtubeId}&playsinline=1&modestbranding=1&disablekb=1&fs=0&enablejsapi=1&origin=${window.location.origin}`}
            allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] min-w-[140%] min-h-[140%] border-0 scale-110"
            title="Hero background video"
            frameBorder="0"
          />
        </div>
      ) : backgroundType === "video" ? (
        <video key={videoUrl} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <>
          {imageDesktopUrl && (
            <img src={imageDesktopUrl} alt="Hero background" className="hidden md:block absolute inset-0 w-full h-full object-cover z-0" />
          )}
          {imageMobileUrl && (
            <img src={imageMobileUrl} alt="Hero background" className="block md:hidden absolute inset-0 w-full h-full object-cover z-0" />
          )}
        </>
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Social Media Links - Fixed Left Side */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="fixed top-28 left-6 z-50 hidden md:flex flex-col gap-2.5"
      >
        {content["social.facebook_url"] && (
          <a
            href={content["social.facebook_url"]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/50 
                       flex items-center justify-center text-white transition-all duration-300 
                       hover:bg-black hover:scale-110 shadow-md"
          >
            <Facebook size={16} />
          </a>
        )}

        {content["social.instagram_url"] && (
          <a
            href={content["social.instagram_url"]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/50 
                       flex items-center justify-center text-white transition-all duration-300 
                       hover:bg-black hover:scale-110 shadow-md"
          >
            <Instagram size={16} />
          </a>
        )}

        {content["social.tiktok_url"] && (
          <a
            href={content["social.tiktok_url"]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/50 
                       flex items-center justify-center text-white transition-all duration-300 
                       hover:bg-black hover:scale-110 shadow-md"
          >
            <FaTiktok size={14} />
          </a>
        )}

        {content["social.twitter_url"] && (
          <a
            href={content["social.twitter_url"]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/50 
                       flex items-center justify-center text-white transition-all duration-300 
                       hover:bg-black hover:scale-110 shadow-md"
          >
            <BsTwitterX size={14} />
          </a>
        )}

        {content["social.linkedin_url"] && (
          <a
            href={content["social.linkedin_url"]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/50 
                       flex items-center justify-center text-white transition-all duration-300 
                       hover:bg-black hover:scale-110 shadow-md"
          >
            <Linkedin size={16} />
          </a>
        )}

        {content["social.youtube_url"] && (
          <a
            href={content["social.youtube_url"]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/50 
                       flex items-center justify-center text-white transition-all duration-300 
                       hover:bg-black hover:scale-110 shadow-md"
          >
            <Youtube size={16} />
          </a>
        )}

        {content["social.waze_url"] && (
          <a
            href={content["social.waze_url"]}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-black/80 backdrop-blur-md border border-white/50 
                       flex items-center justify-center text-white transition-all duration-300 
                       hover:bg-black hover:scale-110 shadow-md"
          >
            <SiWaze size={16} />
          </a>
        )}
      </motion.div>

      {/* Content Container */}
      <div className="container relative z-10 mx-auto px-6 md:px-12 lg:px-16 py-32 md:py-40">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center space-y-10 max-w-5xl mx-auto"
        >
          {/* Title with word-by-word reveal */}
          <motion.h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight text-white">
            {(content["hero.title"] || "").split(" ").map((word, index) => (
              <motion.span key={index} variants={wordVariants} className="inline-block mr-3 md:mr-4">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={wordVariants}
            className="text-xl md:text-2xl lg:text-3xl leading-relaxed max-w-3xl"
            style={{ color: "#E0E0E0" }}
          >
            {content["hero.subtitle"] || ""}
          </motion.p>

          {/* Cards - מה שמייחד אותנו */}
          <motion.div variants={wordVariants} className="w-full max-w-6xl mt-12">
            <h3 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">
              {language === "he" ? "מה שמייחד אותנו" : "What Makes Us Special"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-4 text-center"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {language === "he" ? card.titleHe : card.titleEn}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div variants={wordVariants} className="flex flex-col sm:flex-row gap-6 mt-4">
            <AnimatedButton>
              <Button
                asChild
                size="lg"
                className="h-16 px-12 text-white rounded-full text-lg font-semibold w-full sm:w-auto transition-all duration-300 hover:scale-[1.03] shadow-[0_8px_30px_rgba(26,115,232,0.4)] hover:shadow-[0_12px_40px_rgba(26,115,232,0.6)]"
                style={{ backgroundColor: "#1A73E8" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#155BB7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1A73E8";
                }}
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
    </section>
  );
};

export default HeroSection;
