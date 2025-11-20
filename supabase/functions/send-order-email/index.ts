import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const resend_api_key = Deno.env.get("RESEND_API_KEY") || "";

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
                  כמות: ${item.quantity} × ₪${item.unit_price.toFixed(2)} = ₪${item.line_total.toFixed(2)}
                </div>
              `).join('')}
              
              <div style="margin-top: 20px;">
                <p><strong>סכום ביניים:</strong> ₪${order_details.subtotal.toFixed(2)}</p>
                <p><strong>דמי משלוח (${order_details.shipping_method}):</strong> ₪${order_details.delivery_fee.toFixed(2)}</p>
                <p class="total">סה"כ לתשלום: ₪${order_details.total.toFixed(2)}</p>
              </div>
              
              <h3>פרטי משלוח:</h3>
              <p>
                ${customer_name}<br>
                ${order_details.customer_address}<br>
                ${order_details.customer_city}<br>
                טלפון: ${order_details.customer_phone}
              </p>
              
              <p><strong>אופן תשלום:</strong> ${order_details.payment_method === 'cash' ? 'מזומן במשלוח' : 'כרטיס אשראי'}</p>
            </div>
            
            ${isStatusUpdate 
              ? '<p>תודה שבחרת ב-Global Electric. לכל שאלה נוספת, ניתן להשיב למייל זה.</p>'
              : '<p>נציג יצור עמך קשר בקרוב לתיאום המשלוח.</p>'}
          </div>
          <div class="footer">
            <p>Global Electric | 📧 ${admin_email || 'info@globalelectric.co.il'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resend_api_key}`,
      },
      body: JSON.stringify({
        from: "Global Electric <onboarding@resend.dev>",
        to: [customer_email],
        subject: customerSubject,
        html: customerEmailHtml,
      }),
    });

    const customerResult = await customerEmailResponse.json();
    console.log("Customer email sent:", customerResult);

    let adminResult = null;

    if (email_type === 'new_order' && admin_email) {
      const adminEmailHtml = `
        <!DOCTYPE html>
        <html dir="rtl" lang="he">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1E88E5; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .order-summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .urgent { background: #ff9800; color: white; padding: 10px; border-radius: 4px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 הזמנה חדשה!</h1>
            </div>
            <div class="content">
              <div class="urgent">
                <strong>נדרש טיפול:</strong> הזמנה חדשה התקבלה במערכת
              </div>
              
              <div class="order-summary">
                <h2>הזמנה #${order_id.substring(0, 8)}</h2>
                
                <h3>פרטי לקוח:</h3>
                <p>
                  <strong>שם:</strong> ${customer_name}<br>
                  <strong>אימייל:</strong> ${customer_email}<br>
                  <strong>טלפון:</strong> ${order_details.customer_phone}<br>
                  <strong>כתובת:</strong> ${order_details.customer_address}, ${order_details.customer_city}
                </p>
                
                <h3>פריטים:</h3>
                ${order_details.cart_items.map(item => `
                  <div class="item">
                    <strong>${item.name}</strong><br>
                    כמות: ${item.quantity} × ₪${item.unit_price.toFixed(2)} = ₪${item.line_total.toFixed(2)}
                  </div>
                `).join('')}
                
                <div style="margin-top: 20px;">
                  <p><strong>סכום ביניים:</strong> ₪${order_details.subtotal.toFixed(2)}</p>
                  <p><strong>דמי משלוח (${order_details.shipping_method}):</strong> ₪${order_details.delivery_fee.toFixed(2)}</p>
                  <p style="font-size: 20px; font-weight: bold; color: #1E88E5;">סה"כ: ₪${order_details.total.toFixed(2)}</p>
                </div>
                
                <p><strong>אופן תשלום:</strong> ${order_details.payment_method === 'cash' ? 'מזומן במשלוח' : 'כרטיס אשראי'}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resend_api_key}`,
        },
        body: JSON.stringify({
          from: "Global Electric <onboarding@resend.dev>",
          to: [admin_email],
          subject: `🔔 הזמנה חדשה #${order_id.substring(0, 8)}`,
          html: adminEmailHtml,
        }),
      });

      adminResult = await adminEmailResponse.json();
      console.log("Admin email sent:", adminResult);
    }

    return new Response(
      JSON.stringify({
        success: true,
        customer_email: customerResult,
        admin_email: adminResult,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
