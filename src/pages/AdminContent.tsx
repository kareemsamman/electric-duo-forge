import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, RefreshCw } from "lucide-react";

interface ContentItem {
  id: string;
  key: string;
  value_he: string;
  value_en: string | null;
  section: string;
  description: string | null;
}

const AdminContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("section", { ascending: true })
        .order("key", { ascending: true });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "שגיאה",
        description: "נכשל בטעינת התוכן",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleUpdate = async (id: string, field: "value_he" | "value_en", value: string) => {
    setContent(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async (item: ContentItem) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("site_content")
        .update({
          value_he: item.value_he,
          value_en: item.value_en,
        })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "נשמר בהצלחה",
        description: `התוכן "${item.key}" עודכן`,
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "שגיאה",
        description: "נכשל בשמירת התוכן",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const sections = [...new Set(content.map(item => item.section))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ניהול תוכן האתר</h1>
            <p className="text-muted-foreground">ערוך את כל הטקסטים באתר ללא צורך בשינוי קוד</p>
          </div>
          <Button onClick={fetchContent} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            רענן
          </Button>
        </div>

        <Tabs defaultValue={sections[0]} className="w-full" dir="rtl">
          <TabsList className="w-full justify-start flex-wrap h-auto">
            {sections.map(section => (
              <TabsTrigger key={section} value={section} className="capitalize">
                {section}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map(section => (
            <TabsContent key={section} value={section} className="space-y-4 mt-6">
              {content
                .filter(item => item.section === section)
                .map(item => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg font-mono">{item.key}</CardTitle>
                      {item.description && (
                        <CardDescription>{item.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">עברית</label>
                        {item.value_he.length > 100 ? (
                          <Textarea
                            value={item.value_he}
                            onChange={(e) => handleUpdate(item.id, "value_he", e.target.value)}
                            rows={3}
                            className="font-sans"
                            dir="rtl"
                          />
                        ) : (
                          <Input
                            value={item.value_he}
                            onChange={(e) => handleUpdate(item.id, "value_he", e.target.value)}
                            className="font-sans"
                            dir="rtl"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">English</label>
                        {(item.value_en || "").length > 100 ? (
                          <Textarea
                            value={item.value_en || ""}
                            onChange={(e) => handleUpdate(item.id, "value_en", e.target.value)}
                            rows={3}
                            className="font-sans"
                            dir="ltr"
                          />
                        ) : (
                          <Input
                            value={item.value_en || ""}
                            onChange={(e) => handleUpdate(item.id, "value_en", e.target.value)}
                            className="font-sans"
                            dir="ltr"
                          />
                        )}
                      </div>

                      <Button
                        onClick={() => handleSave(item)}
                        disabled={saving}
                        className="w-full"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin ml-2" />
                        ) : (
                          <Save className="w-4 h-4 ml-2" />
                        )}
                        שמור שינויים
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminContent;
