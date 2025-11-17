import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";

const certificates = [
  { name: "ISO 9001:2015", issuer: "ISO" },
  { name: "IQNet Certificate", issuer: "IQNet" },
  { name: "Israeli Standards", issuer: "SII" },
];

const Certificates = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center">
          {t("nav.certificates")}
        </h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {certificates.map((cert, index) => (
            <Card 
              key={index} 
              className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-12 pb-12 text-center">
                <Award className="text-accent mx-auto mb-6" size={64} />
                <h3 className="text-2xl font-bold mb-2">{cert.name}</h3>
                <p className="text-muted-foreground">{cert.issuer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Certificates;
