import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

const Store = () => {
  const { t, language } = useLanguage();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            {t("store.title")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
            {t("store.description")}
          </p>
        </FadeIn>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-secondary" />
                <CardContent className="pt-6 pb-6">
                  <div className="h-6 bg-secondary mb-4" />
                  <div className="h-4 bg-secondary mb-2" />
                  <div className="h-4 bg-secondary w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
            {products?.map((product) => (
              <StaggerItem key={product.id}>
                <AnimatedCard>
                  <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
                    <div className="h-48 bg-secondary flex items-center justify-center">
                      <img 
                        src={product.product_image} 
                        alt={language === "he" ? product.product_name : product.product_name_en || product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-6 pb-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {language === "he" ? product.product_name : product.product_name_en || product.product_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {language === "he" ? product.product_specs : product.product_specs_en || product.product_specs}
                      </p>
                      <p className="text-sm mb-4">
                        {language === "he" ? product.product_description : product.product_description_en || product.product_description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-accent">₪{product.price}</span>
                        <span className="text-xs text-muted-foreground">{product.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
};

export default Store;
