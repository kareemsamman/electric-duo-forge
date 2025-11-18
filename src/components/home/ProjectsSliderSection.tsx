import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Tag } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";

const ProjectsSliderSection = () => {
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
        .limit(6);

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
      className="relative w-full min-h-screen flex items-center py-20 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #050816 0%, #020617 100%)"
      }}
    >
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
        <div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
          dir={language === "he" ? "rtl" : "ltr"}
        >
          {/* Text Column (Right in RTL, Left in LTR) */}
          <div className="lg:col-span-5 order-2 lg:order-1 text-center lg:text-right">
            <FadeIn>
              <div className="space-y-6">
                {/* Section Label */}
                <p className="text-xs md:text-sm font-bold tracking-widest uppercase text-[#3B82F6]">
                  {content["projectsslider.label"] || "מתוך הפרויקטים שלנו"}
                </p>

                {/* Main Heading */}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#F9FAFB] leading-tight">
                  {content["projectsslider.title"] || "פרויקטים שמדברים בשבילנו"}
                </h2>

                {/* Description */}
                <p className="text-base md:text-lg text-[#9CA3AF] leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {content["projectsslider.description"] || "כל פרויקט הוא סיפור של מצוינות טכנית, עמידה בלוחות זמנים ושביעות רצון לקוח. צפו בחלק מהפרויקטים המובילים שלנו."}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-4">
                  <a 
                    href="/projects"
                    className="px-6 py-3 bg-[#2563EB] text-[#F9FAFB] rounded-full font-semibold hover:bg-[#3B82F6] transition-all duration-300 hover:scale-105"
                  >
                    {language === "he" ? "כל הפרויקטים" : "All Projects"}
                  </a>
                  <a 
                    href="/contact"
                    className="px-6 py-3 bg-transparent border border-[rgba(148,163,184,0.4)] text-[#E5E7EB] rounded-full font-semibold hover:bg-[rgba(148,163,184,0.1)] transition-all duration-300"
                  >
                    {language === "he" ? "צור קשר" : "Contact Us"}
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Slider Column (Left in RTL, Right in LTR) */}
          <div className="lg:col-span-7 order-1 lg:order-2 relative">
            <div className="relative aspect-[4/3] md:aspect-video lg:h-[65vh] w-full">
              {/* Main Image */}
              <div className="relative w-full h-full rounded-[18px] md:rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <img
                  src={currentProject.image}
                  alt={language === "he" ? currentProject.project_name : currentProject.project_name_en || currentProject.project_name}
                  className="w-full h-full object-cover transition-transform duration-700"
                />

                {/* Overlay Details Panel */}
                <div 
                  className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-auto md:right-8 w-auto md:w-[360px] lg:w-[380px]"
                  style={{
                    background: "rgba(15, 23, 42, 0.85)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)"
                  }}
                >
                  {/* Project Name */}
                  <h3 className="text-xl md:text-2xl font-bold text-[#F9FAFB] mb-2">
                    {language === "he" ? currentProject.project_name : currentProject.project_name_en || currentProject.project_name}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-[#CBD5E1] mb-4">
                    <MapPin size={16} className="text-[#60A5FA]" />
                    <span>{language === "he" ? currentProject.location : currentProject.location_en || currentProject.location}</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#E5E7EB] mb-4 line-clamp-2">
                    {language === "he" ? currentProject.description : currentProject.description_en || currentProject.description}
                  </p>

                  {/* Tags */}
                  {currentProject.tags && currentProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(language === "he" ? currentProject.tags : currentProject.tags_en || currentProject.tags).slice(0, 3).map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 text-xs rounded-full text-[#E5E7EB] border"
                          style={{
                            background: "rgba(15, 23, 42, 0.9)",
                            borderColor: "rgba(148, 163, 184, 0.3)"
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <a
                    href={`/projects`}
                    className="inline-block w-full text-center px-4 py-2 bg-[#2563EB] text-[#F9FAFB] rounded-full text-sm font-semibold hover:bg-[#3B82F6] transition-all duration-300 hover:scale-105"
                  >
                    {language === "he" ? "לצפייה בפרויקט" : "View Project"}
                  </a>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevious}
                className="absolute top-1/2 -translate-y-1/2 left-4 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
                style={{
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  backdropFilter: "blur(8px)"
                }}
                aria-label={language === "he" ? "הקודם" : "Previous"}
              >
                <ChevronLeft size={24} className="text-[#E5E7EB]" />
              </button>

              <button
                onClick={handleNext}
                className="absolute top-1/2 -translate-y-1/2 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10"
                style={{
                  background: "rgba(15, 23, 42, 0.85)",
                  border: "1px solid rgba(148, 163, 184, 0.4)",
                  backdropFilter: "blur(8px)"
                }}
                aria-label={language === "he" ? "הבא" : "Next"}
              >
                <ChevronRight size={24} className="text-[#E5E7EB]" />
              </button>

              {/* Pagination Dots */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                {projects.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? "w-8 bg-[#3B82F6]"
                        : "bg-[rgba(148,163,184,0.4)] hover:bg-[rgba(148,163,184,0.6)]"
                    }`}
                    aria-label={`${language === "he" ? "עבור לשקף" : "Go to slide"} ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSliderSection;
