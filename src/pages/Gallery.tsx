import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { X } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GalleryItem = {
  id: string;
  image: string;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  category: string;
  created_at: string;
  video_url: string | null;
};

type GalleryCategory = {
  id: string;
  name_he: string;
  name_en: string | null;
  display_order: number;
};

const Gallery = () => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["gallery-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery_categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as GalleryCategory[];
    },
  });

  const { data: gallery, isLoading } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredGallery = activeTab === "all"
    ? gallery
    : gallery?.filter((item) => item.category === activeTab);

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            {t("gallery.title")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xl text-muted-foreground text-center mb-10 max-w-3xl mx-auto">
            {t("gallery.description")}
          </p>
        </FadeIn>

        {/* Category Tabs */}
        {categories.length > 0 && (
          <FadeIn delay={0.3}>
            <div className="flex justify-center mb-12">
              <Tabs value={activeTab} onValueChange={setActiveTab} dir={language === "he" ? "rtl" : "ltr"}>
                <TabsList className="flex-wrap h-auto gap-1 p-1">
                  <TabsTrigger value="all">
                    {language === "he" ? "הכל" : "All"}
                  </TabsTrigger>
                  {categories.map((cat) => (
                    <TabsTrigger key={cat.id} value={cat.name_he}>
                      {language === "he" ? cat.name_he : cat.name_en || cat.name_he}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </FadeIn>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-secondary animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid md:grid-cols-3 gap-6" staggerDelay={0.1}>
            {filteredGallery?.map((item) => (
              <StaggerItem key={item.id}>
                <motion.div
                  className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => !item.video_url && setSelectedImage(item)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.video_url ? (
                    <video
                      src={item.video_url}
                      controls
                      className="w-full h-full object-cover"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img
                      src={item.image}
                      alt={language === "he" ? item.title : item.title_en || item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent ${item.video_url ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-semibold mb-1">
                        {language === "he" ? item.title : item.title_en || item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-white/80">
                          {language === "he" ? item.description : item.description_en || item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors"
          >
            <X size={32} />
          </button>
          <motion.img
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            src={selectedImage.image}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </motion.div>
      )}
    </div>
  );
};

export default Gallery;
