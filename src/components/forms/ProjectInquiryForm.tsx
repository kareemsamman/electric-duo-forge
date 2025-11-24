import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const formSchema = z.object({
  companyName: z.string().min(2, "נא להזין שם חברה"),
  companyId: z.string().regex(/^\d{1,10}$/, "ח.פ / ע.מ חייב להכיל עד 10 ספרות בלבד"),
  street: z.string().min(2, "נא להזין שם רחוב"),
  streetNumber: z.string().min(1, "נא להזין מספר בית"),
  city: z.string().min(2, "נא להזין שם עיר"),
  zipCode: z.string().regex(/^\d{5,7}$/, "מיקוד חייב להכיל 5-7 ספרות").optional().or(z.literal("")),
  contactName: z.string().min(2, "נא להזין שם איש קשר"),
  mobile: z.string().regex(/^\d{9,10}$/, "נא להזין מספר נייד תקין (9-10 ספרות)"),
  email: z.string().email("נא להזין כתובת מייל תקינה"),
  accountantName: z.string().optional(),
  accountantPhone: z.string().regex(/^\d{9,10}$/, "מספר טלפון לא תקין").optional().or(z.literal("")),
  notes: z.string().max(1000, "הערות לא יכולות לעבור 1000 תווים").optional(),
  honeypot: z.string().max(0, "Invalid submission"),
});

type FormValues = z.infer<typeof formSchema>;

interface ProjectInquiryFormProps {
  onSuccess?: () => void;
}

export const ProjectInquiryForm = ({ onSuccess }: ProjectInquiryFormProps) => {
  const { language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      companyId: "",
      street: "",
      streetNumber: "",
      city: "",
      zipCode: "",
      contactName: "",
      mobile: "",
      email: "",
      accountantName: "",
      accountantPhone: "",
      notes: "",
      honeypot: "",
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip'];
    const maxSize = 20 * 1024 * 1024; // 20MB
    const maxFiles = 10;

    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`ניתן להעלות עד ${maxFiles} קבצים`);
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

        if (!allowedExtensions.includes(fileExt)) {
          toast.error(`סוג הקובץ ${file.name} לא נתמך`);
          continue;
        }

        if (file.size > maxSize) {
          toast.error(`הקובץ ${file.name} גדול מדי (מקסימום 20MB)`);
          continue;
        }

        const timestamp = Date.now();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `inquiry-files/${timestamp}-${cleanFileName}`;
        
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error("Upload error:", error);
          toast.error(`שגיאה בהעלאת ${file.name}`);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(data.path);

        setUploadedFiles((prev) => [...prev, { name: file.name, url: urlData.publicUrl }]);
      }
      toast.success("קבצים הועלו בהצלחה");
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("שגיאה בהעלאת קבצים");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    if (values.honeypot) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("send-project-inquiry", {
        body: {
          companyName: values.companyName,
          companyId: values.companyId,
          street: values.street,
          streetNumber: values.streetNumber,
          city: values.city,
          zipCode: values.zipCode,
          contactName: values.contactName,
          mobile: values.mobile,
          email: values.email,
          accountantName: values.accountantName,
          accountantPhone: values.accountantPhone,
          notes: values.notes,
          fileUrls: uploadedFiles.map((f) => f.url),
        },
      });

      if (error) throw error;

      toast.success("הטופס נשלח בהצלחה! נחזור אליכם בקרוב.");
      form.reset();
      setUploadedFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("משהו השתבש בשליחה. נסו שוב או צרו קשר.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Honeypot field */}
        <div className="hidden">
          <FormField
            control={form.control}
            name="honeypot"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} tabIndex={-1} autoComplete="off" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Company & Contact - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שם חברה/עוסק מורשה *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ח.פ / ע.מ *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שם איש קשר *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>נייד *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel" 
                    placeholder="0521234567"
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מייל אלקטרוני *</FormLabel>
                <FormControl>
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>רחוב *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="streetNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מספר *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>עיר *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מיקוד</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    maxLength={7}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שם מנהל/ת חשבונות</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="אופציונלי" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountantPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>טלפון מנהל/ת חשבונות</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel"
                    placeholder="אופציונלי"
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>הערות / פרטים נוספים</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="כתוב כאן כל מידע נוסף שחשוב שנדע…"
                  rows={5}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <div className="space-y-3">
          <FormLabel>העלאת קבצים</FormLabel>
          <div className="flex items-center gap-4">
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              <Upload size={18} />
              <span>{isUploading ? "מעלה..." : "בחר קבצים"}</span>
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading || uploadedFiles.length >= 10}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            אפשר להעלות עד 10 קבצים (PDF, Word, Excel, תמונות, ZIP) - מקסימום 20MB לקובץ
          </p>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2 mt-4">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md"
                >
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              שולח...
            </>
          ) : (
            "שליחה"
          )}
        </Button>
      </form>
    </Form>
  );
};
