import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const TeamPreview = () => {
  const { t, language } = useLanguage();

  const { data: team } = useQuery({
    queryKey: ["team-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team")
        .select("*")
        .order("display_order", { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  if (!team || team.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-fade-in">
          {t("team.preview.title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
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

        <div className="text-center">
          <Link to="/about">
            <Button variant="outline" size="lg" className="group">
              {t("team.preview.viewAll")}
              {language === "he" ? (
                <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
              ) : (
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              )}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TeamPreview;
