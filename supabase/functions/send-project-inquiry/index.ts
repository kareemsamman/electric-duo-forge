import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProjectInquiryRequest {
  companyName: string;
  companyId: string;
  street: string;
  streetNumber: string;
  city: string;
  zipCode?: string;
  contactName: string;
  mobile: string;
  email: string;
  accountantName?: string;
  accountantPhone?: string;
  notes?: string;
  fileUrls?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const inquiryData: ProjectInquiryRequest = await req.json();
    console.log("Received project inquiry:", inquiryData);

    // Get admin email from settings
    const { data: adminEmailData } = await supabase
      .from("site_content")
      .select("value_he")
      .eq("section", "settings")
      .eq("key", "admin_email")
      .single();

    const adminEmail = adminEmailData?.value_he || "info@globalelectric.co.il";
    console.log("Sending to admin email:", adminEmail);

    // Build email HTML
    const addressLine = `רחוב ${inquiryData.street} ${inquiryData.streetNumber}, ${inquiryData.city}${inquiryData.zipCode ? `, ${inquiryData.zipCode}` : ''}`;
    
    const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #1E88E5; border-bottom: 2px solid #1E88E5; padding-bottom: 10px;">פנייה חדשה – מתכננים פרויקט חדש</h2>
        
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0B1B2B;">פרטי החברה</h3>
          <p><strong>שם חברה/עוסק מורשה:</strong> ${inquiryData.companyName}</p>
          <p><strong>ח.פ / ע.מ:</strong> ${inquiryData.companyId}</p>
          <p><strong>כתובת העסק:</strong> ${addressLine}</p>
        </div>

        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0B1B2B;">איש קשר</h3>
          <p><strong>שם איש קשר:</strong> ${inquiryData.contactName}</p>
          <p><strong>נייד:</strong> ${inquiryData.mobile}</p>
          <p><strong>מייל אלקטרוני:</strong> ${inquiryData.email}</p>
        </div>

        ${inquiryData.accountantName || inquiryData.accountantPhone ? `
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0B1B2B;">פרטי מנהל/ת חשבונות</h3>
          ${inquiryData.accountantName ? `<p><strong>שם:</strong> ${inquiryData.accountantName}</p>` : ''}
          ${inquiryData.accountantPhone ? `<p><strong>טלפון:</strong> ${inquiryData.accountantPhone}</p>` : ''}
        </div>
        ` : ''}

        ${inquiryData.notes ? `
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0B1B2B;">הערות / פרטים נוספים</h3>
          <p style="white-space: pre-wrap;">${inquiryData.notes}</p>
        </div>
        ` : ''}

        ${inquiryData.fileUrls && inquiryData.fileUrls.length > 0 ? `
        <div style="background: #f5f7fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0B1B2B;">קבצים מצורפים</h3>
          <ul>
            ${inquiryData.fileUrls.map(url => `<li><a href="${url}" style="color: #1E88E5;">${url.split('/').pop()}</a></li>`).join('')}
          </ul>
        </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>פנייה זו נשלחה מטופס "מתכננים פרויקט חדש" באתר Global Electric</p>
          <p>תאריך: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}</p>
        </div>
      </div>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Global Electric <onboarding@resend.dev>",
      to: [adminEmail],
      reply_to: inquiryData.email,
      subject: "פנייה חדשה – מתכננים פרויקט חדש",
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    // Store in database
    const { data: insertData, error: insertError } = await supabase
      .from("project_inquiries")
      .insert({
        company_name: inquiryData.companyName,
        company_id: inquiryData.companyId,
        street: inquiryData.street,
        street_number: inquiryData.streetNumber,
        city: inquiryData.city,
        zip_code: inquiryData.zipCode,
        contact_name: inquiryData.contactName,
        mobile: inquiryData.mobile,
        email: inquiryData.email,
        accountant_name: inquiryData.accountantName,
        accountant_phone: inquiryData.accountantPhone,
        notes: inquiryData.notes,
        file_urls: inquiryData.fileUrls,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing inquiry:", insertError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "הטופס נשלח בהצלחה!",
        emailResponse,
        inquiryId: insertData?.id 
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
    console.error("Error in send-project-inquiry function:", error);
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
