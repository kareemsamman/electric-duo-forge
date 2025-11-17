import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { X } from "lucide-react";

const Gallery = () => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center animate-fade-in">
          {t("gallery.title")}
        </h1>
        <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto animate-fade-in">
          {t("gallery.description")}
        </p>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-secondary animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {gallery?.map((item, index) => (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group animate-fade-in hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedImage(item.image)}
              >
                <img
                  src={item.image}
                  alt={language === "he" ? item.title : item.title_en || item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-accent transition-colors"
          >
            <X size={32} />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain animate-scale-in"
          />
        </div>
      )}
    </div>
  );
};

export default Gallery;
