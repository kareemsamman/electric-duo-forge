import { useLanguage } from "@/contexts/LanguageContext";
import { FadeIn } from "@/components/animations/FadeIn";

const YouTubeSection = () => {
  const { language } = useLanguage();

  return (
    <section className="py-32 md:py-40 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="text-center mb-16">
          <FadeIn delay={0.2}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {language === "he" ? "צפו בנו בפעולה" : "Watch Us in Action"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base">
              {language === "he"
                ? "צפו בסרטון וגלו את השירותים והפרויקטים שלנו"
                : "Watch the video and discover our services and projects"}
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.4}>
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl aspect-video">
            <iframe
              src="https://www.youtube.com/embed/wmMEvXiZQbA"
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default YouTubeSection;
