import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

type Project = {
  id: string;
  project_name: string;
  project_name_en?: string | null;
  description: string;
  description_en?: string | null;
  location?: string | null;
  location_en?: string | null;
  tags?: string[];
  tags_en?: string[] | null;
  image: string;
  created_at: string;
  is_visible?: boolean;
};

const getImageUrl = (imagePath: string) => {
  try {
    if (!imagePath) return "";

    // Full URL from DB
    if (imagePath.startsWith("http")) return imagePath;

    // DB path like /projects/xxx.jpg → assets
    if (imagePath.startsWith("/projects/")) {
      const fileName = imagePath.replace("/projects/", "");
      // ⚠️ If this breaks, just switch ../assets → ../../assets
      return new URL(`../assets/projects/${fileName}`, import.meta.url).href;
    }

    // Already in /src/assets
    if (imagePath.startsWith("/src/assets/")) {
      const relativePath = imagePath.replace("/src/", "../");
      return new URL(relativePath, import.meta.url).href;
    }

    return imagePath;
  } catch (error) {
    console.error("Error loading image:", imagePath, error);
    return imagePath;
  }
};

const Projects = () => {
  const { language, t } = useLanguage();
  const isHebrew = language === "he";
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects-page"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").eq("is_visible", true).order("display_order", { ascending: true });

      if (error) throw error;
      return data as Project[];
    },
  });

  // Extract unique categories from project tags
  const categories = useMemo(() => {
    if (!projects) return [];
    const tagSet = new Map<string, string>();
    projects.forEach((project) => {
      const heTags = project.tags || [];
      const enTags = project.tags_en || [];
      heTags.forEach((tag, i) => {
        if (!tagSet.has(tag)) {
          tagSet.set(tag, enTags[i] || tag);
        }
      });
    });
    return Array.from(tagSet.entries()).map(([he, en]) => ({ he, en }));
  }, [projects]);

  // Filter projects by selected category
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    if (!activeCategory) return projects;
    return projects.filter((project) => {
      const tags = project.tags || [];
      return tags.includes(activeCategory);
    });
  }, [projects, activeCategory]);

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20 bg-background" dir={isHebrew ? "rtl" : "ltr"}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-[1400px]">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 md:mb-14 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {t("projects.title") || (isHebrew ? "הפרויקטים שלנו" : "Our Projects")}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("projects.subtitle") ||
              (isHebrew
                ? "מבחר פרויקטים שביצענו עבור לקוחות במגזרים שונים."
                : "A selection of projects we’ve successfully completed across different sectors.")}
          </p>
        </motion.div>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === null
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              }`}
            >
              {isHebrew ? "הכל" : "All"}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.he}
                onClick={() => setActiveCategory(cat.he)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat.he
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                }`}
              >
                {isHebrew ? cat.he : cat.en}
              </button>
            ))}
          </motion.div>
        )}

        {/* Loading / Error / Empty states */}
        {isLoading && (
          <p className="text-center text-muted-foreground">
            {t("common.loading") || (isHebrew ? "טוען פרויקטים..." : "Loading projects...")}
          </p>
        )}

        {error && (
          <p className="text-center text-destructive">
            {t("projects.error") ||
              (isHebrew
                ? "אירעה שגיאה בטעינת הפרויקטים. נסו שוב מאוחר יותר."
                : "Failed to load projects. Please try again later.")}
          </p>
        )}

        {!isLoading && !error && filteredProjects.length === 0 && (
          <p className="text-center text-muted-foreground">
            {t("projects.empty") || (isHebrew ? "אין עדיין פרויקטים להצגה." : "No projects to show yet.")}
          </p>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && filteredProjects.length > 0 && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, index) => {
                const title = isHebrew ? project.project_name : project.project_name_en || project.project_name;
                const description = isHebrew ? project.description : project.description_en || project.description;
                const imgSrc = getImageUrl(project.image);

                return (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35, delay: index * 0.03 }}
                    className="relative aspect-[4/5] overflow-hidden rounded-2xl"
                  >
                    {/* Image */}
                    <img
                      src={imgSrc}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load image:", project.image);
                        e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                      }}
                    />

                    {/* Floating info panel */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-background/95 backdrop-blur-md rounded-xl p-5 shadow-lg">
                      <h3 className="text-lg font-bold mb-2 text-foreground text-center">{title}</h3>

                      {description && (
                        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed text-center mb-3">
                          {description}
                        </p>
                      )}

                      <Button asChild variant="outline" size="sm" className="w-full">
                        <Link to={`/projects/${project.id}`}>{isHebrew ? "קרא עוד על הפרויקט" : "View project"}</Link>
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Projects;
