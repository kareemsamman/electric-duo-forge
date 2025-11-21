import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
};

const getImageUrl = (imagePath: string) => {
  try {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/projects/")) {
      const fileName = imagePath.replace("/projects/", "");
      return new URL(`../assets/projects/${fileName}`, import.meta.url).href;
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

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const isHebrew = language === "he";

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background" dir={isHebrew ? "rtl" : "ltr"}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {isHebrew ? "הפרויקט לא נמצא" : "Project not found"}
          </h1>
          <Button asChild>
            <Link to="/projects">
              {isHebrew ? <ArrowRight className="ml-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
              {isHebrew ? "חזרה לפרויקטים" : "Back to Projects"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = isHebrew ? project.project_name : project.project_name_en || project.project_name;
  const description = isHebrew ? project.description : project.description_en || project.description;
  const location = isHebrew ? project.location : project.location_en || project.location;
  const tags = isHebrew ? project.tags : project.tags_en || project.tags;
  const imgSrc = getImageUrl(project.image);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-background" dir={isHebrew ? "rtl" : "ltr"}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-[1400px]">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button variant="ghost" asChild>
            <Link to="/projects">
              {isHebrew ? <ArrowRight className="ml-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
              {isHebrew ? "חזרה לפרויקטים" : "Back to Projects"}
            </Link>
          </Button>
        </motion.div>

        {/* Project image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <img
            src={imgSrc}
            alt={title}
            className="w-full h-[400px] md:h-[600px] object-cover rounded-2xl shadow-lg"
            onError={(e) => {
              console.error("Failed to load image:", project.image);
              e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Not+Found";
            }}
          />
        </motion.div>

        {/* Project info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              {location && (
                <div className="flex items-center gap-2 text-muted-foreground text-lg mb-6">
                  <MapPin className="h-5 w-5" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>
          </motion.div>

          {/* Right column - Tags and metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {tags && tags.length > 0 && (
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">
                  {isHebrew ? "תגיות" : "Tags"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">
                {isHebrew ? "פרטי הפרויקט" : "Project Details"}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">{isHebrew ? "תאריך:" : "Date:"}</span>
                  <span className="text-muted-foreground mr-2">
                    {new Date(project.created_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
