import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FadeIn } from "@/components/animations/FadeIn";
import { StaggerContainer } from "@/components/animations/StaggerContainer";
import { StaggerItem } from "@/components/animations/StaggerItem";
import { AnimatedCard } from "@/components/animations/AnimatedCard";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search } from "lucide-react";

const Store = () => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("display_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products?.filter(product => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const productName = (language === 'he' ? product.product_name : product.product_name_en || product.product_name).toLowerCase();
    const productDesc = (language === 'he' ? product.short_description_he : product.short_description_en)?.toLowerCase() || '';
    const productCategory = product.category.toLowerCase();
    
    return productName.includes(searchLower) || 
           productDesc.includes(searchLower) ||
           productCategory.includes(searchLower);
  });

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            {t("store.title")}
          </h1>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="text-xl text-muted-foreground text-center mb-8 max-w-3xl mx-auto">
            {t("store.description")}
          </p>
        </FadeIn>

        {/* Search Bar */}
        <FadeIn delay={0.3}>
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${language === 'he' ? 'right-3' : 'left-3'}`} />
              <Input
                type="text"
                placeholder={language === 'he' ? 'חפש מוצרים...' : 'Search products...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${language === 'he' ? 'pr-10' : 'pl-10'} h-12 text-lg`}
              />
            </div>
          </div>
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
        ) : filteredProducts && filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              {language === 'he' ? 'לא נמצאו מוצרים' : 'No products found'}
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid md:grid-cols-3 gap-8" staggerDelay={0.15}>
            {filteredProducts?.map((product) => (
              <StaggerItem key={product.id}>
                <AnimatedCard>
                  <Card 
                    className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => navigate(`/product/${product.slug}`)}
                  >
                    <div className="h-48 bg-secondary flex items-center justify-center">
                      <img 
                        src={product.product_image} 
                        alt={language === "he" ? product.product_name : product.product_name_en || product.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-6 pb-6">
                      <p className="text-destructive font-semibold text-xs mb-1">
                        {language === 'he' ? '* הזמנה מינימלית: 100 יחידות' : '* Minimum order: 100 units'}
                      </p>
                      <h3 className="text-xl font-semibold mb-2">
                        {language === "he" ? product.product_name : product.product_name_en || product.product_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {language === "he" ? product.short_description_he || product.product_specs : product.short_description_en || product.product_specs_en || product.product_specs}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">₪{Number(product.price).toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">{product.category}</span>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                        disabled={!product.in_stock}
                      >
                        <ShoppingCart className={`w-4 h-4 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                        {language === 'he' ? 'הוסף לעגלה' : 'Add to Cart'}
                      </Button>
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
