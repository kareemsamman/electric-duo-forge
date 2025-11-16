import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-8">{t("about.title")}</h1>
        
        <div className="prose prose-lg max-w-none mb-16">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-32 h-32 bg-secondary rounded-full mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">{t("about.founder.name")}</h3>
            <p className="text-accent mb-4">{t("about.founder.title")}</p>
            <p className="text-muted-foreground">
              {t("hero.subtitle")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
