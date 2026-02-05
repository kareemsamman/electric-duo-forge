import { useLanguage } from "@/contexts/LanguageContext";
import { ClipboardCheck, Factory, Wrench, FlaskConical, Headphones, Zap, Settings, Shield, Cpu, Cable, LucideIcon } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  url: string;
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

  const renderLink = (link: ServiceLink, index: number) => {
    const isExternal = link.url.startsWith('http');
    
    if (isExternal) {
      return (
        <a 
          key={index}
          href={link.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#1A73E8] hover:underline font-medium"
        >
          {link.text}
        </a>
      );
    }
    
    return (
      <Link 
        key={index}
        to={link.url}
        className="text-[#1A73E8] hover:underline font-medium"
      >
        {link.text}
      </Link>
    );
  };

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-secondary/20 to-background" dir="rtl">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Right Column - Text (Sticky on desktop) */}
          <FadeIn>
            <div className="lg:sticky lg:top-28 lg:pb-16 relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                {t("services.title")}
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                {t("services.subtitle")}
              </p>
              <Link 
                to="/solutions" 
                className="inline-flex items-center gap-2 text-[#1A73E8] hover:text-[#155BB7] font-medium transition-colors group"
              >
                <span>{t("services.viewAll")}</span>
                {language === "he" ? (
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </Link>
              {/* Subtle fade indicator at bottom - desktop only */}
              <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/80 via-background/40 to-transparent pointer-events-none" />
            </div>
          </FadeIn>

          {/* Left Column - Services List */}
          <StaggerContainer className="space-y-1" staggerDelay={0.1}>
            {services?.map((service) => {
              const Icon = iconMap[service.icon] || ClipboardCheck;
              const title = language === "he" ? service.title_he : (service.title_en || service.title_he);
              const description = language === "he" ? service.description_he : (service.description_en || service.description_he);
              const links = (service.links as ServiceLink[] | null) || [];
              
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
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        {description}
                      </p>
                      {links.length > 0 && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
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
  );
};

export default ServicesSection;