import { useLanguage } from "@/contexts/LanguageContext";
import { useContent } from "@/contexts/ContentContext";
import { Award, Clock, Shield, Users } from "lucide-react";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import whyUsBackground from "@/assets/why-us-background.jpg";

const features = [
  { icon: Award, titleKey: "whyus.iso.title", descKey: "whyus.iso.desc" },
  { icon: Clock, titleKey: "whyus.delivery.title", descKey: "whyus.delivery.desc" },
  { icon: Shield, titleKey: "whyus.quality.title", descKey: "whyus.quality.desc" },
  { icon: Users, titleKey: "whyus.service.title", descKey: "whyus.service.desc" },
];

const WhyUsSection = () => {
  const { content } = useContent();

  return (
    <section 
      className="relative w-full min-h-screen flex items-center justify-center py-20 overflow-hidden"
      style={{
        backgroundImage: `url(${whyUsBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-[900px] mx-auto px-4 md:px-6 text-center">
        {/* Title */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white">
            {content["whyus.title"] || "למה לעבוד איתנו"}
          </h2>
          <div className="w-[70px] h-1 bg-gradient-to-r from-[#1A73E8] to-[#00B0FF] mx-auto rounded-full" />
        </div>

        {/* Features Grid */}
        <StaggerContainer 
          className="grid grid-cols-1 sm:grid-cols-2 gap-10" 
          staggerDelay={0.12}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={index}>
                <div className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/25 bg-white/[0.08] backdrop-blur-lg shadow-[0_0_20px_rgba(0,0,0,0.25)]">
                  <div className="w-16 h-16 mb-6 flex items-center justify-center">
                    <Icon className="text-white" size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
                    {content[feature.titleKey] || ""}
                  </h3>
                  <p className="text-base text-white/70 leading-relaxed">
                    {content[feature.descKey] || ""}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default WhyUsSection;
