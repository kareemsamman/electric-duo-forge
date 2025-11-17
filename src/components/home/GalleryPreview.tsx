import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedButton } from "@/components/animations/AnimatedButton";
import { motion } from "framer-motion";

const GalleryPreview = () => {
  const { t, language } = useLanguage();

  const { data: gallery } = useQuery({
    queryKey: ["gallery-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("category", "פרויקטים")
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data;
    },
  });

  if (!gallery || gallery.length === 0) return null;

  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            {t("gallery.preview.title")}
          </h2>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12" staggerDelay={0.1}>
          {gallery.map((item) => (
            <StaggerItem key={item.id}>
              <Link
                to="/gallery"
                className="block"
              >
                <motion.div
                  className="relative aspect-square overflow-hidden rounded-lg group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={item.image}
                    alt={language === "he" ? item.title : item.title_en || item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold text-sm">
                        {language === "he" ? item.title : item.title_en || item.title}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.5}>
          <div className="text-center">
            <Link to="/gallery">
              <AnimatedButton>
                <Button variant="outline" size="lg" className="group">
                  {t("gallery.preview.viewAll")}
                  {language === "he" ? (
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                  ) : (
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  )}
                </Button>
              </AnimatedButton>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default GalleryPreview;
