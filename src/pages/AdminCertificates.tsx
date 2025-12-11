import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Plus, Pencil, Trash2, FileText, X, Upload } from "lucide-react";

interface Certificate {
  id: string;
  certificate_name: string;
  certificate_name_en: string | null;
  short_description: string;
  short_description_en: string | null;
  certificate_image: string;
  certificate_image_en: string | null;
  pdf_file: string | null;
  pdf_file_en: string | null;
  images: string[] | null;
  created_at: string;
}

const AdminCertificates = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    certificate_name: "",
    certificate_name_en: "",
    short_description: "",
    short_description_en: "",
    certificate_image: "",
    certificate_image_en: "",
    pdf_file: "",
    pdf_file_en: "",
    images: [] as string[],
  });
  const [uploading, setUploading] = useState(false);

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ["admin-certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Certificate[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      const payload = {
        certificate_name: data.certificate_name,
        certificate_name_en: data.certificate_name_en || null,
        short_description: data.short_description,
        short_description_en: data.short_description_en || null,
        certificate_image: data.certificate_image,
        certificate_image_en: data.certificate_image_en || null,
        pdf_file: data.pdf_file || null,
        pdf_file_en: data.pdf_file_en || null,
        images: data.images,
      };

      if (data.id) {
        const { error } = await supabase
          .from("certificates")
          .update(payload)
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("certificates").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast({ title: editingCertificate ? "התעודה עודכנה" : "התעודה נוספה" });
      resetForm();
    },
    onError: (error) => {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      toast({ title: "התעודה נמחקה" });
    },
    onError: (error) => {
      toast({ title: "שגיאה", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      certificate_name: "",
      certificate_name_en: "",
      short_description: "",
      short_description_en: "",
      certificate_image: "",
      certificate_image_en: "",
      pdf_file: "",
      pdf_file_en: "",
      images: [],
    });
    setEditingCertificate(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (cert: Certificate) => {
    setEditingCertificate(cert);
    setFormData({
      certificate_name: cert.certificate_name,
      certificate_name_en: cert.certificate_name_en || "",
      short_description: cert.short_description,
      short_description_en: cert.short_description_en || "",
      certificate_image: cert.certificate_image,
      certificate_image_en: cert.certificate_image_en || "",
      pdf_file: cert.pdf_file || "",
      pdf_file_en: cert.pdf_file_en || "",
      images: cert.images || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.certificate_name || !formData.short_description || !formData.certificate_image) {
      toast({ title: "נא למלא את כל השדות הנדרשים", variant: "destructive" });
      return;
    }
    saveMutation.mutate({
      ...formData,
      id: editingCertificate?.id,
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "certificate_image" | "certificate_image_en" | "pdf_file" | "pdf_file_en" | "images"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const bucket = "product-images";
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `certificates/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (field === "images") {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: uploadedUrls[0] }));
      }

      toast({ title: "הקובץ הועלה בהצלחה" });
    } catch (error: any) {
      toast({ title: "שגיאה בהעלאת הקובץ", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen pt-28 md:pt-32 pb-20 bg-background">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-[1360px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
              className="hover:bg-muted"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">ניהול תעודות</h1>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                הוספת תעודה
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCertificate ? "עריכת תעודה" : "הוספת תעודה חדשה"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Names */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>שם התעודה (עברית) *</Label>
                    <Input
                      value={formData.certificate_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, certificate_name: e.target.value }))}
                      placeholder="ISO 9001:2015"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>שם התעודה (אנגלית)</Label>
                    <Input
                      value={formData.certificate_name_en}
                      onChange={(e) => setFormData((prev) => ({ ...prev, certificate_name_en: e.target.value }))}
                      placeholder="ISO 9001:2015"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>תיאור קצר (עברית) *</Label>
                    <Textarea
                      value={formData.short_description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, short_description: e.target.value }))}
                      placeholder="תקן איכות בינלאומי"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>תיאור קצר (אנגלית)</Label>
                    <Textarea
                      value={formData.short_description_en}
                      onChange={(e) => setFormData((prev) => ({ ...prev, short_description_en: e.target.value }))}
                      placeholder="International quality standard"
                    />
                  </div>
                </div>

                {/* Main Images - Hebrew & English */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>תמונה ראשית (עברית) *</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "certificate_image")}
                      disabled={uploading}
                    />
                    {formData.certificate_image && (
                      <div className="flex items-center gap-2 mt-2">
                        <img src={formData.certificate_image} alt="Preview" className="w-16 h-20 object-cover rounded border" />
                        <Input
                          value={formData.certificate_image}
                          onChange={(e) => setFormData((prev) => ({ ...prev, certificate_image: e.target.value }))}
                          placeholder="URL"
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>תמונה ראשית (אנגלית)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "certificate_image_en")}
                      disabled={uploading}
                    />
                    {formData.certificate_image_en && (
                      <div className="flex items-center gap-2 mt-2">
                        <img src={formData.certificate_image_en} alt="Preview EN" className="w-16 h-20 object-cover rounded border" />
                        <Input
                          value={formData.certificate_image_en}
                          onChange={(e) => setFormData((prev) => ({ ...prev, certificate_image_en: e.target.value }))}
                          placeholder="URL"
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* PDFs - Hebrew & English */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>קובץ PDF (עברית)</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, "pdf_file")}
                      disabled={uploading}
                    />
                    {formData.pdf_file && (
                      <div className="flex items-center gap-2 mt-2">
                        <a href={formData.pdf_file} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <FileText className="w-4 h-4" />
                          צפייה
                        </a>
                        <Input
                          value={formData.pdf_file}
                          onChange={(e) => setFormData((prev) => ({ ...prev, pdf_file: e.target.value }))}
                          placeholder="URL"
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>קובץ PDF (אנגלית)</Label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileUpload(e, "pdf_file_en")}
                      disabled={uploading}
                    />
                    {formData.pdf_file_en && (
                      <div className="flex items-center gap-2 mt-2">
                        <a href={formData.pdf_file_en} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                          <FileText className="w-4 h-4" />
                          View
                        </a>
                        <Input
                          value={formData.pdf_file_en}
                          onChange={(e) => setFormData((prev) => ({ ...prev, pdf_file_en: e.target.value }))}
                          placeholder="URL"
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                <div className="space-y-2">
                  <Label>תמונות נוספות</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e, "images")}
                    disabled={uploading}
                  />
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Image ${idx + 1}`} className="w-16 h-20 object-cover rounded border" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    ביטול
                  </Button>
                  <Button type="submit" disabled={saveMutation.isPending || uploading}>
                    {saveMutation.isPending ? "שומר..." : editingCertificate ? "עדכון" : "הוספה"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Certificates Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : certificates.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">אין תעודות עדיין</p>
              <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 ml-2" />
                הוספת תעודה ראשונה
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="group overflow-hidden">
                <div className="relative aspect-[3/4] bg-muted">
                  {cert.certificate_image ? (
                    <img
                      src={cert.certificate_image}
                      alt={cert.certificate_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="secondary" onClick={() => handleEdit(cert)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("האם למחוק את התעודה?")) {
                          deleteMutation.mutate(cert.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Indicators */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {cert.pdf_file && (
                      <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs">HE</span>
                    )}
                    {cert.pdf_file_en && (
                      <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">EN</span>
                    )}
                  </div>
                  {cert.images && cert.images.length > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                      +{cert.images.length}
                    </span>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-1">{cert.certificate_name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {cert.short_description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCertificates;
