import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";

const ProjectsPreview = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  const isHebrew = language === "he";

  const { data: projects } = useQuery({
    queryKey: ["projects-preview"],
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

  if (!projects || projects.length === 0) return null;

  return (
    <section
      className="py-20 md:py-32 px-6 md:px-12 lg:px-16"
      dir={isHebrew ? "rtl" : "ltr"}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Column - Right side in Hebrew */}
          <motion.div
            initial={{ opacity: 0, x: isHebrew ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-4 space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {content["projects.preview.title"] || "הפרויקטים שלנו"}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {content["projects.preview.description"] ||
                "גלו את מגוון הפרויקטים שביצענו בהצלחה עבור לקוחותינו. כל פרויקט משקף את המחויבות שלנו למצוינות ולחדשנות."}
            </p>
            <Button
              asChild
              size="lg"
              className="group"
            >
              <Link to="/projects">
                {content["projects.preview.button"] || "לכל הפרויקטים"}
                {isHebrew ? (
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                ) : (
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            </Button>
          </motion.div>

          {/* Carousel Column - Left side in Hebrew */}
          <motion.div
            initial={{ opacity: 0, x: isHebrew ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-8"
          >
            <Carousel
              opts={{
                align: "start",
                loop: true,
                direction: isHebrew ? "rtl" : "ltr",
              }}
              className="w-full"
            >
              <CarouselContent>
                {projects.map((project) => (
                  <CarouselItem key={project.id}>
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden group">
                      {/* Project Image */}
                      <img
                        src={project.image}
                        alt={
                          isHebrew
                            ? project.project_name
                            : project.project_name_en || project.project_name
                        }
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Glassmorphism Info Panel */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                        <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 space-y-4">
                          <div className="space-y-2">
                            <h3 className="text-2xl md:text-3xl font-bold text-white">
                              {isHebrew
                                ? project.project_name
                                : project.project_name_en || project.project_name}
                            </h3>
                            <p className="text-white/80 text-sm md:text-base">
                              {isHebrew
                                ? project.location
                                : project.location_en || project.location}
                            </p>
                          </div>

                          <p className="text-white/90 text-sm md:text-base line-clamp-2 leading-relaxed">
                            {isHebrew
                              ? project.description
                              : project.description_en || project.description}
                          </p>

                          {/* Tags */}
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {(isHebrew ? project.tags : project.tags_en || project.tags)
                                .slice(0, 3)
                                .map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 text-xs bg-white/20 backdrop-blur-sm text-white rounded-full border border-white/30"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                          )}

                          <Button
                            asChild
                            variant="secondary"
                            className="w-full md:w-auto bg-white/90 hover:bg-white text-foreground"
                          >
                            <Link to={`/projects/${project.id}`}>
                              {content["projects.preview.view.button"] || "צפה בפרויקט"}
                              {isHebrew ? (
                                <ArrowLeft className="mr-2 h-4 w-4" />
                              ) : (
                                <ArrowRight className="ml-2 h-4 w-4" />
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* Navigation Arrows */}
              <CarouselPrevious className="left-4 h-12 w-12 bg-white/90 hover:bg-white border-none shadow-lg" />
              <CarouselNext className="right-4 h-12 w-12 bg-white/90 hover:bg-white border-none shadow-lg" />
            </Carousel>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsPreview;
