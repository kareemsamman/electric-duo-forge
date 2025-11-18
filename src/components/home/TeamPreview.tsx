import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn } from "@/components/animations/FadeIn";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const TeamPreview = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const { data: team } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (!team || team.length === 0) return null;

  return (
    <section 
      className="relative min-h-screen flex items-stretch overflow-hidden"
      style={{
        background: 'var(--gradient-cta)',
      }}
      dir={language === "he" ? "rtl" : "ltr"}
    >
      {/* Two Column Layout */}
      <div className="w-full flex flex-col lg:flex-row">
        
        {/* Text Side - 30% (Always first in visual order) */}
        <div className="w-full lg:w-[30%] flex items-center justify-center px-6 md:px-12 py-16 lg:py-0 relative z-10">
          <FadeIn>
            <div className={`max-w-lg ${language === "he" ? "text-right" : "text-left"}`}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                {content["team.title"] || "הצוות שלנו"}
              </h2>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                {content["team.subtitle"] || "צוות מקצועי עם ניסיון רב שנים בתחום החשמל והאנרגיה"}
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Subtle Gradient Fade Between Columns */}
        <div 
          className={`hidden lg:block absolute top-0 bottom-0 w-32 z-[5] pointer-events-none ${
            language === "he" 
              ? "left-[30%] bg-gradient-to-l from-transparent via-[hsl(var(--navy-mid))] to-transparent" 
              : "left-[30%] bg-gradient-to-r from-transparent via-[hsl(var(--navy-mid))] to-transparent"
          }`}
        />

        {/* Team Slider Side - 70% (Always second in visual order) */}
        <div className="w-full lg:w-[70%] relative">
          <div className="h-full py-12 lg:py-0 flex items-center">
            <Carousel
              opts={{
                align: "center",
                loop: true,
                direction: language === "he" ? "rtl" : "ltr",
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-6">
                {team.map((member) => (
                  <CarouselItem 
                    key={member.id} 
                    className="pl-4 md:pl-6 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <div className="group relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden cursor-pointer">
                      {/* Full Image Background */}
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                      {/* Glass Info Panel */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <div 
                          className="bg-white/10 backdrop-blur-lg border border-white/25 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/35"
                          dir={language === "he" ? "rtl" : "ltr"}
                        >
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                            {member.name}
                          </h3>
                          <p className="text-base md:text-lg text-white/90 font-medium mb-3">
                            {language === "he" ? member.role : member.role_en || member.role}
                          </p>
                          <p className="text-sm text-white/70 leading-relaxed">
                            {language === "he" ? member.description : member.description_en || member.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Arrows */}
              <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-4 right-4 justify-between pointer-events-none z-20">
                <CarouselPrevious className="pointer-events-auto relative left-0 translate-x-0 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 text-white shadow-xl" />
                <CarouselNext className="pointer-events-auto relative right-0 translate-x-0 bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 text-white shadow-xl" />
              </div>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamPreview;
