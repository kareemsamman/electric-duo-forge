import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";
import { FadeIn } from "@/components/animations/FadeIn";
import { AnimatedButton } from "@/components/animations/AnimatedButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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

        <div className="mb-16" dir={language === "he" ? "rtl" : "ltr"}>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              direction: language === "he" ? "rtl" : "ltr",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Link to={`/store?product=${product.id}`} className="block group">
                    <div className="relative h-[450px] rounded-2xl overflow-hidden cursor-pointer">
                      <img 
                        src={product.product_image} 
                        alt={language === "he" ? product.product_name : product.product_name_en || product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-6 pt-20">
                        <h3 className="text-2xl font-bold mb-2 text-white tracking-tight">
                          {language === "he" ? product.product_name : product.product_name_en || product.product_name}
                        </h3>
                        <p className="text-sm text-gray-200 mb-4 leading-relaxed line-clamp-2">
                          {language === "he" ? product.product_specs : product.product_specs_en || product.product_specs}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-3xl font-bold text-white">₪{product.price.toLocaleString()}</span>
                          <Button 
                            variant="outline" 
                            className="rounded-full border-white/80 bg-transparent text-white hover:bg-white/10 hover:border-white transition-all px-6"
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to cart logic here
                            }}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {language === "he" ? "הוספה לעגלה" : "Add to cart"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        <FadeIn delay={0.5}>
          <div className="text-center">
            <Link to="/store">
              <AnimatedButton>
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full text-base font-semibold shadow-md hover:shadow-lg transition-all group border border-white/20"
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
