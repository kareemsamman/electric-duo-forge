import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Trash2, GripVertical, RefreshCw } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface ClientLogo {
  id: string;
  logo_image: string;
  company_name: string;
  company_name_en: string | null;
  display_order: number;
}

const AdminLogos = () => {
  const [logos, setLogos] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("client_logos")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setLogos(data || []);
    } catch (error) {
      console.error("Error fetching logos:", error);
      toast({
        title: "שגיאה",
        description: "נכשל בטעינת הלוגואים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from("client-logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("client-logos")
        .getPublicUrl(fileName);

      // Insert into database
      const newOrder = logos.length > 0 ? Math.max(...logos.map(l => l.display_order)) + 1 : 0;
      const { error: insertError } = await supabase
        .from("client_logos")
        .insert({
          logo_image: publicUrl,
          company_name: "לוגו חדש",
          company_name_en: "New Logo",
          display_order: newOrder,
        });

      if (insertError) throw insertError;

      toast({
        title: "הועלה בהצלחה",
        description: "הלוגו נוסף למערכת",
      });

      fetchLogos();
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "שגיאה",
        description: "נכשל בהעלאת הלוגו",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (logo: ClientLogo) => {
    if (!confirm(`האם למחוק את הלוגו של ${logo.company_name}?`)) return;

    try {
      // Extract file name from URL
      const fileName = logo.logo_image.split("/").pop();
      
      if (fileName && !fileName.includes("placeholder")) {
        // Delete from storage
        await supabase.storage.from("client-logos").remove([fileName]);
      }

      // Delete from database
      const { error } = await supabase
        .from("client_logos")
        .delete()
        .eq("id", logo.id);

      if (error) throw error;

      toast({
        title: "נמחק בהצלחה",
        description: "הלוגו הוסר מהמערכת",
      });

      fetchLogos();
    } catch (error) {
      console.error("Error deleting logo:", error);
      toast({
        title: "שגיאה",
        description: "נכשל במחיקת הלוגו",
        variant: "destructive",
      });
    }
  };

  const handleUpdateName = async (id: string, field: "company_name" | "company_name_en", value: string) => {
    try {
      const { error } = await supabase
        .from("client_logos")
        .update({ [field]: value })
        .eq("id", id);

      if (error) throw error;

      setLogos(prev =>
        prev.map(logo =>
          logo.id === id ? { ...logo, [field]: value } : logo
        )
      );
    } catch (error) {
      console.error("Error updating logo name:", error);
      toast({
        title: "שגיאה",
        description: "נכשל בעדכון השם",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(logos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index,
    }));

    setLogos(updatedItems);

    try {
      // Update all orders in database
      const updates = updatedItems.map(item =>
        supabase
          .from("client_logos")
          .update({ display_order: item.display_order })
          .eq("id", item.id)
      );

      await Promise.all(updates);

      toast({
        title: "עודכן בהצלחה",
        description: "סדר הלוגואים שונה",
      });
    } catch (error) {
      console.error("Error reordering logos:", error);
      toast({
        title: "שגיאה",
        description: "נכשל בעדכון הסדר",
        variant: "destructive",
      });
      fetchLogos();
    }
  };

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
            <h1 className="text-4xl font-bold mb-2">ניהול לוגואי לקוחות</h1>
            <p className="text-muted-foreground">הוסף, מחק וארגן את סדר הלוגואים</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchLogos} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              רענן
            </Button>
            <Button onClick={() => document.getElementById("file-upload")?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              הוסף לוגו
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>לוגואים ({logos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="logos">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {logos.map((logo, index) => (
                      <Draggable key={logo.id} draggableId={logo.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center gap-4 p-4 border rounded-lg bg-card"
                          >
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                            </div>
                            
                            <img
                              src={logo.logo_image}
                              alt={logo.company_name}
                              className="w-20 h-20 object-contain bg-white rounded border p-2"
                            />

                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm text-muted-foreground mb-1 block">שם החברה (עברית)</label>
                                <Input
                                  value={logo.company_name}
                                  onChange={(e) => handleUpdateName(logo.id, "company_name", e.target.value)}
                                  placeholder="שם החברה"
                                />
                              </div>
                              <div>
                                <label className="text-sm text-muted-foreground mb-1 block">שם החברה (אנגלית)</label>
                                <Input
                                  value={logo.company_name_en || ""}
                                  onChange={(e) => handleUpdateName(logo.id, "company_name_en", e.target.value)}
                                  placeholder="Company Name"
                                />
                              </div>
                            </div>

                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(logo)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {logos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                אין לוגואים במערכת. לחץ על "הוסף לוגו" כדי להתחיל.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogos;
