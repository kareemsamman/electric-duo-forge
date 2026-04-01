import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ClipboardCheck, Factory, Wrench, FlaskConical, Headphones, Zap, Settings, Shield, Cpu, Cable, LucideIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const iconMap: Record<string, LucideIcon> = {
  ClipboardCheck,
  Factory,
  Wrench,
  FlaskConical,
  Headphones,
  Zap,
  Settings,
  Shield,
  Cpu,
  Cable,
};

interface ServiceLink {
  text: string;
  text_en?: string;
  type: 'url' | 'popup';
  url?: string;
  images?: string[];
}

interface Service {
  id: string;
  icon: string;
  title_he: string;
  title_en: string | null;
  description_he: string;
  description_en: string | null;
  links: ServiceLink[] | null;
  display_order: number;
  is_active: boolean;
}

const ServicesSection = () => {
  const { t, language } = useLanguage();
  const [popupImages, setPopupImages] = useState<string[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: services } = useQuery({
    queryKey: ['services-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as unknown as Service[];
    }
  });

  const openPopup = (images: string[]) => {
    setPopupImages(images);
    setCurrentImageIndex(0);
    setPopupOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % popupImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + popupImages.length) % popupImages.length);
  };

  const renderLink = (link: ServiceLink, index: number) => {
    const linkText = language === 'he' ? link.text : (link.text_en || link.text);
    // Handle popup type
    if (link.type === 'popup' && link.images && link.images.length > 0) {
      return (
        <button 
          key={index}
          onClick={() => openPopup(link.images!)}
          className={`text-[#1A73E8] hover:underline font-medium ${language === 'he' ? 'text-right' : 'text-left'}`}
        >
          {linkText}
        </button>
      );
    }
    
    // Handle URL type (default)
    const url = link.url || '';
    const isExternal = url.startsWith('http');
    
    if (isExternal) {
      return (
        <a 
          key={index}
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#1A73E8] hover:underline font-medium"
        >
          {linkText}
        </a>
      );
    }
    
    return (
      <Link 
        key={index}
        to={url}
        className="text-[#1A73E8] hover:underline font-medium"
      >
        {linkText}
      </Link>
    );
  };

  return (
    <>
      <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/20 to-background" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            {/* Video/Text Column - always on the right side visually */}
            <FadeIn className={language === 'he' ? 'lg:order-1' : 'lg:order-2'}>
              <div className="lg:sticky lg:top-28 lg:pb-16 relative">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                  {t("services.title")}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  {t("services.subtitle")}
                </p>
                <a 
                  href="https://www.youtube.com/watch?v=wmMEvXiZQbA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#1A73E8] hover:text-[#155BB7] font-medium transition-colors group"
                >
                  <span>{t("services.viewAll")}</span>
                  {language === 'he' ? (
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  )}
                </a>

                {/* YouTube Video */}
                <div className="mt-8 rounded-2xl overflow-hidden aspect-video shadow-lg">
                  <iframe
                    src="https://www.youtube.com/embed/wmMEvXiZQbA?rel=0&modestbranding=1"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                    title="Global Electric Video"
                  />
                </div>

                {/* Subtle fade indicator at bottom - desktop only */}
                <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/80 via-background/40 to-transparent pointer-events-none" />
              </div>
            </FadeIn>

            {/* Services List - always on the left side visually */}
            <StaggerContainer className={`space-y-1 ${language === 'he' ? 'lg:order-2' : 'lg:order-1'}`} staggerDelay={0.1}>
              {services?.map((service) => {
                const Icon = iconMap[service.icon] || ClipboardCheck;
                const title = language === "he" ? service.title_he : (service.title_en || service.title_he);
                const description = language === "he" ? service.description_he : (service.description_en || service.description_he);
                const links = ((service.links as ServiceLink[] | null) || []).map(link => ({
                  ...link,
                  type: link.type || 'url' as const
                }));
                
                return (
                  <StaggerItem key={service.id}>
                    <div className="flex items-start gap-6 py-6 border-b border-border/40 last:border-b-0">
                      <div className="flex-shrink-0 w-14 h-14 bg-[#1A73E8]/10 rounded-full flex items-center justify-center">
                        <Icon className="text-[#1A73E8]" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 tracking-tight">
                          {title}
                        </h3>
                        {description && (
                          <p className="text-muted-foreground leading-relaxed mb-2">
                            {description}
                          </p>
                        )}
                        </p>
                        {links.length > 0 && (
                          <div className="flex flex-col gap-y-1">
                            {links.map((link, index) => renderLink(link, index))}
                          </div>
                        )}
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Image Popup Dialog */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <div className="relative">
            {/* Close Button */}
            <button 
              onClick={() => setPopupOpen(false)}
              className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Main Image */}
            {popupImages.length > 0 && (
              <div className="relative flex items-center justify-center min-h-[60vh]">
                <img 
                  src={popupImages[currentImageIndex]} 
                  alt={`תמונה ${currentImageIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain"
                />
                
                {/* Navigation Arrows */}
                {popupImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Thumbnails */}
            {popupImages.length > 1 && (
              <div className="flex justify-center gap-2 p-4 bg-black/50">
                {popupImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Counter */}
            {popupImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {popupImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServicesSection;
