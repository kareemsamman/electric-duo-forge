import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface OrderEmailRequest {
  order_id: string;
  email_type: 'new_order' | 'status_update';
  status?: string;
  customer_email: string;
  admin_email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, email_type, status, customer_email, admin_email }: OrderEmailRequest = await req.json();
    
    console.log('Email request:', { order_id, email_type, status, customer_email, admin_email });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    let subject = '';
    let body = '';

    if (email_type === 'new_order') {
      subject = `הזמנה חדשה #${order_id.substring(0, 8)}`;
      body = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>הזמנה חדשה התקבלה</h2>
          <p><strong>מספר הזמנה:</strong> ${order_id}</p>
          <p><strong>שם לקוח:</strong> ${order.customer_name}</p>
          <p><strong>טלפון:</strong> ${order.customer_phone}</p>
          <p><strong>אימייל:</strong> ${order.customer_email}</p>
          <p><strong>עיר:</strong> ${order.customer_city}</p>
          <p><strong>כתובת:</strong> ${order.customer_address}</p>
          
          <h3>פריטים בהזמנה:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">מוצר</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">כמות</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">מחיר</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">סכום</th>
              </tr>
            </thead>
            <tbody>
              ${(order.cart_items as any[]).map(item => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">₪${item.unit_price}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">₪${item.line_total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <p><strong>סכום ביניים:</strong> ₪${order.subtotal}</p>
            <p><strong>דמי משלוח:</strong> ₪${order.delivery_fee || 0}</p>
            <p style="font-size: 18px; color: #1E88E5;"><strong>סה"כ:</strong> ₪${order.total}</p>
          </div>
          
          <p><strong>אופן תשלום:</strong> ${order.payment_method === 'cash' ? 'מזומן' : 'כרטיס אשראי'}</p>
          ${order.customer_notes ? `<p><strong>הערות:</strong> ${order.customer_notes}</p>` : ''}
        </div>
      `;
    } else if (email_type === 'status_update') {
      const statusText = status === 'completed' ? 'הושלמה' : 
                        status === 'cancelled' ? 'בוטלה' :
                        status === 'shipped' ? 'נשלחה' : 'בהמתנה';
      
      subject = `עדכון הזמנה #${order_id.substring(0, 8)} - ${statusText}`;
      body = `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>עדכון סטטוס הזמנה</h2>
          <p>שלום ${order.customer_name},</p>
          <p>הסטטוס של ההזמנה שלך עודכן ל: <strong>${statusText}</strong></p>
          <p><strong>מספר הזמנה:</strong> ${order_id}</p>
          
          ${status === 'shipped' ? '<p>ההזמנה נשלחה ותגיע אליך בקרוב.</p>' : ''}
          ${status === 'completed' ? '<p>ההזמנה הושלמה בהצלחה. תודה שבחרת בנו!</p>' : ''}
          ${status === 'cancelled' ? '<p>ההזמנה בוטלה. אם יש לך שאלות, אנא צור קשר.</p>' : ''}
        </div>
      `;
    }

    console.log('Sending email to customer via Resend:', customer_email);
    await resend.emails.send({
      from: 'Global Electric <onboarding@resend.dev>',
      to: [customer_email],
      subject: subject,
      html: body,
    });

    if (email_type === 'new_order' && admin_email) {
      console.log('Sending email to admin via Resend:', admin_email);
      const adminSubject = `הזמנה חדשה מ-${order.customer_name} #${order_id.substring(0, 8)}`;
      await resend.emails.send({
        from: 'Global Electric <onboarding@resend.dev>',
        to: [admin_email],
        subject: adminSubject,
        html: body,
      });
    }

    await supabase
      .from('orders')
      .update({
        email_last_sent_at: new Date().toISOString(),
        email_last_status: 'success',
        email_last_type: email_type,
        email_last_error: null
      })
      .eq('id', order_id);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully via Resend' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-order-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);
