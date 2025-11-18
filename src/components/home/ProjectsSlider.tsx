import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ProjectsSlider = () => {
  const { language } = useLanguage();
  const { content } = useContent();

  const { data: galleryData } = useQuery({
    queryKey: ["projects-slider"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("category", "פרויקטים")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filter only items with images
  const projects = galleryData?.filter(item => item.image) || [];

  if (projects.length === 0) return null;

  const isHebrew = language === "he";

  return (
    <section
      id="projects"
      className="relative w-full py-20 bg-background"
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-12 text-center text-[#0F172A]">
          {content["projects.slider.title"] || "מתוך הפרויקטים שלנו"}
        </h2>

        {/* Masonry Grid */}
        <div className="space-y-6">
          {/* Row 1: 30% + 70% */}
          {projects.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="md:col-span-3 h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[0].image}
                  alt={language === "he" ? projects[0].title : projects[0].title_en || projects[0].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-7 h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[1].image}
                  alt={language === "he" ? projects[1].title : projects[1].title_en || projects[1].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Row 2: 70% + 30% */}
          {projects.length >= 4 && (
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="md:col-span-7 h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[2].image}
                  alt={language === "he" ? projects[2].title : projects[2].title_en || projects[2].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-3 h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[3].image}
                  alt={language === "he" ? projects[3].title : projects[3].title_en || projects[3].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Row 3: 3 equal images */}
          {projects.length >= 7 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[4].image}
                  alt={language === "he" ? projects[4].title : projects[4].title_en || projects[4].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[5].image}
                  alt={language === "he" ? projects[5].title : projects[5].title_en || projects[5].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[6].image}
                  alt={language === "he" ? projects[6].title : projects[6].title_en || projects[6].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Row 4: 3 equal images */}
          {projects.length >= 10 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[7].image}
                  alt={language === "he" ? projects[7].title : projects[7].title_en || projects[7].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[8].image}
                  alt={language === "he" ? projects[8].title : projects[8].title_en || projects[8].title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
                <img
                  src={projects[9].image}
                  alt={language === "he" ? projects[9].title : projects[9].title_en || projects[9].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSlider;
