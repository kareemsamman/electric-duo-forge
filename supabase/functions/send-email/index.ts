import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  form_type: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  attachments?: string[];
  [key: string]: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: EmailRequest = await req.json();
    console.log('Email request received:', { form_type: formData.form_type, name: formData.name });

    // Create Supabase client to fetch credentials from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get admin email from database
    const { data: dbSettings, error: dbError } = await supabase
      .from('site_content')
      .select('key, value_he')
      .in('key', ['admin_email']);

    let adminEmail = '';
    if (!dbError && dbSettings && dbSettings.length > 0) {
      const settingsMap: Record<string, string> = {};
      dbSettings.forEach((item: any) => {
        settingsMap[item.key] = item.value_he;
      });
      adminEmail = settingsMap['admin_email'] || '';
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('Resend API key not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please set RESEND_API_KEY.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminEmail) {
      adminEmail = formData.email; // Fallback to sender email
      console.log('Admin email not configured, using sender email');
    }

    const resend = new Resend(resendApiKey);

    // Build email subject
    const emailSubject = formData.subject || `הזמנה חדשה (${formData.form_type}) #${Date.now().toString(36)}`;
    
    // Build clean HTML content with proper RTL and Hebrew support
    let htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; direction: rtl; text-align: right; background-color: #f5f5f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
    <div style="background-color: #1a365d; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">הזמנה חדשה</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${formData.form_type}</p>
    </div>
    
    <div style="padding: 20px;">
      <h2 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">פרטי לקוח</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; width: 30%; color: #4a5568;">שם:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${formData.name}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">אימייל:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #2d3748;">${formData.email}</td>
        </tr>`;

    // Add additional fields dynamically
    const excludeFields = ['form_type', 'name', 'email', 'subject', 'message', 'attachments'];
    const fieldLabels: Record<string, string> = {
      'Phone': 'טלפון',
      'City': 'עיר',
      'Address': 'כתובת',
      'Order_Details': 'פרטי הזמנה',
      'Shipping_Method': 'שיטת משלוח',
      'Payment_Method': 'אמצעי תשלום',
      'Subtotal': 'סכום ביניים',
      'Delivery_Fee': 'דמי משלוח',
      'Total': 'סה"כ לתשלום'
    };

    Object.keys(formData).forEach(key => {
      if (!excludeFields.includes(key) && formData[key]) {
        const label = fieldLabels[key] || key;
        let value = formData[key];
        
        // Format currency values
        if (key === 'Subtotal' || key === 'Delivery_Fee' || key === 'Total') {
          value = `₪${value}`;
        }
        
        htmlContent += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">${label}:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #2d3748; white-space: pre-wrap;">${value}</td>
        </tr>`;
      }
    });

    htmlContent += `
      </table>`;

    // Add message section if exists
    if (formData.message) {
      htmlContent += `
      <h2 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">הערות</h2>
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 6px; border-right: 4px solid #1a365d; margin-bottom: 20px;">
        <p style="margin: 0; color: #2d3748; white-space: pre-wrap;">${formData.message.replace(/\n/g, '<br>')}</p>
      </div>`;
    }

    // Add action required notice for credit card orders
    if (formData.form_type === 'Shop Order - Credit Card') {
      htmlContent += `
      <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin-top: 20px;">
        <p style="margin: 0; color: #856404; font-weight: bold;">
          ⚠️ הלקוח בחר תשלום בכרטיס אשראי - יש ליצור קשר עם הלקוח להמשך התהליך.
        </p>
      </div>`;
    }

    htmlContent += `
    </div>
    
    <div style="background-color: #f7fafc; padding: 15px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #718096; font-size: 12px;">הודעה זו נשלחה אוטומטית ממערכת ההזמנות</p>
    </div>
  </div>
</body>
</html>`;

    console.log('Sending email via Resend to:', adminEmail);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: 'הזמנות <onboarding@resend.dev>',
      to: [adminEmail],
      subject: emailSubject,
      html: htmlContent,
    });

    console.log('Email sent successfully via Resend:', emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in send-email function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
