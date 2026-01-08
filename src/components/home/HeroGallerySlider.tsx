import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn } from "@/components/animations/FadeIn";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface GalleryItem {
  id: string;
  image: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
}

interface VideoSection {
  id: string;
  video_url: string;
  video_title: string;
  video_title_en: string | null;
  video_description: string | null;
  video_description_en: string | null;
}

const HeroGallerySlider = () => {
  const { language } = useLanguage();
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  // Fetch gallery images
  const { data: galleryItems } = useQuery({
    queryKey: ["hero-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  // Fetch videos
  const { data: videoSections } = useQuery({
    queryKey: ["hero-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_sections")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as VideoSection[];
    },
  });

  // Combine gallery items and videos into slides
  const slides = [
    ...(videoSections || []).map((video) => ({
      id: video.id,
      type: "video" as const,
      url: video.video_url,
      title: language === "he" ? video.video_title : video.video_title_en || video.video_title,
      description: language === "he" ? video.video_description : video.video_description_en || video.video_description,
    })),
    ...(galleryItems || []).map((item) => ({
      id: item.id,
      type: "image" as const,
      url: item.image,
      title: language === "he" ? item.title : item.title_en || item.title,
      description: language === "he" ? item.description : item.description_en || item.description,
    })),
  ];

  const toggleVideo = (id: string) => {
    const video = videoRefs.current[id];
    if (video) {
      if (playingVideo === id) {
        video.pause();
        setPlayingVideo(null);
      } else {
        // Pause any playing video
        Object.values(videoRefs.current).forEach(v => v?.pause());
        video.play();
        setPlayingVideo(id);
      }
    }
  };

  if (slides.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1400px]">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {language === "he" ? "מתוך העבודות שלנו" : "Our Work"}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === "he" 
                ? "תמונות וסרטונים מפרויקטים שביצענו עבור לקוחותינו"
                : "Photos and videos from projects we've completed for our clients"}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div dir={language === "he" ? "rtl" : "ltr"}>
            <Carousel
              opts={{
                align: "center",
                loop: true,
                direction: language === "he" ? "rtl" : "ltr",
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {slides.map((slide) => (
                  <CarouselItem key={slide.id} className="pl-4 md:basis-4/5 lg:basis-3/4">
                    <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl group">
                      {slide.type === "video" ? (
                        <>
                          <video
                            ref={(el) => { videoRefs.current[slide.id] = el; }}
                            src={slide.url}
                            className="w-full h-full object-cover"
                            loop
                            muted
                            playsInline
                            onEnded={() => setPlayingVideo(null)}
                          />
                          {/* Play/Pause overlay */}
                          <button
                            onClick={() => toggleVideo(slide.id)}
                            className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors cursor-pointer"
                          >
                            <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              {playingVideo === slide.id ? (
                                <Pause className="w-8 h-8 text-primary" />
                              ) : (
                                <Play className="w-8 h-8 text-primary ml-1" />
                              )}
                            </div>
                          </button>
                        </>
                      ) : (
                        <img
                          src={slide.url}
                          alt={slide.title || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      
                      {/* Title overlay */}
                      {slide.title && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 md:p-8">
                          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {slide.title}
                          </h3>
                          {slide.description && (
                            <p className="text-sm md:text-base text-gray-200 line-clamp-2">
                              {slide.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 lg:-left-6 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all w-12 h-12 border-0" />
              <CarouselNext className="hidden md:flex -right-4 lg:-right-6 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl transition-all w-12 h-12 border-0" />
            </Carousel>
          </div>
        </FadeIn>

        {/* Dots/indicators could be added here */}
      </div>
    </section>
  );
};

export default HeroGallerySlider;
