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
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {language === "he" ? videoSection.video_title : videoSection.video_title_en || videoSection.video_title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {language === "he" ? videoSection.video_description : videoSection.video_description_en || videoSection.video_description}
            </p>
          </div>

          <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden group cursor-pointer animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
              <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Play className="text-primary" size={32} fill="currentColor" />
              </div>
            </div>
            {/* Placeholder for video - will be replaced with actual video */}
            <img 
              src={videoSection.video_url} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover opacity-50"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
