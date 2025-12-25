import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FadeIn } from '@/components/animations/FadeIn';
import { Home, CreditCard, Loader2, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, 'השם חייב להכיל לפחות 2 תווים'),
  customer_phone: z.string()
    .trim()
    .regex(/^0\d{9}$/, 'מספר טלפון חייב להתחיל ב-0 ולהכיל 10 ספרות'),
  customer_email: z.string().trim().email('כתובת אימייל לא תקינה'),
  customer_city: z.string().trim().min(2, 'עיר חייבת להכיל לפחות 2 תווים'),
  customer_address: z.string().trim().min(5, 'כתובת חייבת להכיל לפחות 5 תווים'),
  customer_notes: z.string().optional(),
  shipping_method_id: z.string().uuid('נא לבחור שיטת משלוח')
});

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_city: '',
    customer_address: '',
    customer_notes: '',
    shipping_method_id: ''
  });

  // Fetch shipping methods
  const { data: shippingMethods } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  // Redirect if cart is empty (but not if showing success dialog)
  useEffect(() => {
    if (items.length === 0 && !showSuccessDialog) {
      navigate('/cart');
    }
  }, [items, navigate, showSuccessDialog]);

  const selectedShipping = shippingMethods?.find(s => s.id === formData.shipping_method_id);
  const deliveryFee = selectedShipping?.price || 0;
  const total = subtotal + deliveryFee;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const formatPrice = (price: number) => {
    return `₪${price.toFixed(2)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Phone number validation - only numbers, max 10 digits
    if (name === 'customer_phone') {
      const numericValue = value.replace(/\D/g, ''); // Remove non-digits
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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

      // Create order with visa payment method
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email,
          customer_city: formData.customer_city,
          customer_address: formData.customer_address,
          customer_notes: formData.customer_notes || null,
          payment_method: 'visa',
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

      // Send order notification email to admin
      let emailStatus = 'sent';
      let emailError = null;
      
      try {
        // Format order details for email
        const orderItemsList = items.map(item => 
          `${item.name} x ${item.quantity} - ${formatPrice(item.line_total)}`
        ).join('\n');

        const orderDetails = `
פרטי ההזמנה #${order.id}

לקוח: ${formData.customer_name}
טלפון: ${formData.customer_phone}
אימייל: ${formData.customer_email}
כתובת: ${formData.customer_address}, ${formData.customer_city}
שיטת משלוח: ${selectedShipping?.name || 'רגיל'} (${formatPrice(deliveryFee)})
אמצעי תשלום: כרטיס אשראי (ממתין לאישור)

פריטים:
${orderItemsList}

סכום ביניים: ${formatPrice(subtotal)}
דמי משלוח: ${formatPrice(deliveryFee)}
סה"כ לתשלום: ${formatPrice(total)}

${formData.customer_notes ? `הערות:\n${formData.customer_notes}` : ''}

⚠️ הלקוח בחר תשלום בכרטיס אשראי - יש ליצור קשר עם הלקוח להמשך התהליך.
        `.trim();

        const { sendEmailViaGmail } = await import('@/lib/emailService');
        const emailResult = await sendEmailViaGmail({
          form_type: "Shop Order - Credit Card",
          name: formData.customer_name,
          email: formData.customer_email,
          subject: `הזמנה חדשה (כרטיס אשראי) #${order.id}`,
          message: orderDetails,
          Phone: formData.customer_phone,
          City: formData.customer_city,
          Order_Details: orderItemsList
        });
        
        if (!emailResult.success) {
          emailStatus = 'failed';
          emailError = emailResult.message;
          console.error('Error sending order email:', emailResult.message);
        }
      } catch (emailCatchError: any) {
        emailStatus = 'failed';
        emailError = emailCatchError.message;
        console.error('Error sending order email:', emailCatchError);
      }

      // Update order with email tracking
      await supabase
        .from('orders')
        .update({
          email_last_type: 'new_order_visa',
          email_last_status: emailStatus,
          email_last_error: emailError,
          email_last_sent_at: new Date().toISOString()
        })
        .eq('id', order.id);

      // Clear cart
      clearCart();

      // Show success dialog
      setShowSuccessDialog(true);
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

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate('/');
  };

  if (items.length === 0 && !showSuccessDialog) {
    return null;
  }

  // Show only success dialog when cart is empty but dialog should be visible
  if (items.length === 0 && showSuccessDialog) {
    return (
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">
              {language === 'he' ? 'ההזמנה התקבלה!' : 'Order Received!'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {language === 'he' 
                ? 'תודה על הזמנתך! קיבלנו את פרטי ההזמנה שלך. נציג שלנו יצור איתך קשר בהקדם להשלמת התשלום ואישור ההזמנה.'
                : 'Thank you for your order! We have received your order details. Our representative will contact you shortly to complete the payment and confirm your order.'
              }
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleCloseSuccessDialog} className="w-full mt-4">
            {language === 'he' ? 'לדף הבית' : 'Go to Home'}
          </Button>
        </DialogContent>
      </Dialog>
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
                        placeholder="0525143581"
                        maxLength={10}
                        pattern="[0-9]*"
                        inputMode="numeric"
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

                {/* Shipping Method */}
                <div className="bg-card rounded-2xl border shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {language === 'he' ? 'שיטת משלוח *' : 'Shipping Method *'}
                  </h2>
                  
                  <div className="space-y-2">
                    <Select
                      value={formData.shipping_method_id}
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, shipping_method_id: value }));
                        if (errors.shipping_method_id) {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.shipping_method_id;
                            return newErrors;
                          });
                        }
                      }}
                    >
                      <SelectTrigger 
                        className={`text-right ${errors.shipping_method_id ? 'border-destructive' : ''}`}
                      >
                        <SelectValue placeholder={language === 'he' ? 'בחר שיטת משלוח' : 'Select shipping method'} />
                      </SelectTrigger>
                      <SelectContent dir={language === 'he' ? 'rtl' : 'ltr'} className="text-right">
                        {shippingMethods?.map((method) => (
                          <SelectItem key={method.id} value={method.id} className="text-right flex justify-between">
                            <span className="flex-1 text-right">{language === 'he' ? method.name : method.name_en || method.name}</span>
                            <span className="mr-2">₪{method.price}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.shipping_method_id && (
                      <p className="text-sm text-destructive">{errors.shipping_method_id}</p>
                    )}
                  </div>
                </div>

                {/* Payment Method - Credit Card Only */}
                <div className="bg-card rounded-2xl border shadow-sm p-6">
                  <h2 className="text-2xl font-semibold mb-4">
                    {language === 'he' ? 'אמצעי תשלום' : 'Payment Method'}
                  </h2>
                  
                  <div className="flex items-center gap-3 p-4 border rounded-lg bg-accent/50">
                    <CreditCard className="w-6 h-6 text-primary" />
                    <span className="font-medium">
                      {language === 'he' ? 'כרטיס אשראי' : 'Credit Card'}
                    </span>
                  </div>

                  <p className="mt-4 text-sm text-foreground bg-primary/10 p-3 rounded-lg border border-primary/20">
                    {language === 'he' 
                      ? 'לאחר מילוי הפרטים, נציג יצור איתך קשר להשלמת התשלום.'
                      : 'After filling in your details, a representative will contact you to complete the payment.'
                    }
                  </p>
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
                    <span>{language === 'he' ? 'משלוח' : 'Shipping'}</span>
                    <span className="font-semibold">
                      {formData.shipping_method_id ? formatPrice(deliveryFee) : '-'}
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <DialogHeader className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">
              {language === 'he' ? 'ההזמנה התקבלה!' : 'Order Received!'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {language === 'he' 
                ? 'קיבלנו את פרטי ההזמנה שלך. נציג שלנו יצור איתך קשר בהקדם להשלמת התשלום ואישור ההזמנה.'
                : 'We have received your order details. Our representative will contact you shortly to complete the payment and confirm your order.'
              }
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleCloseSuccessDialog} className="w-full mt-4">
            {language === 'he' ? 'לדף הבית' : 'Go to Home'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
