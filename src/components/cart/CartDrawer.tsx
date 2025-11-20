import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CartDrawer = () => {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, isDrawerOpen, setIsDrawerOpen } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return `₪${price.toFixed(2)}`;
  };

  const handleCheckout = () => {
    setIsDrawerOpen(false);
    navigate('/checkout');
  };

  const handleViewCart = () => {
    setIsDrawerOpen(false);
    navigate('/cart');
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} direction="left">
      <DrawerContent className="h-full w-full sm:w-[400px] left-0">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {language === 'he' ? 'עגלת קניות' : 'Shopping Cart'}
            {itemCount > 0 && (
              <span className="text-sm text-muted-foreground">({itemCount})</span>
            )}
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                {language === 'he' ? 'העגלה ריקה' : 'Cart is empty'}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {language === 'he' ? 'הוסף מוצרים לעגלה כדי להתחיל' : 'Add products to get started'}
              </p>
              <Button onClick={() => setIsDrawerOpen(false)}>
                {language === 'he' ? 'המשך לקניות' : 'Continue Shopping'}
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={language === 'he' ? item.name : item.name_en || item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium mb-1 line-clamp-2">
                        {language === 'he' ? item.name : item.name_en || item.name}
                      </h4>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground mb-2">SKU: {item.sku}</p>
                      )}
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(item.unit_price)}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive mr-auto"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <p className="font-semibold">
                          {formatPrice(item.line_total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="border-t p-4 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{language === 'he' ? 'סה"כ' : 'Subtotal'}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleCheckout}
                >
                  {language === 'he' ? 'לצ׳קאאוט' : 'Checkout'}
                  {language === 'he' ? (
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  ) : (
                    <ArrowRight className="w-4 h-4 ml-2" />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewCart}
                >
                  {language === 'he' ? 'צפה בעגלה המלאה' : 'View Full Cart'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
