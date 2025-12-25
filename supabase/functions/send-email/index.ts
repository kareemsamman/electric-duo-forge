import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
      
      console.log('Loaded Gmail settings from database');
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

    // Build payload for PHP endpoint
    const payload = {
      admin_email: gmailEmail,
      app_password: gmailAppPassword,
      form_type: formData.form_type,
      name: formData.name,
      email: formData.email,
      subject: formData.subject || `New ${formData.form_type} Form Submission`,
      message: formData.message,
      ...(formData.attachments && formData.attachments.length > 0 && { attachments: formData.attachments }),
      ...Object.keys(formData).reduce((acc, key) => {
        if (!['form_type', 'name', 'email', 'subject', 'message', 'attachments'].includes(key)) {
          acc[key] = formData[key];
        }
        return acc;
      }, {} as Record<string, any>)
    };

    // Send to PHP endpoint
    const response = await fetch("https://www.kareemsamman.com/send_mail.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PHP endpoint error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Email sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: result.message || 'Email sent successfully!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});