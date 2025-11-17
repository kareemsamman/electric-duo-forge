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
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (!products || products.length === 0) return null;

  return (
    <section className="py-32 md:py-40 bg-secondary/30 overflow-hidden">
      <div className="w-full px-6">
        <FadeIn>
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              {t("featured.products.title")}
            </h2>
            <div className="w-[70px] h-1 bg-gradient-to-r from-[#1A73E8] to-[#00B0FF] mx-auto rounded-full" />
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
            <CarouselContent className="-ml-3 md:-ml-6">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-3 md:pl-6 md:basis-1/2 lg:basis-1/3">
                  <Link to={`/store?product=${product.id}`} className="block group">
                    <div className="relative h-[480px] rounded-3xl overflow-hidden cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)] transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01]">
                      <img 
                        src={product.product_image} 
                        alt={language === "he" ? product.product_name : product.product_name_en || product.product_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-6 md:p-8 pt-24">
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white tracking-tight">
                          {language === "he" ? product.product_name : product.product_name_en || product.product_name}
                        </h3>
                        <p className="text-sm text-gray-200 mb-5 leading-relaxed line-clamp-2">
                          {language === "he" ? product.product_specs : product.product_specs_en || product.product_specs}
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-3xl md:text-4xl font-bold text-white">₪{product.price.toLocaleString()}</span>
                          <Button 
                            variant="ghost" 
                            className="rounded-full border border-white bg-transparent text-white hover:bg-white/15 hover:border-white/90 transition-all px-5 h-11 gap-2"
                            onClick={(e) => {
                              e.preventDefault();
                              // Add to cart logic here
                            }}
                          >
                            {language === "he" ? (
                              <>
                                הוספה לעגלה
                                <ShoppingCart className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4" />
                                Add to cart
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-white hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all w-12 h-12 border-0" />
            <CarouselNext className="hidden md:flex -right-4 bg-white hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all w-12 h-12 border-0" />
          </Carousel>
        </div>

        <FadeIn delay={0.5}>
          <div className="text-center">
            <Link to="/store">
              <AnimatedButton>
                <Button 
                  size="lg" 
                  className="h-14 px-8 rounded-full text-base font-semibold shadow-md hover:shadow-lg transition-all group border border-white/20 bg-[#1A73E8] hover:bg-[#155BB7] text-white"
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
