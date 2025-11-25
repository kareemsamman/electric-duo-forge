import { supabase } from "@/integrations/supabase/client";

export interface EmailFormData {
  form_type: "Contact" | "Shop" | "New Project";
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  [key: string]: any; // Allow additional fields
}

export async function sendEmailViaGmail(formData: EmailFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Fetch Gmail credentials from admin settings
    const { data: settings, error: settingsError } = await supabase
      .from("site_content")
      .select("key, value_he")
      .in("key", ["gmail_email", "gmail_app_password"]);

    if (settingsError) {
      throw new Error("Failed to fetch email settings");
    }

    const settingsMap = settings.reduce(
      (acc, item) => {
        acc[item.key] = item.value_he;
        return acc;
      },
      {} as Record<string, string>,
    );

    const admin_email = settingsMap.gmail_email;
    const app_password = settingsMap.gmail_app_password;

    if (!admin_email || !app_password) {
      throw new Error("Gmail credentials not configured in Admin Settings");
    }

    // Prepare payload for PHP endpoint
    const payload = {
      admin_email,
      app_password,
      form_type: formData.form_type,
      name: formData.name,
      email: formData.email,
      subject: formData.subject || `New ${formData.form_type} Form Submission`,
      message: formData.message,
      ...formData, // Include any additional fields
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
      throw new Error(`Server error: ${errorText}`);
    }

    const result = await response.json();

    return {
      success: true,
      message: result.message || "Email sent successfully!",
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
