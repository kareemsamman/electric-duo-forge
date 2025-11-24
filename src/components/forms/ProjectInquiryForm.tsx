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
  companyId: z.string().regex(/^\d{5,10}$/, "ח.פ / ע.מ חייב להכיל 5-10 ספרות"),
  street: z.string().min(2, "נא להזין שם רחוב"),
  streetNumber: z.string().min(1, "נא להזין מספר בית"),
  city: z.string().min(2, "נא להזין שם עיר"),
  zipCode: z.string().regex(/^\d{5,7}$/, "מיקוד חייב להכיל 5-7 ספרות").optional().or(z.literal("")),
  contactName: z.string().min(2, "נא להזין שם איש קשר"),
  mobile: z.string().regex(/^05\d{8}$/, "נא להזין מספר נייד תקין (05xxxxxxxx)"),
  email: z.string().email("נא להזין כתובת מייל תקינה"),
  accountantName: z.string().optional(),
  accountantPhone: z.string().regex(/^\d{8,12}$/, "מספר טלפון לא תקין").optional().or(z.literal("")),
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

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "application/zip",
    ];

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

        if (!allowedTypes.includes(file.type)) {
          toast.error(`סוג הקובץ ${file.name} לא נתמך`);
          continue;
        }

        if (file.size > maxSize) {
          toast.error(`הקובץ ${file.name} גדול מדי (מקסימום 20MB)`);
          continue;
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(`inquiry-files/${fileName}`, file);

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

        {/* Company Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">פרטי החברה</h3>
          
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
                    type="text"
                    maxLength={10}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    onInput={(e) => {
                      const target = e.target as HTMLInputElement;
                      target.value = target.value.replace(/[^0-9]/g, '');
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground">כתובת העסק</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        type="text"
                        maxLength={7}
                        pattern="[0-9]*"
                        inputMode="numeric"
                        onInput={(e) => {
                          const target = e.target as HTMLInputElement;
                          target.value = target.value.replace(/[^0-9]/g, '');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">איש קשר</h3>
          
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      pattern="[0-9]*"
                      inputMode="numeric"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, '');
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
          </div>
        </div>

        {/* Accountant Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">מנהל/ת חשבונות (אופציונלי)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="accountantName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שם מנהל/ת חשבונות</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>טלפון</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="tel"
                      maxLength={12}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value.replace(/[^0-9]/g, '');
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
