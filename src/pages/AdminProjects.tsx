import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function AdminProjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
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

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `project-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('project-images').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('project-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      let imageUrl = formData.get('image') as string;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const projectData = {
        project_name: formData.get('project_name') as string,
        project_name_en: formData.get('project_name_en') as string || null,
        location: formData.get('location') as string,
        location_en: formData.get('location_en') as string || null,
        description: formData.get('description') as string,
        description_en: formData.get('description_en') as string || null,
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
        tags_en: (formData.get('tags_en') as string).split(',').map(t => t.trim()),
        image: imageUrl
      };

      const { error } = await supabase.from('projects').insert(projectData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('פרויקט נוצר בהצלחה');
      setIsDialogOpen(false);
      setImageFile(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      let imageUrl = formData.get('image') as string;
      if (imageFile) imageUrl = await uploadImage(imageFile);

      const projectData = {
        project_name: formData.get('project_name') as string,
        project_name_en: formData.get('project_name_en') as string || null,
        location: formData.get('location') as string,
        location_en: formData.get('location_en') as string || null,
        description: formData.get('description') as string,
        description_en: formData.get('description_en') as string || null,
        tags: (formData.get('tags') as string).split(',').map(t => t.trim()),
        tags_en: (formData.get('tags_en') as string).split(',').map(t => t.trim()),
        image: imageUrl
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, formData });
    } else {
      createMutation.mutate(formData);
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
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{project.description}</p>
                            <div className="flex gap-2 mt-2">
                              {project.tags?.slice(0, 3).map((tag: string, i: number) => (
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'ערוך פרויקט' : 'הוסף פרויקט חדש'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>שם פרויקט (עברית)*</Label>
                  <Input name="project_name" defaultValue={editingProject?.project_name} required />
                </div>
                <div>
                  <Label>שם פרויקט (English)</Label>
                  <Input name="project_name_en" defaultValue={editingProject?.project_name_en} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>מיקום (עברית)*</Label>
                  <Input name="location" defaultValue={editingProject?.location} required />
                </div>
                <div>
                  <Label>מיקום (English)</Label>
                  <Input name="location_en" defaultValue={editingProject?.location_en} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>תיאור (עברית)*</Label>
                  <Textarea name="description" defaultValue={editingProject?.description} rows={4} required />
                </div>
                <div>
                  <Label>תיאור (English)</Label>
                  <Textarea name="description_en" defaultValue={editingProject?.description_en} rows={4} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>תגיות (עברית, מופרדות בפסיקים)*</Label>
                  <Input name="tags" defaultValue={editingProject?.tags?.join(', ')} placeholder="חשמל, אנרגיה, תאורה" required />
                </div>
                <div>
                  <Label>תגיות (English, comma separated)</Label>
                  <Input name="tags_en" defaultValue={editingProject?.tags_en?.join(', ')} placeholder="electricity, energy, lighting" />
                </div>
              </div>

              <div>
                <Label>תמונת פרויקט</Label>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                  {editingProject?.image && !imageFile && (
                    <img src={editingProject.image} alt="Current" className="w-20 h-16 object-cover rounded" />
                  )}
                </div>
                <input type="hidden" name="image" value={editingProject?.image || ''} />
              </div>

              <div className="flex justify-end gap-2 pt-4">
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
