import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Adjust this to match your table if needed
type Project = {
  id: string;
  project_name: string;
  project_name_en?: string | null;
  description: string;
  description_en?: string | null;
  location?: string | null;
  location_en?: string | null;
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

        {!isLoading && !error && projects && projects.length === 0 && (
          <p className="text-center text-muted-foreground">
            {t("projects.empty") || (isHebrew ? "אין עדיין פרויקטים להצגה." : "No projects to show yet.")}
          </p>
        )}

        {/* Projects Grid */}
        {!isLoading && !error && projects && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const title = isHebrew ? project.project_name : project.project_name_en || project.project_name;

              const description = isHebrew ? project.description : project.description_en || project.description;

              const imgSrc = getImageUrl(project.image);

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
