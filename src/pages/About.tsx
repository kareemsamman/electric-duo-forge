import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/animations/FadeIn";
import founderPhoto from "@/assets/founder-photo.jpg";

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">{t("about.title")}</h1>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <div className="prose prose-lg max-w-4xl mx-auto mb-16">
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              {t("hero.subtitle")}
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card className="max-w-2xl mx-auto hover:shadow-xl transition-shadow">
            <CardContent className="pt-8 pb-8 text-center">
              <img src={founderPhoto} alt="עאצם עודה" className="w-[20rem] h-[24rem] rounded-2xl mx-auto mb-6 object-cover" />
              <h3 className="text-2xl font-bold mb-2">עאצם עודה</h3>
              <p className="text-accent mb-4">{t("about.founder.title")}</p>
              <p className="text-muted-foreground">
                {t("hero.subtitle")}
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
};

export default About;
