import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  order_id: string;
  customer_email: string;
  customer_name: string;
  admin_email?: string;
  email_type: 'new_order' | 'status_update';
  status?: string;
  order_details: {
    total_items: number;
    subtotal: number;
    delivery_fee: number;
    total: number;
    cart_items: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;
    payment_method: string;
    shipping_method: string;
    customer_address: string;
    customer_city: string;
    customer_phone: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      order_id,
      customer_email,
      customer_name,
      admin_email,
      email_type,
      status,
      order_details,
    }: OrderEmailRequest = await req.json();

    console.log('Email request:', { order_id, email_type, status, customer_email, admin_email });

    // Get Gmail credentials from database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_content')
      .select('key, value_he')
      .in('key', ['gmail_email', 'gmail_app_password', 'admin_email']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      throw new Error('Failed to fetch email settings');
    }

    const settings: Record<string, string> = {};
    settingsData?.forEach(item => {
      settings[item.key] = item.value_he;
    });

    const gmailEmail = settings.gmail_email;
    const gmailAppPassword = settings.gmail_app_password;
    const adminEmailAddress = admin_email || settings.admin_email;

    if (!gmailEmail || !gmailAppPassword) {
      console.error('Gmail credentials not configured');
      throw new Error('Gmail credentials not configured in admin settings');
    }

    console.log('Using Gmail:', gmailEmail);

    // Create SMTP client for Gmail
    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailEmail,
          password: gmailAppPassword,
        },
      },
    });

    const isStatusUpdate = email_type === 'status_update';

    let statusText = '';
    let emailTitle = 'תודה על ההזמנה!';
    let customerSubject = `אישור הזמנה #${order_id.substring(0, 8)} - Global Electric`;

    if (isStatusUpdate) {
      emailTitle = 'עדכון סטטוס הזמנה';
      customerSubject = `עדכון סטטוס להזמנה #${order_id.substring(0, 8)}`;
      
      if (status === 'cancelled') {
        statusText = '❌ ההזמנה בוטלה לפי בקשתך או בגלל בעיה בעיבוד.';
      } else if (status === 'shipped') {
        statusText = '🚚 ההזמנה יצאה לדרך והיא בדרכה אליך!';
      } else if (status === 'completed') {
        statusText = '✅ ההזמנה סופקה בהצלחה. תודה שקנית אצלנו!';
      } else {
        statusText = '⏳ ההזמנה שלך נמצאת בטיפול אצלנו.';
      }
    }

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html dir="rtl" lang="he">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0B1B2B; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .order-summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 24px; font-weight: bold; color: #1E88E5; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .status-box { background: #e0f2fe; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 18px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${emailTitle}</h1>
          </div>
          <div class="content">
            <p>שלום ${customer_name},</p>
            ${isStatusUpdate 
              ? `<div class="status-box"><strong>${statusText}</strong></div>`
              : '<p>הזמנתך התקבלה בהצלחה ותטופל בהקדם.</p>'}
            
            <div class="order-summary">
              <h2>פרטי הזמנה #${order_id.substring(0, 8)}</h2>
              
              <h3>פריטים:</h3>
              ${order_details.cart_items.map(item => `
                <div class="item">
                  <strong>${item.name}</strong><br>
                  כמות: ${item.quantity} × ₪${item.unit_price.toFixed(2)} = <strong>₪${item.line_total.toFixed(2)}</strong>
                </div>
              `).join('')}
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #ddd;">
                <p><strong>סכום ביניים:</strong> ₪${order_details.subtotal.toFixed(2)}</p>
                <p><strong>משלוח:</strong> ₪${order_details.delivery_fee.toFixed(2)}</p>
                <p class="total">סה"כ לתשלום: ₪${order_details.total.toFixed(2)}</p>
              </div>

              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                <h3>פרטי משלוח:</h3>
                <p><strong>כתובת:</strong> ${order_details.customer_address}, ${order_details.customer_city}</p>
                <p><strong>טלפון:</strong> ${order_details.customer_phone}</p>
                <p><strong>אמצעי תשלום:</strong> ${order_details.payment_method === 'cash' ? 'מזומן במשלוח' : 'כרטיס אשראי'}</p>
              </div>
            </div>
            
            ${!isStatusUpdate ? '<p>נצור איתך קשר בקרוב לתיאום המשלוח.</p>' : ''}
            
            <p>בברכה,<br><strong>צוות Global Electric</strong></p>
          </div>
          <div class="footer">
            <p>Global Electric | פתרונות חשמל מתקדמים</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to customer
    console.log('Sending email to customer:', customer_email);
    
    await client.send({
      from: gmailEmail,
      to: customer_email,
      subject: customerSubject,
      content: customerEmailHtml,
      html: customerEmailHtml,
    });
    
    console.log('Customer email sent successfully');

    // Send email to admin if it's a new order
    if (email_type === 'new_order' && adminEmailAddress) {
      const adminSubject = `הזמנה חדשה #${order_id.substring(0, 8)} - ${customer_name}`;
      const adminEmailHtml = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .order-summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .highlight { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 הזמנה חדשה התקבלה!</h1>
            </div>
            <div class="content">
              <div class="highlight">
                <p><strong>מספר הזמנה:</strong> #${order_id.substring(0, 8)}</p>
                <p><strong>סכום כולל:</strong> ₪${order_details.total.toFixed(2)}</p>
              </div>
              
              <div class="order-summary">
                <h2>פרטי לקוח:</h2>
                <p><strong>שם:</strong> ${customer_name}</p>
                <p><strong>אימייל:</strong> ${customer_email}</p>
                <p><strong>טלפון:</strong> ${order_details.customer_phone}</p>
                <p><strong>כתובת:</strong> ${order_details.customer_address}, ${order_details.customer_city}</p>
                
                <h3>פריטים שהוזמנו:</h3>
                ${order_details.cart_items.map(item => `
                  <p>• ${item.name} - כמות: ${item.quantity} × ₪${item.unit_price.toFixed(2)} = ₪${item.line_total.toFixed(2)}</p>
                `).join('')}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #ddd;">
                  <p><strong>סכום ביניים:</strong> ₪${order_details.subtotal.toFixed(2)}</p>
                  <p><strong>משלוח:</strong> ₪${order_details.delivery_fee.toFixed(2)}</p>
                  <p style="font-size: 20px; color: #dc2626;"><strong>סה"כ:</strong> ₪${order_details.total.toFixed(2)}</p>
                </div>
                
                <p><strong>אמצעי תשלום:</strong> ${order_details.payment_method === 'cash' ? 'מזומן במשלוח' : 'כרטיס אשראי'}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      console.log('Sending email to admin:', adminEmailAddress);
      
      await client.send({
        from: gmailEmail,
        to: adminEmailAddress,
        subject: adminSubject,
        content: adminEmailHtml,
        html: adminEmailHtml,
      });
      
      console.log('Admin email sent successfully');
    }

    await client.close();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
