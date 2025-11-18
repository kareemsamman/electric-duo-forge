import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn } from "@/components/animations/FadeIn";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const ProjectsPreview = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const { data: galleryImages } = useQuery({
    queryKey: ["gallery-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("category", "projects")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const handlePrevious = () => {
    if (selectedImageIndex === null || !galleryImages) return;
    setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNext = () => {
    if (selectedImageIndex === null || !galleryImages) return;
    setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") setSelectedImageIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, galleryImages]);

  if (!galleryImages || galleryImages.length === 0) return null;

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="px-4 md:px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              {content["gallery.title"] || "פרויקטים נבחרים"}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {content["gallery.subtitle"] || "מדגם קטן מפרויקטים שביצענו עבור לקוחות בכל הארץ"}
            </p>
          </div>
        </FadeIn>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4" dir={language === "he" ? "rtl" : "ltr"}>
          {/* Row 1: 30% + 70% */}
          {galleryImages[0] && (
            <div
              className="md:col-span-4 h-[280px] md:h-[380px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(0)}
            >
              <img
                src={galleryImages[0].image}
                alt={language === "he" ? galleryImages[0].title : galleryImages[0].title_en || galleryImages[0].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          )}
          
          {galleryImages[1] && (
            <div
              className="md:col-span-8 h-[280px] md:h-[380px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(1)}
            >
              <img
                src={galleryImages[1].image}
                alt={language === "he" ? galleryImages[1].title : galleryImages[1].title_en || galleryImages[1].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          )}

          {/* Row 2: 40% + 60% */}
          {galleryImages[2] && (
            <div
              className="md:col-span-5 h-[280px] md:h-[340px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(2)}
            >
              <img
                src={galleryImages[2].image}
                alt={language === "he" ? galleryImages[2].title : galleryImages[2].title_en || galleryImages[2].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          )}
          
          {galleryImages[3] && (
            <div
              className="md:col-span-7 h-[280px] md:h-[340px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(3)}
            >
              <img
                src={galleryImages[3].image}
                alt={language === "he" ? galleryImages[3].title : galleryImages[3].title_en || galleryImages[3].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          )}

          {/* Row 3: Three equal columns */}
          {galleryImages[4] && (
            <div
              className="md:col-span-4 h-[280px] md:h-[320px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(4)}
            >
              <img
                src={galleryImages[4].image}
                alt={language === "he" ? galleryImages[4].title : galleryImages[4].title_en || galleryImages[4].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          )}
          
          {galleryImages[5] && (
            <div
              className="md:col-span-4 h-[280px] md:h-[320px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(5)}
            >
              <img
                src={galleryImages[5].image}
                alt={language === "he" ? galleryImages[5].title : galleryImages[5].title_en || galleryImages[5].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          )}
          
          {galleryImages[6] && (
            <div
              className="md:col-span-4 h-[280px] md:h-[320px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(6)}
            >
              <img
                src={galleryImages[6].image}
                alt={language === "he" ? galleryImages[6].title : galleryImages[6].title_en || galleryImages[6].title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          )}

          {/* Additional images if available */}
          {galleryImages.slice(7).map((image, index) => (
            <div
              key={image.id}
              className="md:col-span-4 h-[280px] md:h-[320px] relative group cursor-pointer rounded-xl overflow-hidden"
              onClick={() => setSelectedImageIndex(index + 7)}
            >
              <img
                src={image.image}
                alt={language === "he" ? image.title : image.title_en || image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                  {language === "he" ? "לחץ להגדלה" : "Click to enlarge"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
            <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
              {/* Close Button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-50 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-2 transition-all"
              >
                <X size={24} />
              </button>

              {/* Previous Button */}
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 transition-all"
              >
                <ChevronLeft size={32} />
              </button>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-3 transition-all"
              >
                <ChevronRight size={32} />
              </button>

              {/* Image */}
              <div className="flex flex-col items-center justify-center max-w-full max-h-full">
                <img
                  src={galleryImages[selectedImageIndex].image}
                  alt={language === "he" ? galleryImages[selectedImageIndex].title : galleryImages[selectedImageIndex].title_en || galleryImages[selectedImageIndex].title}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
                
                {/* Caption */}
                <div className="mt-4 text-center max-w-2xl">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {language === "he" ? galleryImages[selectedImageIndex].title : galleryImages[selectedImageIndex].title_en || galleryImages[selectedImageIndex].title}
                  </h3>
                  {galleryImages[selectedImageIndex].description && (
                    <p className="text-sm md:text-base text-white/80">
                      {language === "he" ? galleryImages[selectedImageIndex].description : galleryImages[selectedImageIndex].description_en || galleryImages[selectedImageIndex].description}
                    </p>
                  )}
                </div>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                {selectedImageIndex + 1} / {galleryImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ProjectsPreview;
