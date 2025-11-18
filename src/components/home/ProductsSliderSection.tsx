import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

const ProductsSliderSection = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: projects } = useQuery({
    queryKey: ["projects-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const handlePrevious = () => {
    if (!projects) return;
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const handleNext = () => {
    if (!projects) return;
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  };

  if (!projects || projects.length === 0) return null;

  const currentProject = projects[currentSlide];

  return (
    <section 
      className="relative w-full min-h-screen py-20 md:py-32"
      style={{
        background: "linear-gradient(135deg, #050816 0%, #020617 100%)"
      }}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-12 max-w-[1600px] h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center min-h-[80vh]">
          {/* Text Column - Right side in RTL */}
          <FadeIn className="lg:col-span-5 order-2 lg:order-1" delay={0.2}>
            <div className="text-right space-y-6">
              {/* Section Label */}
              <div className="text-[#3B82F6] text-xs md:text-sm font-bold tracking-widest uppercase">
                {content["projectsslider.label"] || "פרויקטים נבחרים"}
              </div>

              {/* Main Heading */}
              <h2 className="text-3xl md:text-4xl lg:text-[36px] font-bold text-[#F9FAFB] leading-tight">
                {content["projectsslider.title"] || "מתוך הפרויקטים שלנו"}
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-[#9CA3AF] leading-relaxed max-w-xl">
                {content["projectsslider.description"] || "פרויקטים מורכבים וייחודיים שביצענו עבור לקוחות בכל הארץ"}
              </p>

              {/* Buttons Row */}
              <div className="flex gap-4 pt-4" dir={language === "he" ? "rtl" : "ltr"}>
                <button
                  className="px-8 py-3 rounded-full bg-[#2563EB] text-[#F9FAFB] font-semibold hover:bg-[#3B82F6] transition-all duration-300 hover:scale-105"
                >
                  {language === "he" ? "לכל המוצרים" : "All Products"}
                </button>
                <button
                  className="px-8 py-3 rounded-full bg-transparent border border-[rgba(148,163,184,0.4)] text-[#E5E7EB] font-semibold hover:border-[rgba(148,163,184,0.6)] transition-all duration-300"
                >
                  {language === "he" ? "צור קשר" : "Contact"}
                </button>
              </div>
            </div>
          </FadeIn>

          {/* Slider Column - Left side in RTL */}
          <FadeIn className="lg:col-span-7 order-1 lg:order-2" delay={0.4}>
            <div className="relative w-full h-[60vh] md:h-[65vh] lg:h-[70vh]">
              {/* Main Image */}
              <div className="relative w-full h-full rounded-[20px] overflow-hidden shadow-2xl">
                <img
                  src={currentProject.image}
                  alt={language === "he" ? currentProject.project_name : currentProject.project_name_en || currentProject.project_name}
                  className="w-full h-full object-cover"
                />

                {/* Overlay Details Panel */}
                <div 
                  className="absolute bottom-6 right-6 w-[320px] md:w-[380px] p-5 md:p-6 rounded-2xl space-y-3"
                  style={{
                    background: "rgba(15, 23, 42, 0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
                  }}
                >
                  {/* Project Name */}
                  <h3 className="text-xl md:text-[22px] font-bold text-[#F9FAFB]">
                    {language === "he" ? currentProject.project_name : currentProject.project_name_en || currentProject.project_name}
                  </h3>

                  {/* Location */}
                  <p className="text-sm md:text-[15px] text-[#E5E7EB]">
                    {language === "he" ? currentProject.location : currentProject.location_en || currentProject.location}
                  </p>

                  {/* Short Description */}
                  <p className="text-sm text-[#9CA3AF] line-clamp-3">
                    {language === "he" ? currentProject.description : currentProject.description_en || currentProject.description}
                  </p>

                  {/* Tags */}
                  {currentProject.tags && currentProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(language === "he" ? currentProject.tags : currentProject.tags_en || currentProject.tags).slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs rounded-full"
                          style={{
                            background: "rgba(15, 23, 42, 0.9)",
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            color: "#E5E7EB"
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    className="w-full mt-3 px-6 py-2.5 rounded-full bg-[#2563EB] text-[#F9FAFB] font-semibold hover:bg-[#3B82F6] transition-all duration-300 hover:scale-105"
                  >
                    <span>{language === "he" ? "לצפייה בפרויקט" : "View Project"}</span>
                  </button>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
                style={{
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(148, 163, 184, 0.4)"
                }}
                aria-label="Previous product"
              >
                <ChevronLeft size={20} className="text-[#E5E7EB]" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 z-10"
                style={{
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(148, 163, 184, 0.4)"
                }}
                aria-label="Next product"
              >
                <ChevronRight size={20} className="text-[#E5E7EB]" />
              </button>

              {/* Pagination Dots */}
              <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 flex gap-2">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{
                      background: index === currentSlide ? "#3B82F6" : "rgba(148, 163, 184, 0.4)"
                    }}
                    aria-label={`Go to project ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default ProductsSliderSection;
