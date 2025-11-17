import { useLanguage } from "@/contexts/LanguageContext";
import { Award, Clock, Shield, Users } from "lucide-react";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import whyUsBackground from "@/assets/why-us-background.jpg";

const features = [
  { icon: Award, key: "whyus.iso" },
  { icon: Clock, key: "whyus.delivery" },
  { icon: Shield, key: "whyus.quality" },
  { icon: Users, key: "whyus.service" },
];

const WhyUsSection = () => {
  const { t } = useLanguage();

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
            {t("whyus.title")}
          </h2>
          <div className="w-[70px] h-1 bg-gradient-to-r from-[#1A73E8] to-[#00B0FF] mx-auto rounded-full" />
        </div>

        {/* Features Grid */}
        <StaggerContainer 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" 
          staggerDelay={0.12}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <StaggerItem key={index}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 mb-5 flex items-center justify-center">
                    <Icon className="text-white/90" size={48} strokeWidth={1.5} />
                  </div>
                  <p className="text-lg md:text-xl font-semibold text-white/95 leading-snug">
                    {t(feature.key)}
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
