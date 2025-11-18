import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Calendar, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  project_name: string;
  project_name_en: string | null;
  location: string;
  location_en: string | null;
  description: string;
  description_en: string | null;
  tags: string[];
  tags_en: string[] | null;
  image: string;
  created_at: string;
}

const ProjectsSlider = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
  });

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  if (projects.length === 0) return null;

  const currentProject = projects[currentIndex];
  const projectName = language === "he" ? currentProject.project_name : (currentProject.project_name_en || currentProject.project_name);
  const location = language === "he" ? currentProject.location : (currentProject.location_en || currentProject.location);
  const description = language === "he" ? currentProject.description : (currentProject.description_en || currentProject.description);
  const tags = language === "he" ? currentProject.tags : (currentProject.tags_en || currentProject.tags);
  const year = new Date(currentProject.created_at).getFullYear();
  const isHebrew = language === "he";

  return (
    <section className="min-h-screen flex items-center py-20 md:py-32" id="projects">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Right column - Text (RTL) */}
          <motion.div
            initial={{ opacity: 0, x: isHebrew ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={`lg:col-span-4 ${isHebrew ? "lg:order-2 text-right" : "lg:order-1 text-left"}`}
          >
            <div className="space-y-6">
              {/* Small label */}
              <div className="text-[#3B82F6] text-xs md:text-sm font-bold uppercase tracking-wider">
                {content["projects.label"] || "פרויקטים"}
              </div>

              {/* Main heading */}
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {content["projects.title"] || "הפרויקטים שלנו"}
              </h2>

              {/* Description */}
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-md">
                {content["projects.description"] || "אנחנו מתמחים בפתרונות חשמל מתקדמים לפרויקטים בכל הגדלים. מהתכנון ועד ההפעלה, אנחנו מספקים שירות מקצועי ואמין."}
              </p>

              {/* Bullet points */}
              <ul className="space-y-3">
                {[
                  content["projects.bullet1"] || "ניסיון רב שנים בפרויקטים מורכבים",
                  content["projects.bullet2"] || "שירות מקצועי ואמין",
                  content["projects.bullet3"] || "פתרונות מותאמים אישית",
                ].map((bullet, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{bullet}</span>
                  </li>
                ))}
              </ul>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-[#2563EB] hover:bg-[#3B82F6] text-white rounded-full px-8 transition-all duration-300 hover:scale-105"
                >
                  {content["projects.viewAll"] || "לכל הפרויקטים"}
                  <ArrowLeft className={`w-4 h-4 ${isHebrew ? "" : "rotate-180"}`} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-border/40 hover:border-border transition-all duration-300"
                >
                  {content["projects.contact"] || "צור קשר"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Left column - Slider */}
          <motion.div
            initial={{ opacity: 0, x: isHebrew ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className={`lg:col-span-8 ${isHebrew ? "lg:order-1" : "lg:order-2"}`}
          >
            <div className="relative">
              {/* Image slider */}
              <div className="relative overflow-hidden rounded-[20px] shadow-[0_20px_60px_rgba(15,23,42,0.25)]" style={{ height: "65vh", minHeight: "500px" }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: isHebrew ? -100 : 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isHebrew ? 100 : -100 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <img
                      src={currentProject.image}
                      alt={projectName}
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay panel */}
                    <div className={`absolute bottom-6 ${isHebrew ? "right-6" : "left-6"} w-[90%] sm:w-[380px] bg-[rgba(15,23,42,0.85)] backdrop-blur-lg border border-[rgba(148,163,184,0.35)] rounded-2xl p-5 md:p-6`}>
                      {/* Project name */}
                      <h3 className="text-xl md:text-2xl font-bold text-[#F9FAFB] mb-2">
                        {projectName}
                      </h3>

                      {/* Location */}
                      <p className="text-sm md:text-base text-[#E5E7EB] mb-4">
                        {location}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-4 mb-4 text-[#9CA3AF] text-xs md:text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#60A5FA]" />
                          <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#60A5FA]" />
                          <span>{year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                          <span>{content["projects.completed"] || "הושלם"}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {tags && tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs bg-[#0B1120] border border-[rgba(148,163,184,0.3)] text-[#E5E7EB] rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Button */}
                      <Button
                        className="w-full bg-[#2563EB] hover:bg-[#3B82F6] text-[#F9FAFB] rounded-full transition-all duration-300 hover:scale-[1.02]"
                      >
                        {content["projects.viewProject"] || "לצפייה בפרויקט"}
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation arrows */}
                <button
                  onClick={prevSlide}
                  className={`absolute top-1/2 -translate-y-1/2 ${isHebrew ? "right-4" : "left-4"} w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[rgba(15,23,42,0.85)] border border-[rgba(148,163,184,0.4)] text-[#E5E7EB] hover:bg-[rgba(30,64,175,0.9)] transition-all duration-300 hover:scale-110 z-10`}
                  aria-label="Previous project"
                >
                  {isHebrew ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={nextSlide}
                  className={`absolute top-1/2 -translate-y-1/2 ${isHebrew ? "left-4" : "right-4"} w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[rgba(15,23,42,0.85)] border border-[rgba(148,163,184,0.4)] text-[#E5E7EB] hover:bg-[rgba(30,64,175,0.9)] transition-all duration-300 hover:scale-110 z-10`}
                  aria-label="Next project"
                >
                  {isHebrew ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>

              {/* Pagination dots */}
              <div className="flex justify-center gap-2 mt-6">
                {projects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "w-8 bg-[#3B82F6]"
                        : "w-2 bg-[rgba(148,163,184,0.4)] hover:bg-[rgba(148,163,184,0.6)]"
                    }`}
                    aria-label={`Go to project ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSlider;
