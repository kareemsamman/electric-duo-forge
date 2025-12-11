import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    // Get credentials from environment variables (Supabase Secrets)
    const gmailEmail = Deno.env.get('GMAIL_EMAIL');
    const gmailAppPassword = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!gmailEmail || !gmailAppPassword) {
      console.error('Gmail credentials not configured in secrets');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
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
