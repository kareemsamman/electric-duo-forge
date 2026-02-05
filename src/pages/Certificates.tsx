import { useLanguage } from "@/contexts/LanguageContext";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Certificate {
  id: string;
  certificate_name: string;
  certificate_name_en: string | null;
  short_description: string;
  short_description_en: string | null;
  certificate_image: string;
  certificate_image_en: string | null;
  pdf_file: string | null;
  pdf_file_en: string | null;
  images: string[] | null;
}

const Certificates = () => {
  const { t, language } = useLanguage();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"images" | "pdf">("images");

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Certificate[];
    },
  });

  const handleCertificateClick = (cert: Certificate) => {
    setSelectedCert(cert);
    setCurrentImageIndex(0);
    setViewMode("images");
  };

  const getMainImage = (cert: Certificate) => {
    if (language === "en" && cert.certificate_image_en) {
      return cert.certificate_image_en;
    }
    return cert.certificate_image;
  };

  const getPdfFile = (cert: Certificate) => {
    if (language === "en" && cert.pdf_file_en) {
      return cert.pdf_file_en;
    }
    return cert.pdf_file;
  };

  const getAllImages = (cert: Certificate) => {
    const mainImage = getMainImage(cert);
    const additionalImages = cert.images || [];
    return [mainImage, ...additionalImages];
  };

  const nextImage = () => {
    if (!selectedCert) return;
    const images = getAllImages(selectedCert);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!selectedCert) return;
    const images = getAllImages(selectedCert);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            {t("nav.certificates")}
          </h1>
        </FadeIn>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {language === "he" ? "אין תעודות להצגה" : "No certificates to display"}
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" staggerDelay={0.1}>
            {certificates.map((cert) => {
              const name = language === "he" ? cert.certificate_name : (cert.certificate_name_en || cert.certificate_name);
              const description = language === "he" ? cert.short_description : (cert.short_description_en || cert.short_description);
              const mainImage = getMainImage(cert);
              const hasPdf = getPdfFile(cert);
              const hasMultipleImages = (cert.images?.length || 0) > 0;
              
              return (
                <StaggerItem key={cert.id} className="w-full">
                  <div
                    onClick={() => handleCertificateClick(cert)}
                    className="group cursor-pointer"
                  >
                    {/* Book-style PDF thumbnail - larger and centered */}
                    <div className="relative aspect-[3/4] max-h-[70vh] mx-auto bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-2xl overflow-hidden border border-border/50 transition-all duration-300 group-hover:shadow-3xl group-hover:-translate-y-2">
                      {/* Certificate image */}
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={name}
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-24 h-24 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Book spine effect */}
                      <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/20 to-transparent" />
                      
                      {/* Indicators */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        {hasPdf && (
                          <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium">
                            PDF
                          </span>
                        )}
                        {hasMultipleImages && (
                          <span className="bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                            +{cert.images?.length}
                          </span>
                        )}
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 text-foreground px-6 py-3 rounded-full text-lg font-medium shadow-lg">
                          {language === "he" ? "צפייה" : "View"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Certificate info */}
                    <div className="mt-6 text-center">
                      <h3 className="font-bold text-foreground text-xl md:text-2xl">
                        {name}
                      </h3>
                      {description && (
                        <p className="text-muted-foreground text-base md:text-lg mt-2 max-w-xl mx-auto">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>

      {/* Certificate Viewer Modal */}
      <Dialog open={!!selectedCert} onOpenChange={() => setSelectedCert(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-background border-none">
          {selectedCert && (
            <div className="relative w-full h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-background">
                <h2 className="font-bold text-lg truncate">
                  {language === "he" ? selectedCert.certificate_name : (selectedCert.certificate_name_en || selectedCert.certificate_name)}
                </h2>
                <div className="flex items-center gap-2">
                  {/* View mode toggle */}
                  {getPdfFile(selectedCert) && (
                    <div className="flex gap-1 mr-4">
                      <Button
                        size="sm"
                        variant={viewMode === "images" ? "default" : "outline"}
                        onClick={() => setViewMode("images")}
                      >
                        {language === "he" ? "תמונות" : "Images"}
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === "pdf" ? "default" : "outline"}
                        onClick={() => setViewMode("pdf")}
                      >
                        PDF
                      </Button>
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 bg-muted relative">
                {viewMode === "pdf" && getPdfFile(selectedCert) ? (
                  <iframe
                    src={getPdfFile(selectedCert)!}
                    className="w-full h-full"
                    title={selectedCert.certificate_name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img
                      src={getAllImages(selectedCert)[currentImageIndex]}
                      alt={selectedCert.certificate_name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                    
                    {/* Navigation arrows */}
                    {getAllImages(selectedCert).length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 hover:bg-background rounded-full shadow-lg transition-all"
                        >
                          {language === "he" ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/90 hover:bg-background rounded-full shadow-lg transition-all"
                        >
                          {language === "he" ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                        </button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 px-4 py-2 rounded-full text-sm">
                          {currentImageIndex + 1} / {getAllImages(selectedCert).length}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Certificates;
