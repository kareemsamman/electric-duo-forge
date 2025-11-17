import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const About = () => {
  const { t, language } = useLanguage();

  const { data: team } = useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 animate-fade-in">{t("about.title")}</h1>
        
        <div className="prose prose-lg max-w-none mb-16 animate-fade-in">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        <Card className="max-w-2xl mx-auto mb-20 animate-fade-in">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-32 h-32 bg-secondary rounded-full mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-2">{t("about.founder.name")}</h3>
            <p className="text-accent mb-4">{t("about.founder.title")}</p>
            <p className="text-muted-foreground">
              {t("hero.subtitle")}
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        {team && team.length > 0 && (
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center animate-fade-in">
              {t("about.team.title")}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card 
                  key={member.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-square bg-secondary">
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="pt-6 pb-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                    <p className="text-sm text-accent mb-3">
                      {language === "he" ? member.role : member.role_en || member.role}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === "he" ? member.description : member.description_en || member.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
