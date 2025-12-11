import { useLanguage } from "@/contexts/LanguageContext";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, FileText } from "lucide-react";

const Certificates = () => {
  const { t, language } = useLanguage();
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const handleCertificateClick = (pdfUrl: string | null, name: string) => {
    if (pdfUrl) {
      setSelectedPdf(pdfUrl);
      setSelectedName(name);
    }
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
          <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8" staggerDelay={0.1}>
            {certificates.map((cert) => {
              const name = language === "he" ? cert.certificate_name : (cert.certificate_name_en || cert.certificate_name);
              const description = language === "he" ? cert.short_description : (cert.short_description_en || cert.short_description);
              
              return (
                <StaggerItem key={cert.id}>
                  <div
                    onClick={() => handleCertificateClick(cert.pdf_file, name)}
                    className={`group cursor-pointer ${!cert.pdf_file ? 'cursor-default opacity-70' : ''}`}
                  >
                    {/* Book-style PDF thumbnail */}
                    <div className="relative aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg shadow-lg overflow-hidden border border-border/50 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                      {/* Certificate image or PDF preview */}
                      {cert.certificate_image ? (
                        <img
                          src={cert.certificate_image}
                          alt={name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-16 h-16 text-muted-foreground/50" />
                        </div>
                      )}
                      
                      {/* Book spine effect */}
                      <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent" />
                      
                      {/* Hover overlay */}
                      {cert.pdf_file && (
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-background/90 text-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                            {language === "he" ? "צפייה בתעודה" : "View Certificate"}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Certificate info */}
                    <div className="mt-4 text-center">
                      <h3 className="font-bold text-foreground text-sm md:text-base line-clamp-2">
                        {name}
                      </h3>
                      {description && (
                        <p className="text-muted-foreground text-xs md:text-sm mt-1 line-clamp-2">
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

      {/* PDF Viewer Modal */}
      <Dialog open={!!selectedPdf} onOpenChange={() => setSelectedPdf(null)}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 bg-background border-none">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <h2 className="font-bold text-lg truncate">{selectedName}</h2>
              <button
                onClick={() => setSelectedPdf(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* PDF Iframe */}
            <div className="flex-1 bg-muted">
              {selectedPdf && (
                <iframe
                  src={selectedPdf}
                  className="w-full h-full"
                  title={selectedName}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Certificates;
