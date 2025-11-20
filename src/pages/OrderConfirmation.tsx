import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animations/FadeIn';
import { CheckCircle, Package, CreditCard, Banknote, MapPin, Phone, Mail, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';

export default function OrderConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const formatPrice = (price: number) => {
    return `₪${Number(price).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            {language === 'he' ? 'ההזמנה לא נמצאה' : 'Order not found'}
          </h2>
          <Button onClick={() => navigate('/store')}>
            {language === 'he' ? 'חזרה לחנות' : 'Back to Store'}
          </Button>
        </div>
      </div>
    );
  }

  const cartItems = order.cart_items as any[];

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-4xl">
        {/* Success Message */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'he' ? 'תודה על ההזמנה!' : 'Thank You for Your Order!'}
            </h1>
            <p className="text-lg text-muted-foreground">
              {language === 'he' 
                ? 'קיבלנו את הזמנתך ונחזור אליך בהקדם'
                : 'We have received your order and will contact you soon'
              }
            </p>
          </div>
        </FadeIn>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Order Info Card */}
          <FadeIn delay={0.1}>
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'he' ? 'מספר הזמנה' : 'Order Number'}
                  </p>
                  <p className="font-mono font-semibold">{order.id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'he' ? 'תאריך הזמנה' : 'Order Date'}
                  </p>
                  <p className="font-semibold">
                    {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Payment Method */}
          <FadeIn delay={0.2}>
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                {order.payment_method === 'cash' ? (
                  <Banknote className="w-5 h-5" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {language === 'he' ? 'אמצעי תשלום' : 'Payment Method'}
              </h2>
              <p className="font-medium mb-2">
                {order.payment_method === 'cash' 
                  ? (language === 'he' ? 'מזומן' : 'Cash')
                  : (language === 'he' ? 'כרטיס אשראי (ויזה)' : 'Credit Card (Visa)')
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {order.payment_method === 'cash' 
                  ? (language === 'he' 
                      ? 'התשלום יתבצע במזומן בעת האספקה או האיסוף'
                      : 'Payment will be collected in cash upon delivery or pickup'
                    )
                  : (order.payment_status === 'paid' 
                      ? (language === 'he'
                          ? 'התשלום בוצע בהצלחה בכרטיס אשראי'
                          : 'Payment was successfully completed by credit card'
                        )
                      : (language === 'he'
                          ? 'ממתין לאישור תשלום בכרטיס אשראי'
                          : 'Waiting for credit card payment confirmation'
                        )
                    )
                }
              </p>
            </div>
          </FadeIn>

          {/* Customer Details */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                {language === 'he' ? 'פרטי משלוח' : 'Delivery Details'}
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.customer_address}, {order.customer_city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm">{order.customer_phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <p className="text-sm">{order.customer_email}</p>
                </div>
                {order.customer_notes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">
                      {language === 'he' ? 'הערות' : 'Notes'}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Order Items */}
          <FadeIn delay={0.4}>
            <div className="bg-card rounded-2xl border shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                {language === 'he' ? 'פריטי הזמנה' : 'Order Items'}
              </h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      {item.sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-semibold">{formatPrice(item.line_total)}</p>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-2 pt-4 border-t mt-4">
                <div className="flex justify-between">
                  <span>{language === 'he' ? 'סה"כ מוצרים' : 'Subtotal'}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'he' ? 'משלוח' : 'Delivery'}</span>
                  <span>
                    {Number(order.delivery_fee) === 0 
                      ? (language === 'he' ? 'חינם' : 'Free') 
                      : formatPrice(order.delivery_fee)
                    }
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>{language === 'he' ? 'סה"כ' : 'Total'}</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Actions */}
          <FadeIn delay={0.5}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" onClick={() => navigate('/store')}>
                {language === 'he' ? 'המשך לקניות' : 'Continue Shopping'}
              </Button>
              <Button size="lg" variant="outline" onClick={() => window.print()}>
                {language === 'he' ? 'הדפס הזמנה' : 'Print Order'}
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
