import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, ArrowRight, ArrowLeft, MailWarning, MailCheck, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus, orderData }: { orderId: string, newStatus: string, orderData: any }) => {
      const { data: adminSettings } = await supabase
        .from('site_content')
        .select('value_he')
        .eq('key', 'admin_email')
        .single();

      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (updateError) throw updateError;

      let emailStatus = 'sent';
      let emailError = null;

      try {
        const { error: emailSendError } = await supabase.functions.invoke('send-order-email', {
          body: {
            order_id: orderId,
            customer_email: orderData.customer_email,
            customer_name: orderData.customer_name,
            admin_email: adminSettings?.value_he || 'morshea500@gmail.com',
            email_type: 'status_update',
            status: newStatus,
            order_details: {
              total_items: orderData.total_items,
              subtotal: orderData.subtotal,
              delivery_fee: orderData.delivery_fee,
              total: orderData.total,
              cart_items: orderData.cart_items,
              payment_method: orderData.payment_method,
              shipping_method: 'רגיל',
              customer_address: orderData.customer_address,
              customer_city: orderData.customer_city,
              customer_phone: orderData.customer_phone
            }
          }
        });
        if (emailSendError) {
          emailStatus = 'failed';
          emailError = emailSendError.message;
        }
      } catch (error: any) {
        emailStatus = 'failed';
        emailError = error.message;
      }

      await supabase
        .from('orders')
        .update({
          email_last_type: 'status_update',
          email_last_status: emailStatus,
          email_last_error: emailError,
          email_last_sent_at: new Date().toISOString()
        })
        .eq('id', orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    }
  });

  const filteredOrders = orders?.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-muted/20 py-12 pt-32 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          {language === 'he' ? (
            <><ArrowRight className="ml-2 h-4 w-4" />חזרה ללוח הבקרה</>
          ) : (
            <><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</>
          )}
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ניהול הזמנות</h1>
          <p className="text-muted-foreground">צפה ועדכן הזמנות לקוחות</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חפש לפי שם, אימייל או מספר הזמנה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="כל הסטטוסים" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הסטטוסים</SelectItem>
                  <SelectItem value="pending">בטיפול</SelectItem>
                  <SelectItem value="shipped">בדרך אל הלקוח</SelectItem>
                  <SelectItem value="completed">הושלם</SelectItem>
                  <SelectItem value="cancelled">בוטל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">טוען...</div>
        ) : (
          <div className="space-y-3">
            {filteredOrders?.map((order) => (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">מספר הזמנה</p>
                      <p className="font-mono text-sm font-semibold">{order.id.substring(0, 8)}...</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.created_at && format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">לקוח</p>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">סכום</p>
                      <p className="text-xl font-bold text-primary">₪{Number(order.total).toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {order.email_last_status === 'sent' ? (
                          <><MailCheck className="h-3 w-3 text-emerald-500" /><span className="text-xs text-emerald-600">נשלח</span></>
                        ) : order.email_last_status === 'failed' ? (
                          <><MailWarning className="h-3 w-3 text-destructive" /><span className="text-xs text-destructive">נכשל</span></>
                        ) : null}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">סטטוס</p>
                      <Select
                        value={order.status || 'pending'}
                        onValueChange={(value) => updateOrderStatus.mutate({ orderId: order.id, newStatus: value, orderData: order })}
                        disabled={updateOrderStatus.isPending}
                      >
                        <SelectTrigger className="w-full">
                          {updateOrderStatus.isPending ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>מעדכן...</span>
                            </div>
                          ) : (
                            <SelectValue />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">בטיפול</SelectItem>
                          <SelectItem value="shipped">בדרך אל הלקוח</SelectItem>
                          <SelectItem value="completed">הושלם</SelectItem>
                          <SelectItem value="cancelled">בוטל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                    <Eye className="w-4 h-4 ml-2" />פרטים
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredOrders?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">לא נמצאו הזמנות מתאימות</div>
        )}

        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>פרטי הזמנה #{selectedOrder?.id.substring(0, 8)}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">פרטי לקוח</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">שם:</span><p className="font-medium">{selectedOrder.customer_name}</p></div>
                    <div><span className="text-muted-foreground">טלפון:</span><p className="font-medium">{selectedOrder.customer_phone}</p></div>
                    <div><span className="text-muted-foreground">אימייל:</span><p className="font-medium">{selectedOrder.customer_email}</p></div>
                    <div><span className="text-muted-foreground">עיר:</span><p className="font-medium">{selectedOrder.customer_city}</p></div>
                    <div className="col-span-2"><span className="text-muted-foreground">כתובת:</span><p className="font-medium">{selectedOrder.customer_address}</p></div>
                    {selectedOrder.customer_notes && (
                      <div className="col-span-2"><span className="text-muted-foreground">הערות:</span><p className="font-medium">{selectedOrder.customer_notes}</p></div>
                    )}
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">פריטים בהזמנה</h3>
                  <div className="space-y-3">
                    {selectedOrder.cart_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center pb-3 border-b last:border-0">
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">מק"ט: {item.sku || '-'} | כמות: {item.quantity}</p>
                        </div>
                        <p className="font-bold">₪{Number(item.line_total).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t space-y-2">
                    <div className="flex justify-between"><span>סכום ביניים:</span><span className="font-medium">₪{Number(selectedOrder.subtotal).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>משלוח:</span><span className="font-medium">₪{Number(selectedOrder.delivery_fee || 0).toFixed(2)}</span></div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2"><span>סה"כ:</span><span>₪{Number(selectedOrder.total).toFixed(2)}</span></div>
                  </div>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
