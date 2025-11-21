import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProjectsSection = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  const isHebrew = language === "he";

  const { data: projects } = useQuery({
    queryKey: ["projects-section"],
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

  // Helper function to convert database paths to asset paths
  const getImageUrl = (imagePath: string) => {
    try {
      if (imagePath.startsWith("http")) return imagePath;
      if (imagePath.startsWith("/projects/")) {
        const fileName = imagePath.replace("/projects/", "");
        return new URL(`../../assets/projects/${fileName}`, import.meta.url).href;
      }
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

  if (!projects || projects.length === 0) return null;

  return (
    <section className="py-20 md:py-32 bg-background" dir={isHebrew ? "rtl" : "ltr"}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-[1400px]">
        {/* Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center md:text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {content["projects.section.title"] || "הפרויקטים שלנו"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:text-center">
            {content["projects.section.subtitle"] || "גלו את מגוון הפרויקטים שביצענו בהצלחה עבור לקוחותינו"}
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl"
            >
              {/* Project Image - Full Size */}
              <img
                src={getImageUrl(project.image)}
                alt={isHebrew ? project.project_name : project.project_name_en || project.project_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Failed to load image:", project.image);
                  e.currentTarget.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                }}
              />

              {/* Floating Info Panel - Centered at Bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-background/95 backdrop-blur-md rounded-xl p-5 shadow-lg">
                <h3 className="text-lg font-bold mb-2 text-foreground text-center">
                  {isHebrew ? project.project_name : project.project_name_en || project.project_name}
                </h3>

                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed text-center mb-3">
                  {isHebrew ? project.description : project.description_en || project.description}
                </p>

                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={`/projects/${project.id}`}>{content["projects.section.view.button"] || "קרא עוד"}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild size="lg" className="group">
            <Link to="/projects">
              {content["projects.section.viewall.button"] || "צפו בכל הפרויקטים"}
              {isHebrew ? (
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              ) : (
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              )}
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProjectsSection;
