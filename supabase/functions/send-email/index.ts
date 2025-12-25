import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    // First try to get credentials from database (admin settings)
    const { data: dbSettings, error: dbError } = await supabase
      .from('site_content')
      .select('key, value_he')
      .in('key', ['gmail_email', 'gmail_app_password']);

    let gmailEmail = '';
    let gmailAppPassword = '';

    if (!dbError && dbSettings && dbSettings.length > 0) {
      const settingsMap: Record<string, string> = {};
      dbSettings.forEach((item: any) => {
        settingsMap[item.key] = item.value_he;
      });
      
      gmailEmail = settingsMap['gmail_email'] || '';
      gmailAppPassword = settingsMap['gmail_app_password'] || '';
      
      console.log('Loaded Gmail settings from database, email:', gmailEmail ? 'configured' : 'not configured');
    }

    // Fallback to environment variables (Supabase Secrets) if not in database
    if (!gmailEmail || !gmailAppPassword) {
      gmailEmail = gmailEmail || Deno.env.get('GMAIL_EMAIL') || '';
      gmailAppPassword = gmailAppPassword || Deno.env.get('GMAIL_APP_PASSWORD') || '';
      console.log('Using Gmail settings from environment variables');
    }

    if (!gmailEmail || !gmailAppPassword) {
      console.error('Gmail credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please set Gmail credentials in admin settings.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build email content
    const emailSubject = formData.subject || `New ${formData.form_type} Form Submission`;
    
    // Build HTML content with all form data
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
        <h2 style="color: #333;">טופס חדש: ${formData.form_type}</h2>
        <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">שם</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${formData.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">אימייל</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${formData.email}</td>
          </tr>
    `;

    // Add additional fields
    const excludeFields = ['form_type', 'name', 'email', 'subject', 'message', 'attachments'];
    Object.keys(formData).forEach(key => {
      if (!excludeFields.includes(key) && formData[key]) {
        htmlContent += `
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${key}</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${formData[key]}</td>
          </tr>
        `;
      }
    });

    htmlContent += `
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">הודעה</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${formData.message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
      </div>
    `;

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

    console.log('Sending email via Gmail SMTP...');

    // Send email
    await client.send({
      from: gmailEmail,
      to: gmailEmail, // Send to admin email
      subject: emailSubject,
      content: "auto",
      html: htmlContent,
    });

    await client.close();

    console.log('Email sent successfully via Gmail SMTP');

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