import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

const certificates = [
  { name: "ISO 9001:2015", issuer: "ISO" },
  { name: "IQNet Certificate", issuer: "IQNet" },
  { name: "Israeli Standards", issuer: "SII" },
];

const Certificates = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center">
            {t("nav.certificates")}
          </h1>
        </FadeIn>
        
        <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
          {certificates.map((cert, index) => (
            <StaggerItem key={index}>
              <AnimatedCard>
                <Card className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Award className="text-accent mx-auto mb-6" size={64} />
                    <h3 className="text-2xl font-bold mb-2">{cert.name}</h3>
                    <p className="text-muted-foreground">{cert.issuer}</p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

export default Certificates;
