import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FadeIn } from '@/components/animations/FadeIn';

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return `₪${price.toFixed(2)}`;
  };

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
            <span className="text-foreground">{language === 'he' ? 'עגלה' : 'Cart'}</span>
          </div>
        </FadeIn>

        {/* Page Title */}
        <FadeIn delay={0.1}>
          <h1 className="text-4xl md:text-5xl font-bold mb-12">
            {language === 'he' ? 'עגלת הקניות שלי' : 'My Shopping Cart'}
          </h1>
        </FadeIn>

        {items.length === 0 ? (
          <FadeIn delay={0.2}>
            <div className="text-center py-20">
              <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
              <h2 className="text-2xl font-semibold mb-4">
                {language === 'he' ? 'העגלה שלך ריקה' : 'Your cart is empty'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {language === 'he' ? 'נראה שעדיין לא הוספת מוצרים לעגלה' : "Looks like you haven't added any products yet"}
              </p>
              <Button size="lg" onClick={() => navigate('/store')}>
                {language === 'he' ? 'חזרה לחנות' : 'Back to Store'}
                <ArrowLeft className={`w-4 h-4 ${language === 'he' ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </div>
          </FadeIn>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <FadeIn key={item.id} delay={0.1 + index * 0.05}>
                  <div className="flex gap-6 p-6 bg-card rounded-2xl border shadow-sm">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={language === 'he' ? item.name : item.name_en || item.name}
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      />
                    )}
                    
                    <div className="flex-1">
                      <h3 
                        className="text-xl font-semibold mb-2 hover:text-primary cursor-pointer transition-colors"
                        onClick={() => navigate(`/product/${item.product_id}`)}
                      >
                        {language === 'he' ? item.name : item.name_en || item.name}
                      </h3>
                      
                      {item.sku && (
                        <p className="text-sm text-muted-foreground mb-4">
                          SKU: {item.sku}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.product_id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>

                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.unit_price)} × {item.quantity}
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(item.line_total)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <FadeIn delay={0.3}>
                <div className="bg-card rounded-2xl border shadow-sm p-6 sticky top-24">
                  <h2 className="text-2xl font-semibold mb-6">
                    {language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-lg">
                      <span>{language === 'he' ? 'סה"כ מוצרים' : 'Subtotal'}</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground">
                        {language === 'he' ? 'דמי משלוח יחושבו בתשלום' : 'Delivery fee calculated at checkout'}
                      </p>
                    </div>
                    
                    <div className="border-t pt-4 flex justify-between text-xl font-bold">
                      <span>{language === 'he' ? 'סה"כ לתשלום' : 'Total'}</span>
                      <span className="text-primary">{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => navigate('/checkout')}
                  >
                    {language === 'he' ? 'מעבר לתשלום' : 'Proceed to Checkout'}
                    <ArrowLeft className={`w-4 h-4 ${language === 'he' ? 'mr-2 rotate-180' : 'ml-2'}`} />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                    onClick={() => navigate('/store')}
                  >
                    {language === 'he' ? 'המשך לקניות' : 'Continue Shopping'}
                  </Button>
                </div>
              </FadeIn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
