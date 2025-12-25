import { supabase } from "@/integrations/supabase/client";

export interface EmailFormData {
  form_type: "Contact" | "Shop Order" | "Shop Order - Credit Card" | "New Project";
  name: string;
  email: string;
  subject?: string;
  message: string;
  attachments?: string[]; // Array of public URLs for file attachments
  [key: string]: any; // Allow additional fields like Phone, City, Order_Details, etc.
}

export async function sendEmailViaGmail(formData: EmailFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Call the Edge Function to send email (credentials are stored securely in secrets)
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: formData,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to send email');
    }

    return {
      success: data?.success ?? true,
      message: data?.message || "Email sent successfully!",
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
