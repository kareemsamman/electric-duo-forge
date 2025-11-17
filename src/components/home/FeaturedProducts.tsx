import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { AnimatedButton } from "@/components/animations/AnimatedButton";

const FeaturedProducts = () => {
  const { t, language } = useLanguage();

  const { data: products } = useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
  });

  if (!products || products.length === 0) return null;

  return (
    <section className="py-32 md:py-40 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {t("featured.products.title")}
            </h2>
            <div className="w-20 h-1 bg-accent/30 mx-auto mt-6" />
          </div>
        </FadeIn>

        <StaggerContainer className="grid md:grid-cols-3 gap-10 lg:gap-12 mb-16" staggerDelay={0.15}>
          {products.map((product) => (
            <StaggerItem key={product.id}>
              <AnimatedCard>
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] group cursor-pointer">
                  <div className="h-56 bg-secondary flex items-center justify-center overflow-hidden">
                    <img 
                      src={product.product_image} 
                      alt={language === "he" ? product.product_name : product.product_name_en || product.product_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="pt-8 pb-8">
                    <h3 className="text-2xl font-bold mb-3 tracking-tight">
                      {language === "he" ? product.product_name : product.product_name_en || product.product_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                      {language === "he" ? product.product_specs : product.product_specs_en || product.product_specs}
                    </p>
                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-border/50">
                      <span className="text-3xl font-bold text-accent">₪{product.price.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeIn delay={0.5}>
          <div className="text-center">
            <Link to="/store">
              <AnimatedButton>
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-xl text-base font-semibold shadow-md hover:shadow-lg transition-all group"
                >
                  {t("featured.products.viewAll")}
                  {language === "he" ? (
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                  ) : (
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  )}
                </Button>
              </AnimatedButton>
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default FeaturedProducts;
