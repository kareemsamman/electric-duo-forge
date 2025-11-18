import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProjectsSlider = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: galleryData } = useQuery({
    queryKey: ["projects-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("category", "פרויקטים")
        .order("created_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data;
    },
  });

  // Map gallery data to project format
  const projects = galleryData?.map(item => ({
    id: item.id,
    project_name: item.title,
    project_name_en: item.title_en,
    location: "",
    location_en: "",
    description: item.description || "",
    description_en: item.description_en || "",
    image: item.image,
    tags: [],
    tags_en: [],
    created_at: item.created_at
  }));

  const handlePrevious = () => {
    if (!projects) return;
    setCurrentIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!projects) return;
    setCurrentIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  };

  if (!projects || projects.length === 0) return null;

  const currentProject = projects[currentIndex];
  const isHebrew = language === "he";

  return (
    <section
      id="projects"
      className="relative w-full min-h-screen flex items-center py-20 bg-background"
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text column */}
          <div className={`lg:col-span-4 ${isHebrew ? "lg:order-1 text-right" : "lg:order-2 text-left"}`}>
            <div className="mb-3">
              <span className="text-xs md:text-sm font-bold tracking-wider uppercase text-[#3B82F6]">
                {content["projects.label"] || "פרויקטים"}
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-[36px] font-bold mb-6 text-[#0F172A] leading-tight">
              {content["projects.slider.title"] || "מתוך הפרויקטים שלנו"}
            </h2>
            
            <p className="text-base md:text-lg text-[#4B5563] leading-relaxed mb-8">
              {content["projects.slider.description"] || "אנחנו מתמחים בפרויקטים חשמליים מורכבים בכל הארץ, עם דגש על איכות, בטיחות, ועמידה בלוחות זמנים"}
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-[#22C55E] mt-0.5 shrink-0" size={20} />
                <span className="text-[#374151] text-sm md:text-base">
                  {content["projects.slider.bullet1"] || "ניסיון רב בפרויקטים תעשייתיים ומסחריים"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-[#22C55E] mt-0.5 shrink-0" size={20} />
                <span className="text-[#374151] text-sm md:text-base">
                  {content["projects.slider.bullet2"] || "צוות מקצועי ומיומן עם אישורים מלאים"}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="text-[#22C55E] mt-0.5 shrink-0" size={20} />
                <span className="text-[#374151] text-sm md:text-base">
                  {content["projects.slider.bullet3"] || "עמידה בלוחות זמנים ובתקציב"}
                </span>
              </li>
            </ul>

            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-full px-6 py-3 text-sm md:text-base font-semibold transition-all hover:scale-105"
              >
                {content["projects.slider.cta"] || "לכל הפרויקטים"}
              </Button>
              <Button
                variant="outline"
                className="border border-[rgba(148,163,184,0.8)] bg-transparent text-[#111827] hover:bg-slate-50 rounded-full px-6 py-3 text-sm md:text-base font-semibold transition-all"
              >
                {content["projects.slider.cta2"] || "צור קשר"}
              </Button>
            </div>
          </div>

          {/* Slider column */}
          <div className={`lg:col-span-8 relative ${isHebrew ? "lg:order-2" : "lg:order-1"}`}>
            {/* Main Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] rounded-[20px] overflow-hidden shadow-2xl">
              <img
                src={currentProject.image}
                alt={language === "he" ? currentProject.project_name : currentProject.project_name_en || currentProject.project_name}
                className="w-full h-full object-cover transition-transform duration-500"
              />

              {/* Overlay Details Panel */}
              <div
                className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-auto md:right-8 md:w-[360px] bg-[rgba(15,23,42,0.85)] backdrop-blur-lg border border-[rgba(148,163,184,0.35)] rounded-2xl p-6 shadow-xl"
                dir={isHebrew ? "rtl" : "ltr"}
              >
                <h3 className="text-xl md:text-[22px] font-bold text-[#F9FAFB] mb-2">
                  {language === "he" ? currentProject.project_name : currentProject.project_name_en || currentProject.project_name}
                </h3>
                
                <p className="text-sm md:text-[15px] text-[#CBD5F5] mb-4">
                  {language === "he" ? currentProject.location : currentProject.location_en || currentProject.location}
                </p>

                {/* Meta Row */}
                <div className="flex flex-wrap gap-4 mb-4 text-[#9CA3AF] text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-[#60A5FA]" size={16} />
                    <span>{language === "he" ? currentProject.location : currentProject.location_en || currentProject.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="text-[#60A5FA]" size={16} />
                    <span>2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="text-[#60A5FA]" size={16} />
                    <span>{language === "he" ? "הושלם" : "Completed"}</span>
                  </div>
                </div>

                {/* Tags */}
                {currentProject.tags && currentProject.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(language === "he" ? currentProject.tags : currentProject.tags_en || currentProject.tags).slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#0B1120] border border-[rgba(148,163,184,0.3)] text-[#E5E7EB] text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-[#F9FAFB] rounded-full py-2 text-sm font-semibold transition-all hover:scale-[1.02]"
                >
                  {isHebrew ? "לצפייה בפרויקט" : "View project"}
                </Button>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute top-1/2 -translate-y-1/2 left-4 md:left-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[rgba(15,23,42,0.85)] backdrop-blur-sm border border-[rgba(148,163,184,0.4)] rounded-full text-[#E5E7EB] hover:bg-[rgba(30,64,175,0.9)] transition-all z-10"
              aria-label={isHebrew ? "פרויקט קודם" : "Previous project"}
            >
              {isHebrew ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 -translate-y-1/2 right-4 md:right-6 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[rgba(15,23,42,0.85)] backdrop-blur-sm border border-[rgba(148,163,184,0.4)] rounded-full text-[#E5E7EB] hover:bg-[rgba(30,64,175,0.9)] transition-all z-10"
              aria-label={isHebrew ? "פרויקט הבא" : "Next project"}
            >
              {isHebrew ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-[#3B82F6] w-8"
                      : "bg-[rgba(148,163,184,0.4)] hover:bg-[rgba(148,163,184,0.6)]"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSlider;
