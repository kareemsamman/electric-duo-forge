import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, ArrowRight, ArrowLeft, MailWarning, MailCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // Check authentication
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/');
        return null;
      }
      return data.session;
    }
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!session
  });

  // Mutation to update order status and send email
  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, newStatus, orderData }: { orderId: string, newStatus: string, orderData: any }) => {
      // Get admin email
      const { data: adminSettings } = await supabase
        .from('site_content')
        .select('value_he')
        .eq('key', 'admin_email')
        .single();

      const adminEmail = adminSettings?.value_he || 'morshea500@gmail.com';

      // Update status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Send status update email to customer
      let emailStatus = 'sent';
      let emailError = null;

      try {
        const { error: emailSendError } = await supabase.functions.invoke('send-order-email', {
          body: {
            order_id: orderId,
            customer_email: orderData.customer_email,
            customer_name: orderData.customer_name,
            admin_email: adminEmail,
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

      // Update email tracking
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
    const matchesPayment = paymentFilter === 'all' || order.payment_method === paymentFilter;
    const matchesSearch = searchQuery === '' || 
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPayment && matchesSearch;
  });

  if (!session) return null;

  return (
    <div className="min-h-screen py-20 pt-28">
      <div className="container mx-auto px-6 md:px-12 lg:px-16">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          {language === 'he' ? (
            <>
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה ללוח הבקרה
            </>
          ) : (
            <>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </>
          )}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">ניהול הזמנות</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium mb-2 block">חיפוש</label>
                <Input
                  placeholder="חפש לפי שם, אימייל או מספר הזמנה..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">סטטוס הזמנה</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="pending">ממתין</SelectItem>
                    <SelectItem value="paid">שולם</SelectItem>
                    <SelectItem value="cancelled">בוטל</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">אמצעי תשלום</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="cash">מזומן</SelectItem>
                    <SelectItem value="visa">כרטיס אשראי</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div>טוען...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>מספר הזמנה</TableHead>
                    <TableHead>תאריך</TableHead>
                    <TableHead>לקוח</TableHead>
                    <TableHead>סכום כולל</TableHead>
                    <TableHead>סטטוס</TableHead>
                    <TableHead>תשלום</TableHead>
                    <TableHead>אימייל</TableHead>
                    <TableHead>פעולות</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {order.created_at && format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ₪{Number(order.total).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status || 'pending'}
                          onValueChange={(value) => {
                            updateOrderStatus.mutate({
                              orderId: order.id,
                              newStatus: value,
                              orderData: order
                            });
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">בטיפול</SelectItem>
                            <SelectItem value="shipped">בדרך אל הלקוח</SelectItem>
                            <SelectItem value="completed">הושלם</SelectItem>
                            <SelectItem value="cancelled">בוטל</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {order.payment_method === 'cash' ? 'מזומן' : 'כרטיס אשראי'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {order.email_last_status === 'sent' ? (
                            <>
                              <MailCheck className="h-4 w-4 text-emerald-500" />
                              <span className="text-xs text-muted-foreground">נשלח</span>
                            </>
                          ) : order.email_last_status === 'failed' ? (
                            <>
                              <MailWarning className="h-4 w-4 text-destructive" />
                              <span className="text-xs text-destructive">נכשל</span>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">לא נשלח</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredOrders?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                לא נמצאו הזמנות מתאימות
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>פרטי הזמנה #{selectedOrder?.id.substring(0, 8)}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">פרטי לקוח</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">שם:</span>
                      <div className="font-medium">{selectedOrder.customer_name}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">טלפון:</span>
                      <div className="font-medium">{selectedOrder.customer_phone}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">אימייל:</span>
                      <div className="font-medium">{selectedOrder.customer_email}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">עיר:</span>
                      <div className="font-medium">{selectedOrder.customer_city}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">כתובת:</span>
                      <div className="font-medium">{selectedOrder.customer_address}</div>
                    </div>
                    {selectedOrder.customer_notes && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">הערות:</span>
                        <div className="font-medium">{selectedOrder.customer_notes}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">פריטים בהזמנה</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>מוצר</TableHead>
                        <TableHead>מק"ט</TableHead>
                        <TableHead>מחיר יחידה</TableHead>
                        <TableHead>כמות</TableHead>
                        <TableHead>סה"כ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.cart_items.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.sku || '-'}</TableCell>
                          <TableCell>₪{Number(item.unit_price).toFixed(2)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="font-semibold">
                            ₪{Number(item.line_total).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>סכום ביניים:</span>
                    <span className="font-medium">₪{Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>משלוח:</span>
                    <span className="font-medium">₪{Number(selectedOrder.delivery_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>סה"כ:</span>
                    <span>₪{Number(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">אמצעי תשלום:</span>
                      <div className="font-medium">
                        {selectedOrder.payment_method === 'cash' ? 'מזומן' : 'כרטיס אשראי'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">סטטוס תשלום:</span>
                      <div className="font-medium">
                        {selectedOrder.payment_status === 'paid' ? 'שולם' : 'ממתין'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">סטטוס הזמנה:</span>
                      <div className="font-medium">
                        {selectedOrder.status === 'paid' ? 'שולם' :
                         selectedOrder.status === 'cancelled' ? 'בוטל' : 'ממתין'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">תאריך הזמנה:</span>
                      <div className="font-medium">
                        {format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
