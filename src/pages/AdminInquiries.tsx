import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Phone, Building, MapPin, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProjectInquiry {
  id: string;
  company_name: string;
  company_id: string;
  street: string;
  street_number: string;
  city: string;
  zip_code: string | null;
  contact_name: string;
  mobile: string;
  email: string;
  accountant_name: string | null;
  accountant_phone: string | null;
  notes: string | null;
  file_urls: string[] | null;
  status: string;
  created_at: string;
}

export default function AdminInquiries() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedInquiry, setSelectedInquiry] = useState<ProjectInquiry | null>(null);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["project-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProjectInquiry[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("project_inquiries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-inquiries"] });
      toast.success("סטטוס עודכן בהצלחה");
    },
    onError: (error) => {
      console.error("Error updating status:", error);
      toast.error("שגיאה בעדכון סטטוס");
    },
  });

  const handleMarkAsRead = (id: string) => {
    updateStatusMutation.mutate({ id, status: "read" });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      new: { label: "חדש", variant: "destructive" },
      read: { label: "נקרא", variant: "secondary" },
      contacted: { label: "ביצענו קשר", variant: "default" },
    };

    const statusInfo = variants[status] || { label: status, variant: "outline" };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 py-12 px-4 pt-32">
        <div className="max-w-7xl mx-auto text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 pt-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4">
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה ללוח הבקרה
          </Button>
          <h1 className="text-4xl font-bold mb-2">פניות לפרויקטים</h1>
          <p className="text-muted-foreground">
            ניהול כל הפניות שהתקבלו מטופס "מתכננים פרויקט חדש"
          </p>
        </div>

        <div className="grid gap-4">
          {inquiries && inquiries.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                אין פניות עדיין
              </CardContent>
            </Card>
          )}

          {inquiries?.map((inquiry) => (
            <Card
              key={inquiry.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedInquiry(inquiry)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{inquiry.company_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(inquiry.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(inquiry.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>ח.פ: {inquiry.company_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{inquiry.mobile}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{inquiry.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{inquiry.city}</span>
                  </div>
                </div>

                {inquiry.status === "new" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(inquiry.id);
                    }}
                  >
                    סמן כנקרא
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">פרטי הפנייה</DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedInquiry.created_at)}
                </p>
                {getStatusBadge(selectedInquiry.status)}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">פרטי החברה</h3>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>שם חברה:</strong> {selectedInquiry.company_name}
                    </p>
                    <p>
                      <strong>ח.פ / ע.מ:</strong> {selectedInquiry.company_id}
                    </p>
                    <p>
                      <strong>כתובת:</strong> רחוב {selectedInquiry.street}{" "}
                      {selectedInquiry.street_number}, {selectedInquiry.city}
                      {selectedInquiry.zip_code && `, ${selectedInquiry.zip_code}`}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">איש קשר</h3>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>שם:</strong> {selectedInquiry.contact_name}
                    </p>
                    <p>
                      <strong>נייד:</strong>{" "}
                      <a href={`tel:${selectedInquiry.mobile}`} className="text-primary">
                        {selectedInquiry.mobile}
                      </a>
                    </p>
                    <p>
                      <strong>מייל:</strong>{" "}
                      <a href={`mailto:${selectedInquiry.email}`} className="text-primary">
                        {selectedInquiry.email}
                      </a>
                    </p>
                  </div>
                </div>

                {(selectedInquiry.accountant_name || selectedInquiry.accountant_phone) && (
                  <div>
                    <h3 className="font-semibold mb-2">מנהל/ת חשבונות</h3>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      {selectedInquiry.accountant_name && (
                        <p>
                          <strong>שם:</strong> {selectedInquiry.accountant_name}
                        </p>
                      )}
                      {selectedInquiry.accountant_phone && (
                        <p>
                          <strong>טלפון:</strong>{" "}
                          <a
                            href={`tel:${selectedInquiry.accountant_phone}`}
                            className="text-primary"
                          >
                            {selectedInquiry.accountant_phone}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedInquiry.notes && (
                  <div>
                    <h3 className="font-semibold mb-2">הערות</h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedInquiry.notes}</p>
                    </div>
                  </div>
                )}

                {selectedInquiry.file_urls && selectedInquiry.file_urls.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">קבצים מצורפים</h3>
                    <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                      {selectedInquiry.file_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          {url.split("/").pop()}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {selectedInquiry.status === "new" && (
                  <Button
                    onClick={() => {
                      handleMarkAsRead(selectedInquiry.id);
                      setSelectedInquiry(null);
                    }}
                  >
                    סמן כנקרא
                  </Button>
                )}
                {selectedInquiry.status === "read" && (
                  <Button
                    onClick={() => {
                      updateStatusMutation.mutate({
                        id: selectedInquiry.id,
                        status: "contacted",
                      });
                      setSelectedInquiry(null);
                    }}
                  >
                    סמן כביצענו קשר
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
