import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";

const VideoSection = () => {
  const { language } = useLanguage();

  const { data: videoSection } = useQuery({
    queryKey: ["video-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("video_sections")
        .select("*")
        .limit(1)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (!videoSection) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={videoSection.video_url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      </div>

      {/* Centered Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px] text-center animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          {language === "he" ? videoSection.video_title : videoSection.video_title_en || videoSection.video_title}
        </h2>
        <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto">
          {language === "he" ? videoSection.video_description : videoSection.video_description_en || videoSection.video_description}
        </p>
      </div>
    </section>
  );
};

export default VideoSection;
