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
  [key: string]: any;
}

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

function buildEmailHtml(formData: EmailRequest): string {
  const excludeFields = ['form_type', 'name', 'email', 'subject', 'message', 'attachments'];
  
  let additionalRows = '';
  Object.keys(formData).forEach(key => {
    if (!excludeFields.includes(key) && formData[key]) {
      const label = fieldLabels[key] || key;
      let value = String(formData[key]);
      
      if (key === 'Subtotal' || key === 'Delivery_Fee' || key === 'Total') {
        value = `₪${value}`;
      }
      
      additionalRows += `
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 35%; background-color: #f9fafb;">${label}</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #1f2937; white-space: pre-wrap;">${value}</td>
        </tr>`;
    }
  });

  const messageSection = formData.message ? `
    <div style="margin-top: 24px;">
      <h3 style="color: #1e3a5f; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6;">הערות נוספות</h3>
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 16px; border-radius: 8px; border-right: 4px solid #3b82f6;">
        <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
      </div>
    </div>` : '';

  const creditCardNotice = formData.form_type === 'Shop Order - Credit Card' ? `
    <div style="margin-top: 24px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #f59e0b; padding: 16px; border-radius: 8px;">
      <p style="margin: 0; color: #92400e; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 20px;">⚠️</span>
        הלקוח בחר תשלום בכרטיס אשראי - יש ליצור קשר עם הלקוח להמשך התהליך
      </p>
    </div>` : '';

  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f3f4f6; direction: rtl;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">הזמנה חדשה</h1>
      <p style="margin: 12px 0 0 0; color: #bfdbfe; font-size: 14px;">${formData.form_type}</p>
    </div>
    
    <!-- Content -->
    <div style="background-color: #ffffff; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <!-- Customer Info Section -->
      <h2 style="color: #1e3a5f; font-size: 18px; font-weight: 600; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6;">פרטי לקוח</h2>
      
      <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; width: 35%; background-color: #f9fafb;">שם</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">${formData.name}</td>
        </tr>
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; background-color: #f9fafb;">אימייל</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; color: #1f2937;">
            <a href="mailto:${formData.email}" style="color: #2563eb; text-decoration: none;">${formData.email}</a>
          </td>
        </tr>
        ${additionalRows}
      </table>

      ${messageSection}
      ${creditCardNotice}
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
      <p style="margin: 0;">הודעה זו נשלחה אוטומטית ממערכת ההזמנות</p>
      <p style="margin: 8px 0 0 0; color: #9ca3af;">${new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: EmailRequest = await req.json();
    console.log('Email request received:', { form_type: formData.form_type, name: formData.name });

    // Get Resend API key
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured. RESEND_API_KEY is missing.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client to fetch admin email from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get admin email from database
    const { data: dbSettings, error: dbError } = await supabase
      .from('site_content')
      .select('key, value_he')
      .eq('key', 'admin_email');

    let adminEmail = formData.email; // fallback to sender email
    if (!dbError && dbSettings && dbSettings.length > 0) {
      adminEmail = dbSettings[0].value_he || formData.email;
    }

    console.log('Sending email to:', adminEmail);

    // Build email
    const emailSubject = formData.subject || `הזמנה חדשה (${formData.form_type})`;
    const htmlContent = buildEmailHtml(formData);

    // Send email using Resend
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: 'Orders <onboarding@resend.dev>',
      to: [adminEmail],
      subject: emailSubject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully!', id: data?.id }),
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
