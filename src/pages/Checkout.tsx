import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FadeIn } from '@/components/animations/FadeIn';
import { Home, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, 'השם חייב להכיל לפחות 2 תווים'),
  customer_phone: z.string().trim().min(9, 'מספר טלפון לא תקין'),
  customer_email: z.string().trim().email('כתובת אימייל לא תקינה'),
  customer_city: z.string().trim().min(2, 'עיר חייבת להכיל לפחות 2 תווים'),
  customer_address: z.string().trim().min(5, 'כתובת חייבת להכיל לפחות 5 תווים'),
  customer_notes: z.string().optional(),
  payment_method: z.enum(['cash', 'visa'])
});

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_city: '',
    customer_address: '',
    customer_notes: '',
    payment_method: 'cash' as 'cash' | 'visa'
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const deliveryFee = 0; // Can be calculated based on location later
  const total = subtotal + deliveryFee;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return `₪${price.toFixed(2)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form
    try {
      checkoutSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error(language === 'he' ? 'נא למלא את כל השדות הנדרשים' : 'Please fill all required fields');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email,
          customer_city: formData.customer_city,
          customer_address: formData.customer_address,
          customer_notes: formData.customer_notes || null,
          payment_method: formData.payment_method,
          payment_status: 'pending',
          status: 'pending',
          total_items: totalItems,
          subtotal: Number(subtotal.toFixed(2)),
          delivery_fee: Number(deliveryFee.toFixed(2)),
          total: Number(total.toFixed(2)),
          user_id: user?.id || null,
          cart_items: items.map(item => ({
            product_id: item.product_id,
            name: item.name,
            sku: item.sku,
            unit_price: item.unit_price,
            quantity: item.quantity,
            line_total: item.line_total
          }))
        })
        .select()
        .single();

      if (error) throw error;

      // Clear cart
      clearCart();

      // Show success message
      if (formData.payment_method === 'visa') {
        toast.success(language === 'he' 
          ? 'ההזמנה נקלטה בהצלחה! תשלום בכרטיס אשראי עדיין לא פעיל. נחזור אליך להשלמת התשלום.'
          : 'Order placed successfully! Card payment is not active yet. We will contact you to complete payment.'
        );
      } else {
        toast.success(language === 'he' 
          ? 'ההזמנה נקלטה בהצלחה! התשלום יבוצע במזומן בעת האספקה.'
          : 'Order placed successfully! Payment will be collected in cash upon delivery.'
        );
      }

      // Navigate to order confirmation
      navigate(`/order/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(language === 'he' 
        ? 'אירעה שגיאה בעת יצירת ההזמנה. אנא נסה שוב.'
        : 'An error occurred while creating the order. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null;
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
            <button onClick={() => navigate('/cart')} className="hover:text-foreground">
              {language === 'he' ? 'עגלה' : 'Cart'}
            </button>
            <span>/</span>
            <span className="text-foreground">{language === 'he' ? 'תשלום' : 'Checkout'}</span>
          </div>
        </FadeIn>

        {/* Page Title */}
        <FadeIn delay={0.1}>
          <h1 className="text-4xl md:text-5xl font-bold mb-12">
            {language === 'he' ? 'השלמת הזמנה' : 'Complete Your Order'}
          </h1>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <FadeIn delay={0.2}>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Details */}
                <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-4">
                  <h2 className="text-2xl font-semibold mb-4">
                    {language === 'he' ? 'פרטי הלקוח' : 'Customer Details'}
                  </h2>
                  
                  <div>
                    <Label htmlFor="customer_name">
                      {language === 'he' ? 'שם מלא' : 'Full Name'} *
                    </Label>
                    <Input
                      id="customer_name"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      className={errors.customer_name ? 'border-destructive' : ''}
                    />
                    {errors.customer_name && (
                      <p className="text-sm text-destructive mt-1">{errors.customer_name}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_phone">
                        {language === 'he' ? 'טלפון' : 'Phone'} *
                      </Label>
                      <Input
                        id="customer_phone"
                        name="customer_phone"
                        type="tel"
                        value={formData.customer_phone}
                        onChange={handleInputChange}
                        className={errors.customer_phone ? 'border-destructive' : ''}
                      />
                      {errors.customer_phone && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer_email">
                        {language === 'he' ? 'אימייל' : 'Email'} *
                      </Label>
                      <Input
                        id="customer_email"
                        name="customer_email"
                        type="email"
                        value={formData.customer_email}
                        onChange={handleInputChange}
                        className={errors.customer_email ? 'border-destructive' : ''}
                      />
                      {errors.customer_email && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer_city">
                        {language === 'he' ? 'עיר' : 'City'} *
                      </Label>
                      <Input
                        id="customer_city"
                        name="customer_city"
                        value={formData.customer_city}
                        onChange={handleInputChange}
                        className={errors.customer_city ? 'border-destructive' : ''}
                      />
                      {errors.customer_city && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_city}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="customer_address">
                        {language === 'he' ? 'כתובת מלאה' : 'Full Address'} *
                      </Label>
                      <Input
                        id="customer_address"
                        name="customer_address"
                        value={formData.customer_address}
                        onChange={handleInputChange}
                        className={errors.customer_address ? 'border-destructive' : ''}
                      />
                      {errors.customer_address && (
                        <p className="text-sm text-destructive mt-1">{errors.customer_address}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="customer_notes">
                      {language === 'he' ? 'הערות להזמנה' : 'Order Notes'}
                    </Label>
                    <Textarea
                      id="customer_notes"
                      name="customer_notes"
                      value={formData.customer_notes}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder={language === 'he' ? 'הערות נוספות (אופציונלי)' : 'Additional notes (optional)'}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card rounded-2xl border shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    {language === 'he' ? 'אמצעי תשלום' : 'Payment Method'}
                  </h2>
                  
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value as 'cash' | 'visa' }))}
                  >
                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="w-5 h-5" />
                        <span>{language === 'he' ? 'מזומן' : 'Cash'}</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="visa" id="visa" />
                      <Label htmlFor="visa" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5" />
                        <span>{language === 'he' ? 'כרטיס אשראי (ויזה)' : 'Credit Card (Visa)'}</span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.payment_method === 'visa' && (
                    <p className="mt-4 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {language === 'he' 
                        ? 'שים לב: תשלום בכרטיס אשראי עדיין לא פעיל. נחזור אליך להשלמת התשלום.'
                        : 'Note: Card payment is not active yet. We will contact you to complete payment.'
                      }
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      {language === 'he' ? 'מעבד...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {language === 'he' ? 'סיום הזמנה' : 'Complete Order'}
                    </>
                  )}
                </Button>
              </form>
            </FadeIn>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <FadeIn delay={0.3}>
              <div className="bg-card rounded-2xl border shadow-sm p-6 sticky top-24">
                <h2 className="text-2xl font-semibold mb-6">
                  {language === 'he' ? 'סיכום הזמנה' : 'Order Summary'}
                </h2>
                
                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 pb-4 border-b">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatPrice(item.unit_price)}
                        </p>
                        <p className="text-sm font-semibold">{formatPrice(item.line_total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>{language === 'he' ? 'סה"כ מוצרים' : 'Subtotal'}</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>{language === 'he' ? 'משלוח' : 'Delivery'}</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (language === 'he' ? 'חינם' : 'Free') : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xl font-bold pt-3 border-t">
                    <span>{language === 'he' ? 'סה"כ לתשלום' : 'Total'}</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}
