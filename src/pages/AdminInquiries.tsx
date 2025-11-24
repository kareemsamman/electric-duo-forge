import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Mail, Phone, Building2, MapPin, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProjectInquiry {
  id: string;
  created_at: string;
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
  status: string | null;
}

const AdminInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<ProjectInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchInquiries();
  }, [statusFilter]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("project_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("שגיאה בטעינת הפניות");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("project_inquiries")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast.success("הסטטוס עודכן בהצלחה");
      fetchInquiries();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("שגיאה בעדכון הסטטוס");
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500">חדש</Badge>;
      case "contacted":
        return <Badge className="bg-yellow-500">יצרנו קשר</Badge>;
      case "in_progress":
        return <Badge className="bg-orange-500">בטיפול</Badge>;
      case "completed":
        return <Badge className="bg-green-500">הושלם</Badge>;
      case "cancelled":
        return <Badge className="bg-gray-500">בוטל</Badge>;
      default:
        return <Badge className="bg-blue-500">חדש</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-32 pb-20 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              onClick={() => navigate("/admin")}
              variant="ghost"
              className="mb-4"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה למרכז הניהול
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              פניות לפרויקטים
            </h1>
            <p className="text-muted-foreground mt-2">
              ניהול וצפייה בכל הפניות מטפסי "מתכננים פרויקט חדש?"
            </p>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="סנן לפי סטטוס" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הפניות</SelectItem>
              <SelectItem value="new">חדש</SelectItem>
              <SelectItem value="contacted">יצרנו קשר</SelectItem>
              <SelectItem value="in_progress">בטיפול</SelectItem>
              <SelectItem value="completed">הושלם</SelectItem>
              <SelectItem value="cancelled">בוטל</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">אין פניות להצגה</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {inquiries.map((inquiry) => (
              <Card
                key={inquiry.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(inquiry.status)}
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(inquiry.created_at), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                  <Select
                    value={inquiry.status || "new"}
                    onValueChange={(value) => updateStatus(inquiry.id, value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">חדש</SelectItem>
                      <SelectItem value="contacted">יצרנו קשר</SelectItem>
                      <SelectItem value="in_progress">בטיפול</SelectItem>
                      <SelectItem value="completed">הושלם</SelectItem>
                      <SelectItem value="cancelled">בוטל</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Company Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      פרטי החברה
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">שם חברה:</span>{" "}
                        {inquiry.company_name}
                      </p>
                      <p>
                        <span className="font-medium">ח.פ / ע.מ:</span>{" "}
                        {inquiry.company_id}
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>
                          {inquiry.street} {inquiry.street_number}, {inquiry.city}
                          {inquiry.zip_code && `, ${inquiry.zip_code}`}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg">איש קשר</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">שם:</span>{" "}
                        {inquiry.contact_name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <a
                          href={`tel:${inquiry.mobile}`}
                          className="text-primary hover:underline"
                        >
                          {inquiry.mobile}
                        </a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <a
                          href={`mailto:${inquiry.email}`}
                          className="text-primary hover:underline"
                        >
                          {inquiry.email}
                        </a>
                      </p>
                    </div>

                    {inquiry.accountant_name && (
                      <div className="pt-3 border-t">
                        <p className="font-medium text-sm mb-1">מנהל/ת חשבונות:</p>
                        <p className="text-sm">{inquiry.accountant_name}</p>
                        {inquiry.accountant_phone && (
                          <p className="text-sm text-muted-foreground">
                            {inquiry.accountant_phone}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {inquiry.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium text-sm mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      הערות:
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {inquiry.notes}
                    </p>
                  </div>
                )}

                {/* Files */}
                {inquiry.file_urls && inquiry.file_urls.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-medium text-sm mb-2">קבצים מצורפים:</p>
                    <div className="flex flex-wrap gap-2">
                      {inquiry.file_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                        >
                          קובץ {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;
