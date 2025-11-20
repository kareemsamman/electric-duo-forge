import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/FadeIn';
import { Minus, Plus, ShoppingCart, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.id, product?.category],
    queryFn: async () => {
      if (!product) return [];
      
      // First try to get products from related_product_ids
      if (product.related_product_ids && product.related_product_ids.length > 0) {
        const { data } = await supabase
          .from('products')
          .select('*')
          .in('id', product.related_product_ids)
          .limit(6);
        
        if (data && data.length > 0) return data;
      }
      
      // Fallback to products from same category
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(6);
      
      return data || [];
    },
    enabled: !!product
  });

  const images = product?.images && product.images.length > 0 
    ? product.images 
    : product?.product_image 
    ? [product.product_image] 
    : [];

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {language === 'he' ? 'המוצר לא נמצא' : 'Product not found'}
          </h2>
          <Button onClick={() => navigate('/store')}>
            {language === 'he' ? 'חזרה לחנות' : 'Back to Store'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        {/* Breadcrumbs */}
        <FadeIn>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <button onClick={() => navigate('/')} className="hover:text-foreground flex items-center gap-1">
              <Home className="w-4 h-4" />
              {language === 'he' ? 'דף הבית' : 'Home'}
            </button>
            <span>/</span>
            <button onClick={() => navigate('/store')} className="hover:text-foreground">
              {language === 'he' ? 'חנות' : 'Store'}
            </button>
            <span>/</span>
            <span>{language === 'he' ? product.category : product.category}</span>
            <span>/</span>
            <span className="text-foreground">
              {language === 'he' ? product.product_name : product.product_name_en || product.product_name}
            </span>
          </div>
        </FadeIn>

        {/* Product Detail */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Image Gallery */}
          <FadeIn delay={0.1}>
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
                {images.length > 0 && (
                  <>
                    <img
                      src={images[selectedImageIndex]}
                      alt={language === 'he' ? product.product_name : product.product_name_en || product.product_name}
                      className="w-full h-full object-cover"
                    />
                    
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.product_name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Product Info */}
          <FadeIn delay={0.2}>
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">
                  {language === 'he' ? product.product_name : product.product_name_en || product.product_name}
                </h1>
                <p className="text-3xl font-bold text-primary">
                  ₪{Number(product.price).toFixed(2)}
                </p>
              </div>

              {product.sku && (
                <p className="text-sm text-muted-foreground">
                  SKU: {product.sku}
                </p>
              )}

              <div className="flex items-center gap-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.in_stock 
                    ? (language === 'he' ? 'במלאי' : 'In Stock')
                    : (language === 'he' ? 'חסר במלאי' : 'Out of Stock')
                  }
                </span>
                {product.stock_qty > 0 && (
                  <span className="text-sm text-muted-foreground">
                    ({product.stock_qty} {language === 'he' ? 'יחידות' : 'units'})
                  </span>
                )}
              </div>

              {product.short_description_he && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {language === 'he' ? product.short_description_he : product.short_description_en || product.short_description_he}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 py-4 border-y">
                <span className="font-medium">
                  {language === 'he' ? 'כמות:' : 'Quantity:'}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!product.in_stock}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-16 text-center font-semibold text-xl">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!product.in_stock || (product.stock_qty > 0 && quantity >= product.stock_qty)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button 
                size="lg" 
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.in_stock}
              >
                <ShoppingCart className={`w-5 h-5 ${language === 'he' ? 'ml-2' : 'mr-2'}`} />
                {language === 'he' ? 'הוסף לעגלה' : 'Add to Cart'}
              </Button>

              {/* Product Description */}
              {product.product_description && (
                <div className="pt-8 border-t">
                  <h2 className="text-2xl font-semibold mb-4">
                    {language === 'he' ? 'תיאור המוצר' : 'Product Description'}
                  </h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="whitespace-pre-line">
                      {language === 'he' ? product.product_description : product.product_description_en || product.product_description}
                    </p>
                  </div>
                </div>
              )}

              {/* Product Specs */}
              {product.product_specs && (
                <div className="pt-8 border-t">
                  <h2 className="text-2xl font-semibold mb-4">
                    {language === 'he' ? 'מפרט טכני' : 'Technical Specifications'}
                  </h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <p className="whitespace-pre-line">
                      {language === 'he' ? product.product_specs : product.product_specs_en || product.product_specs}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="pt-20 border-t">
            <FadeIn>
              <h2 className="text-3xl font-bold mb-8">
                {language === 'he' ? 'מוצרים קשורים' : 'Related Products'}
              </h2>
            </FadeIn>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <FadeIn key={relatedProduct.id} delay={0.1 + index * 0.05}>
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
                    onClick={() => navigate(`/product/${relatedProduct.slug}`)}
                  >
                    <img
                      src={relatedProduct.thumbnail || relatedProduct.product_image}
                      alt={language === 'he' ? relatedProduct.product_name : relatedProduct.product_name_en || relatedProduct.product_name}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">
                        {language === 'he' ? relatedProduct.product_name : relatedProduct.product_name_en || relatedProduct.product_name}
                      </h3>
                      <p className="text-lg font-bold text-primary">
                        ₪{Number(relatedProduct.price).toFixed(2)}
                      </p>
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
