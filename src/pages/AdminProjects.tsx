import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, ArrowLeft, X, Video, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface ProjectFormData {
  project_name: string;
  project_name_en: string;
  location: string;
  location_en: string;
  description: string;
  description_en: string;
  tags: string;
  tags_en: string;
  panel_name: string;
  panel_name_en: string;
  panel_current: string;
  video_url: string;
  rich_content: string;
  rich_content_en: string;
}

export default function AdminProjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    project_name: '',
    project_name_en: '',
    location: '',
    location_en: '',
    description: '',
    description_en: '',
    tags: '',
    tags_en: '',
    panel_name: '',
    panel_name_en: '',
    panel_current: '',
    video_url: '',
    rich_content: '',
    rich_content_en: '',
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        project_name: editingProject.project_name || '',
        project_name_en: editingProject.project_name_en || '',
        location: editingProject.location || '',
        location_en: editingProject.location_en || '',
        description: editingProject.description || '',
        description_en: editingProject.description_en || '',
        tags: editingProject.tags?.join(', ') || '',
        tags_en: editingProject.tags_en?.join(', ') || '',
        panel_name: editingProject.panel_name || '',
        panel_name_en: editingProject.panel_name_en || '',
        panel_current: editingProject.panel_current || '',
        video_url: editingProject.video_url || '',
        rich_content: editingProject.rich_content || '',
        rich_content_en: editingProject.rich_content_en || '',
      });
      setAdditionalImages(editingProject.images || []);
    } else {
      setFormData({
        project_name: '',
        project_name_en: '',
        location: '',
        location_en: '',
        description: '',
        description_en: '',
        tags: '',
        tags_en: '',
        panel_name: '',
        panel_name_en: '',
        panel_current: '',
        video_url: '',
        rich_content: '',
        rich_content_en: '',
      });
      setAdditionalImages([]);
    }
    setNewImageFiles([]);
  }, [editingProject]);

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `project-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      let mainImageUrl = '';
      if (imageFile) mainImageUrl = await uploadImage(imageFile);

      // Upload additional images
      const uploadedImages: string[] = [...additionalImages];
      for (const file of newImageFiles) {
        const url = await uploadImage(file);
        uploadedImages.push(url);
      }

      const projectData = {
        project_name: formData.project_name,
        project_name_en: formData.project_name_en || null,
        location: formData.location,
        location_en: formData.location_en || null,
        description: formData.description,
        description_en: formData.description_en || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        tags_en: formData.tags_en.split(',').map(t => t.trim()).filter(Boolean),
        image: mainImageUrl,
        images: uploadedImages,
        panel_name: formData.panel_name || null,
        panel_name_en: formData.panel_name_en || null,
        panel_current: formData.panel_current || null,
        video_url: formData.video_url || null,
        rich_content: formData.rich_content || null,
        rich_content_en: formData.rich_content_en || null,
      };

      const { error } = await supabase.from('projects').insert(projectData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('פרויקט נוצר בהצלחה');
      setIsDialogOpen(false);
      setImageFile(null);
      setNewImageFiles([]);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      let mainImageUrl = editingProject?.image || '';
      if (imageFile) mainImageUrl = await uploadImage(imageFile);

      // Upload additional images
      const uploadedImages: string[] = [...additionalImages];
      for (const file of newImageFiles) {
        const url = await uploadImage(file);
        uploadedImages.push(url);
      }

      const projectData = {
        project_name: formData.project_name,
        project_name_en: formData.project_name_en || null,
        location: formData.location,
        location_en: formData.location_en || null,
        description: formData.description,
        description_en: formData.description_en || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        tags_en: formData.tags_en.split(',').map(t => t.trim()).filter(Boolean),
        image: mainImageUrl,
        images: uploadedImages,
        panel_name: formData.panel_name || null,
        panel_name_en: formData.panel_name_en || null,
        panel_current: formData.panel_current || null,
        video_url: formData.video_url || null,
        rich_content: formData.rich_content || null,
        rich_content_en: formData.rich_content_en || null,
      };

      const { error } = await supabase.from('projects').update(projectData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('פרויקט עודכן בהצלחה');
      setIsDialogOpen(false);
      setEditingProject(null);
      setImageFile(null);
      setNewImageFiles([]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('פרויקט נמחק בהצלחה');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateMutation.mutate(editingProject.id);
    } else {
      createMutation.mutate();
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !projects) return;
    const items = Array.from(projects);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({ id: item.id, display_order: index }));
    queryClient.setQueryData(['admin-projects'], items.map((item, index) => ({ ...item, display_order: index })));

    for (const update of updates) {
      await supabase.from('projects').update({ display_order: update.display_order }).eq('id', update.id);
    }
    toast.success('סדר הפרויקטים עודכן');
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-muted/20 py-12 pt-32 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          {language === 'he' ? (
            <><ArrowRight className="ml-2 h-4 w-4" />חזרה ללוח הבקרה</>
          ) : (
            <><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</>
          )}
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ניהול פרויקטים</h1>
            <p className="text-muted-foreground">גרור לסידור מחדש, לחץ לעריכה</p>
          </div>
          <Button onClick={() => { setEditingProject(null); setImageFile(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 ml-2" />הוסף פרויקט חדש
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="projects">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {projects?.map((project, index) => (
                  <Draggable key={project.id} draggableId={project.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-6 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary' : 'hover:shadow-lg'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <img src={project.image} alt={project.project_name} className="w-32 h-20 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{project.project_name}</h3>
                            <p className="text-sm text-muted-foreground">{project.location}</p>
                            {project.panel_name && (
                              <p className="text-sm text-primary">לוח: {project.panel_name} | זרם: {project.panel_current}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              {project.images?.length > 0 && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3" />{project.images.length} תמונות
                                </span>
                              )}
                              {project.video_url && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                                  <Video className="w-3 h-3" />וידאו
                                </span>
                              )}
                              {project.tags?.slice(0, 2).map((tag: string, i: number) => (
                                <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">{tag}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingProject(project); setImageFile(null); setIsDialogOpen(true); }}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => { if (confirm('למחוק פרויקט זה?')) deleteMutation.mutate(project.id); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isLoading && <div className="text-center py-12">טוען...</div>}
        {!isLoading && projects?.length === 0 && <div className="text-center py-12 text-muted-foreground">אין פרויקטים. הוסף את הפרויקט הראשון!</div>}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'ערוך פרויקט' : 'הוסף פרויקט חדש'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">פרטים בסיסיים</TabsTrigger>
                  <TabsTrigger value="panel">פרטי לוח</TabsTrigger>
                  <TabsTrigger value="media">מדיה</TabsTrigger>
                  <TabsTrigger value="content">תוכן מורחב</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>שם פרויקט (עברית)*</Label>
                      <Input 
                        value={formData.project_name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div>
                      <Label>שם פרויקט (English)</Label>
                      <Input 
                        value={formData.project_name_en} 
                        onChange={(e) => setFormData(prev => ({ ...prev, project_name_en: e.target.value }))} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>מיקום (עברית)*</Label>
                      <Input 
                        value={formData.location} 
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div>
                      <Label>מיקום (English)</Label>
                      <Input 
                        value={formData.location_en} 
                        onChange={(e) => setFormData(prev => ({ ...prev, location_en: e.target.value }))} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>תיאור קצר (עברית)*</Label>
                      <Textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                        rows={3} 
                        required 
                      />
                    </div>
                    <div>
                      <Label>תיאור קצר (English)</Label>
                      <Textarea 
                        value={formData.description_en} 
                        onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))} 
                        rows={3} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>תגיות (עברית, מופרדות בפסיקים)</Label>
                      <Input 
                        value={formData.tags} 
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} 
                        placeholder="חשמל, אנרגיה, תאורה" 
                      />
                    </div>
                    <div>
                      <Label>תגיות (English)</Label>
                      <Input 
                        value={formData.tags_en} 
                        onChange={(e) => setFormData(prev => ({ ...prev, tags_en: e.target.value }))} 
                        placeholder="electricity, energy, lighting" 
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="panel" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>שם לוח (עברית)</Label>
                      <Input 
                        value={formData.panel_name} 
                        onChange={(e) => setFormData(prev => ({ ...prev, panel_name: e.target.value }))} 
                        placeholder="לוח חשמל ראשי A4000"
                      />
                    </div>
                    <div>
                      <Label>שם לוח (English)</Label>
                      <Input 
                        value={formData.panel_name_en} 
                        onChange={(e) => setFormData(prev => ({ ...prev, panel_name_en: e.target.value }))} 
                        placeholder="Main Electrical Panel A4000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>זרם הלוח</Label>
                    <Input 
                      value={formData.panel_current} 
                      onChange={(e) => setFormData(prev => ({ ...prev, panel_current: e.target.value }))} 
                      placeholder="A4000"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-4">
                  {/* Main image */}
                  <div>
                    <Label className="text-lg font-semibold">תמונה ראשית</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                      {editingProject?.image && !imageFile && (
                        <img src={editingProject.image} alt="Current" className="w-24 h-16 object-cover rounded" />
                      )}
                    </div>
                  </div>

                  {/* Video URL */}
                  <div>
                    <Label className="text-lg font-semibold">וידאו</Label>
                    <Input 
                      value={formData.video_url} 
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))} 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">ניתן להזין קישור YouTube או URL של וידאו</p>
                  </div>

                  {/* Additional images */}
                  <div>
                    <Label className="text-lg font-semibold">תמונות נוספות (גלריה)</Label>
                    
                    {/* Existing images */}
                    {additionalImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        {additionalImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img src={img} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New images to upload */}
                    {newImageFiles.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mt-3">
                        {newImageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img src={URL.createObjectURL(file)} alt={`New ${index + 1}`} className="w-full h-24 object-cover rounded-lg border-2 border-dashed border-primary" />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleNewImagesChange} 
                      className="mt-3"
                    />
                    <p className="text-sm text-muted-foreground mt-1">ניתן לבחור מספר תמונות בו-זמנית</p>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-4">
                  <div>
                    <Label className="text-lg font-semibold mb-2 block">תוכן מורחב (עברית)</Label>
                    <p className="text-sm text-muted-foreground mb-2">הוסף טקסט, תמונות וסרטונים - כמו בוורדפרס</p>
                    <RichTextEditor 
                      content={formData.rich_content} 
                      onChange={(content) => setFormData(prev => ({ ...prev, rich_content: content }))} 
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-2 block">תוכן מורחב (English)</Label>
                    <RichTextEditor 
                      content={formData.rich_content_en} 
                      onChange={(content) => setFormData(prev => ({ ...prev, rich_content_en: content }))} 
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingProject ? 'עדכן פרויקט' : 'צור פרויקט'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
