import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 animate-fade-in">
          {t("featured.products.title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {products.map((product, index) => (
            <Card 
              key={product.id} 
              className="overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
                <div className="flex items-center justify-between mt-4">
                  <span className="text-2xl font-bold text-accent">₪{product.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/store">
            <Button size="lg" className="group">
              {t("featured.products.viewAll")}
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

export default FeaturedProducts;
