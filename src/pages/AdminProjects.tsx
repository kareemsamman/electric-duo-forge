import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

interface Project {
  id: string;
  project_name: string;
  project_name_en: string | null;
  location: string;
  location_en: string | null;
  description: string;
  description_en: string | null;
  tags: string[];
  tags_en: string[] | null;
  image: string;
  created_at: string;
}

const AdminProjects = () => {
  const { language } = useLanguage();
  const isHebrew = language === "he";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    project_name: "",
    project_name_en: "",
    location: "",
    location_en: "",
    description: "",
    description_en: "",
    tags: [],
    tags_en: [],
    image: "",
  });
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast.error(isHebrew ? "שגיאה בטעינת הפרויקטים" : "Error loading projects");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (id: string, field: string, value: any) => {
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      )
    );
  };

  const handleSave = async (id: string) => {
    setSaving(id);
    try {
      const project = projects.find((p) => p.id === id);
      if (!project) return;

      const { error } = await supabase
        .from("projects")
        .update({
          project_name: project.project_name,
          project_name_en: project.project_name_en,
          location: project.location,
          location_en: project.location_en,
          description: project.description,
          description_en: project.description_en,
          tags: project.tags,
          tags_en: project.tags_en,
          image: project.image,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success(isHebrew ? "הפרויקט עודכן בהצלחה" : "Project updated successfully");
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(isHebrew ? "שגיאה בעדכון הפרויקט" : "Error updating project");
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isHebrew ? "האם למחוק פרויקט זה?" : "Delete this project?")) return;

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;
      setProjects(projects.filter((p) => p.id !== id));
      toast.success(isHebrew ? "הפרויקט נמחק בהצלחה" : "Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(isHebrew ? "שגיאה במחיקת הפרויקט" : "Error deleting project");
    }
  };

  const handleAddProject = async () => {
    if (!newProject.project_name || !newProject.location || !newProject.description || !newProject.image) {
      toast.error(isHebrew ? "אנא מלא את כל השדות הנדרשים" : "Please fill all required fields");
      return;
    }

    setSaving("new");
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([{
          project_name: newProject.project_name,
          project_name_en: newProject.project_name_en || null,
          location: newProject.location,
          location_en: newProject.location_en || null,
          description: newProject.description,
          description_en: newProject.description_en || null,
          tags: newProject.tags || [],
          tags_en: newProject.tags_en || null,
          image: newProject.image,
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setProjects([data[0], ...projects]);
        setNewProject({
          project_name: "",
          project_name_en: "",
          location: "",
          location_en: "",
          description: "",
          description_en: "",
          tags: [],
          tags_en: [],
          image: "",
        });
        setShowNewForm(false);
        toast.success(isHebrew ? "הפרויקט נוסף בהצלחה" : "Project added successfully");
      }
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error(isHebrew ? "שגיאה בהוספת הפרויקט" : "Error adding project");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" dir={isHebrew ? "rtl" : "ltr"}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isHebrew ? "ניהול פרויקטים" : "Manage Projects"}
        </h1>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {isHebrew ? "הוסף פרויקט חדש" : "Add New Project"}
        </Button>
      </div>

      {showNewForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {isHebrew ? "פרויקט חדש" : "New Project"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="he" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="he">עברית</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              
              <TabsContent value="he" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">שם הפרויקט *</label>
                  <Input
                    value={newProject.project_name || ""}
                    onChange={(e) => setNewProject({ ...newProject, project_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">מיקום *</label>
                  <Input
                    value={newProject.location || ""}
                    onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">תיאור *</label>
                  <Textarea
                    value={newProject.description || ""}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">תגיות (מופרדות בפסיק)</label>
                  <Input
                    value={(newProject.tags || []).join(", ")}
                    onChange={(e) => setNewProject({ ...newProject, tags: e.target.value.split(",").map(t => t.trim()) })}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="en" className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Project Name</label>
                  <Input
                    value={newProject.project_name_en || ""}
                    onChange={(e) => setNewProject({ ...newProject, project_name_en: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={newProject.location_en || ""}
                    onChange={(e) => setNewProject({ ...newProject, location_en: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newProject.description_en || ""}
                    onChange={(e) => setNewProject({ ...newProject, description_en: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input
                    value={(newProject.tags_en || []).join(", ")}
                    onChange={(e) => setNewProject({ ...newProject, tags_en: e.target.value.split(",").map(t => t.trim()) })}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <label className="text-sm font-medium">כתובת תמונה (URL או נתיב) *</label>
              <Input
                value={newProject.image || ""}
                onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                placeholder="/src/assets/projects/project-1.jpg"
              />
            </div>

            <Button
              onClick={handleAddProject}
              disabled={saving === "new"}
              className="mt-4 w-full"
            >
              {saving === "new" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isHebrew ? "שומר..." : "Saving..."}
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  {isHebrew ? "הוסף פרויקט" : "Add Project"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{project.project_name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave(project.id)}
                    disabled={saving === project.id}
                  >
                    {saving === project.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isHebrew ? "שמור" : "Save"}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="he" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="he">עברית</TabsTrigger>
                  <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                
                <TabsContent value="he" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">שם הפרויקט</label>
                    <Input
                      value={project.project_name}
                      onChange={(e) => handleUpdate(project.id, "project_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">מיקום</label>
                    <Input
                      value={project.location}
                      onChange={(e) => handleUpdate(project.id, "location", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">תיאור</label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => handleUpdate(project.id, "description", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">תגיות (מופרדות בפסיק)</label>
                    <Input
                      value={project.tags.join(", ")}
                      onChange={(e) => handleUpdate(project.id, "tags", e.target.value.split(",").map(t => t.trim()))}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                      value={project.project_name_en || ""}
                      onChange={(e) => handleUpdate(project.id, "project_name_en", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={project.location_en || ""}
                      onChange={(e) => handleUpdate(project.id, "location_en", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={project.description_en || ""}
                      onChange={(e) => handleUpdate(project.id, "description_en", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <Input
                      value={(project.tags_en || []).join(", ")}
                      onChange={(e) => handleUpdate(project.id, "tags_en", e.target.value.split(",").map(t => t.trim()))}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4">
                <label className="text-sm font-medium">כתובת תמונה (URL או נתיב)</label>
                <Input
                  value={project.image}
                  onChange={(e) => handleUpdate(project.id, "image", e.target.value)}
                />
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.project_name}
                    className="mt-2 w-full max-w-md h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminProjects;
