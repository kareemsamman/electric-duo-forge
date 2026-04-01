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
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, ArrowLeft, X, Video, Image as ImageIcon, Copy, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

interface PanelData {
  id?: string;
  panel_name: string;
  panel_name_en: string;
  panel_current: string;
  image: string;
  images: string[];
}

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
  image_url: string;
}

export default function AdminProjects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [hasMultiplePanels, setHasMultiplePanels] = useState(false);
  const [panels, setPanels] = useState<PanelData[]>([]);
  const [panelNewImageUrls, setPanelNewImageUrls] = useState<Record<number, string>>({});
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
    image_url: '',
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

  const { data: categories } = useQuery({
    queryKey: ['admin-project-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: categoryAssignments, refetch: refetchAssignments } = useQuery({
    queryKey: ['admin-category-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_category_assignments')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const getProjectCategories = (projectId: string) => {
    return categoryAssignments?.filter(a => a.project_id === projectId).map(a => a.category_id) || [];
  };

  const toggleCategory = async (projectId: string, categoryId: string, isAssigned: boolean) => {
    if (isAssigned) {
      await supabase.from('project_category_assignments').delete().eq('project_id', projectId).eq('category_id', categoryId);
    } else {
      await supabase.from('project_category_assignments').insert({ project_id: projectId, category_id: categoryId });
    }
    refetchAssignments();
  };

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
        image_url: editingProject.image || '',
      });
      setGalleryImages(editingProject.images || []);
      setHasMultiplePanels(editingProject.has_multiple_panels || false);
      // Load panels from DB
      if (editingProject.has_multiple_panels) {
        supabase
          .from('project_panels')
          .select('*')
          .eq('project_id', editingProject.id)
          .order('display_order', { ascending: true })
          .then(({ data }) => {
            setPanels((data || []).map((p: any) => ({
              id: p.id,
              panel_name: p.panel_name || '',
              panel_name_en: p.panel_name_en || '',
              panel_current: p.panel_current || '',
              image: p.image || '',
              images: p.images || [],
            })));
          });
      } else {
        setPanels([]);
      }
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
        image_url: '',
      });
      setGalleryImages([]);
      setHasMultiplePanels(false);
      setPanels([]);
    }
    setNewImageUrl('');
    setPanelNewImageUrls({});
  }, [editingProject]);

  const savePanels = async (projectId: string) => {
    // Delete old panels
    await supabase.from('project_panels').delete().eq('project_id', projectId);
    // Insert new panels
    if (hasMultiplePanels && panels.length > 0) {
      const panelRows = panels.map((p, i) => ({
        project_id: projectId,
        panel_name: p.panel_name,
        panel_name_en: p.panel_name_en || null,
        panel_current: p.panel_current || null,
        image: p.image || null,
        images: p.images || [],
        display_order: i,
      }));
      const { error } = await supabase.from('project_panels').insert(panelRows);
      if (error) throw error;
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const projectData: any = {
        project_name: formData.project_name,
        project_name_en: formData.project_name_en || null,
        location: formData.location,
        location_en: formData.location_en || null,
        description: formData.description,
        description_en: formData.description_en || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        tags_en: formData.tags_en.split(',').map(t => t.trim()).filter(Boolean),
        image: formData.image_url,
        images: galleryImages,
        panel_name: hasMultiplePanels ? null : (formData.panel_name || null),
        panel_name_en: hasMultiplePanels ? null : (formData.panel_name_en || null),
        panel_current: hasMultiplePanels ? null : (formData.panel_current || null),
        video_url: formData.video_url || null,
        rich_content: formData.rich_content || null,
        rich_content_en: formData.rich_content_en || null,
        has_multiple_panels: hasMultiplePanels,
      };

      const { data, error } = await supabase.from('projects').insert(projectData).select('id').single();
      if (error) throw error;
      if (hasMultiplePanels && data) {
        await savePanels(data.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('פרויקט נוצר בהצלחה');
      setIsDialogOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => {
      const projectData: any = {
        project_name: formData.project_name,
        project_name_en: formData.project_name_en || null,
        location: formData.location,
        location_en: formData.location_en || null,
        description: formData.description,
        description_en: formData.description_en || null,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        tags_en: formData.tags_en.split(',').map(t => t.trim()).filter(Boolean),
        image: formData.image_url,
        images: galleryImages,
        panel_name: hasMultiplePanels ? null : (formData.panel_name || null),
        panel_name_en: hasMultiplePanels ? null : (formData.panel_name_en || null),
        panel_current: hasMultiplePanels ? null : (formData.panel_current || null),
        video_url: formData.video_url || null,
        rich_content: formData.rich_content || null,
        rich_content_en: formData.rich_content_en || null,
        has_multiple_panels: hasMultiplePanels,
      };

      const { error } = await supabase.from('projects').update(projectData).eq('id', id);
      if (error) throw error;
      await savePanels(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('פרויקט עודכן בהצלחה');
      setIsDialogOpen(false);
      setEditingProject(null);
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

  const duplicateMutation = useMutation({
    mutationFn: async (project: any) => {
      const duplicatedProject = {
        project_name: `${project.project_name} (עותק)`,
        project_name_en: project.project_name_en ? `${project.project_name_en} (Copy)` : null,
        location: project.location,
        location_en: project.location_en || null,
        description: project.description,
        description_en: project.description_en || null,
        tags: project.tags || [],
        tags_en: project.tags_en || [],
        image: project.image,
        images: project.images || [],
        panel_name: project.panel_name || null,
        panel_name_en: project.panel_name_en || null,
        panel_current: project.panel_current || null,
        video_url: project.video_url || null,
        rich_content: project.rich_content || null,
        rich_content_en: project.rich_content_en || null,
        display_order: (projects?.length || 0) + 1,
      };

      const { error } = await supabase.from('projects').insert(duplicatedProject);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('פרויקט שוכפל בהצלחה');
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

  const addGalleryImage = () => {
    if (newImageUrl.trim()) {
      setGalleryImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGalleryDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(galleryImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setGalleryImages(items);
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
          <Button onClick={() => { setEditingProject(null); setIsDialogOpen(true); }}>
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
                          <div className="relative">
                            <img src={project.image} alt={project.project_name} className={`w-32 h-20 object-cover rounded-lg ${project.is_visible === false ? 'opacity-50' : ''}`} />
                            {project.is_visible === false && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                                <EyeOff className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-semibold">{project.project_name}</h3>
                              {project.is_visible === false && (
                                <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">מוסתר</span>
                              )}
                            </div>
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={async () => {
                                const newVisibility = !(project.is_visible ?? true);
                                await supabase.from('projects').update({ is_visible: newVisibility }).eq('id', project.id);
                                queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
                                toast.success(newVisibility ? 'פרויקט מוצג באתר' : 'פרויקט הוסתר מהאתר');
                              }}
                              title={project.is_visible !== false ? 'הסתר מהאתר' : 'הצג באתר'}
                            >
                              {project.is_visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => duplicateMutation.mutate(project)} title="שכפל">
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => { setEditingProject(project); setIsDialogOpen(true); }}>
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

                  {/* Category Assignment */}
                  {editingProject && categories && categories.length > 0 && (
                    <div>
                      <Label className="mb-2 block">קטגוריות / Categories</Label>
                      <div className="grid grid-cols-2 gap-2 border rounded-lg p-3">
                        {categories.map((cat) => {
                          const isAssigned = getProjectCategories(editingProject.id).includes(cat.id);
                          return (
                            <label key={cat.id} className="flex items-center gap-2 p-2 rounded hover:bg-secondary/50 cursor-pointer">
                              <Checkbox
                                checked={isAssigned}
                                onCheckedChange={() => toggleCategory(editingProject.id, cat.id, isAssigned)}
                              />
                              <span className="font-medium">{cat.name_he}</span>
                              {cat.name_en && <span className="text-sm text-muted-foreground">({cat.name_en})</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                </TabsContent>

                <TabsContent value="panel" className="space-y-4 mt-4">
                  {/* Multi-panel toggle */}
                  <div className="flex items-center gap-3 mb-4">
                    <Switch checked={hasMultiplePanels} onCheckedChange={setHasMultiplePanels} />
                    <Label>מספר לוחות (Multiple Panels)</Label>
                  </div>

                  {!hasMultiplePanels ? (
                    <>
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
                    </>
                  ) : (
                    <div className="space-y-4">
                      {panels.map((panel, pIndex) => (
                        <div key={pIndex} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">לוח #{pIndex + 1}</h4>
                            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => setPanels(prev => prev.filter((_, i) => i !== pIndex))}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>שם לוח (עברית)*</Label>
                              <Input value={panel.panel_name} onChange={(e) => setPanels(prev => prev.map((p, i) => i === pIndex ? { ...p, panel_name: e.target.value } : p))} />
                            </div>
                            <div>
                              <Label>שם לוח (English)</Label>
                              <Input value={panel.panel_name_en} onChange={(e) => setPanels(prev => prev.map((p, i) => i === pIndex ? { ...p, panel_name_en: e.target.value } : p))} />
                            </div>
                          </div>
                          <div>
                            <Label>זרם הלוח</Label>
                            <Input value={panel.panel_current} onChange={(e) => setPanels(prev => prev.map((p, i) => i === pIndex ? { ...p, panel_current: e.target.value } : p))} />
                          </div>
                          <div>
                            <Label>תמונה ראשית (URL)</Label>
                            <Input value={panel.image} onChange={(e) => setPanels(prev => prev.map((p, i) => i === pIndex ? { ...p, image: e.target.value } : p))} placeholder="https://..." />
                            {panel.image && <img src={panel.image} alt="Preview" className="w-24 h-16 object-cover rounded mt-1" />}
                          </div>
                          <div>
                            <Label>גלריית תמונות</Label>
                            <div className="flex gap-2 mb-2">
                              <Input 
                                value={panelNewImageUrls[pIndex] || ''} 
                                onChange={(e) => setPanelNewImageUrls(prev => ({ ...prev, [pIndex]: e.target.value }))}
                                placeholder="https://..."
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const url = panelNewImageUrls[pIndex]?.trim();
                                    if (url) {
                                      setPanels(prev => prev.map((p, i) => i === pIndex ? { ...p, images: [...p.images, url] } : p));
                                      setPanelNewImageUrls(prev => ({ ...prev, [pIndex]: '' }));
                                    }
                                  }
                                }}
                              />
                              <Button type="button" size="sm" onClick={() => {
                                const url = panelNewImageUrls[pIndex]?.trim();
                                if (url) {
                                  setPanels(prev => prev.map((p, i) => i === pIndex ? { ...p, images: [...p.images, url] } : p));
                                  setPanelNewImageUrls(prev => ({ ...prev, [pIndex]: '' }));
                                }
                              }}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {panel.images.map((img, imgIndex) => (
                              <div key={imgIndex} className="flex items-center gap-2 mb-1">
                                <img src={img} alt="" className="w-12 h-8 object-cover rounded" />
                                <span className="text-xs truncate flex-1">{img}</span>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setPanels(prev => prev.map((p, i) => i === pIndex ? { ...p, images: p.images.filter((_, ii) => ii !== imgIndex) } : p))}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => setPanels(prev => [...prev, { panel_name: '', panel_name_en: '', panel_current: '', image: '', images: [] }])}>
                        <Plus className="w-4 h-4 ml-1" />הוסף לוח
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="media" className="space-y-6 mt-4">
                  {/* Main image URL */}
                  <div>
                    <Label className="text-lg font-semibold">תמונה ראשית (URL)</Label>
                    <Input 
                      value={formData.image_url} 
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))} 
                      placeholder="https://cdn.example.com/image.jpg"
                      className="mt-2"
                    />
                    {formData.image_url && (
                      <div className="mt-3">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-48 h-32 object-cover rounded-lg border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Video URL */}
                  <div>
                    <Label className="text-lg font-semibold">וידאו (URL)</Label>
                    <Input 
                      value={formData.video_url} 
                      onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))} 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">ניתן להזין קישור YouTube או URL של וידאו</p>
                  </div>

                  {/* Gallery images repeater */}
                  <div>
                    <Label className="text-lg font-semibold">גלריית תמונות</Label>
                    <p className="text-sm text-muted-foreground mb-3">הוסף קישורים לתמונות וגרור לשינוי סדר</p>
                    
                    {/* Add new image URL */}
                    <div className="flex gap-2 mb-4">
                      <Input 
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="https://cdn.example.com/gallery-image.jpg"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGalleryImage(); } }}
                      />
                      <Button type="button" onClick={addGalleryImage} disabled={!newImageUrl.trim()}>
                        <Plus className="w-4 h-4 ml-1" />הוסף
                      </Button>
                    </div>

                    {/* Draggable gallery list */}
                    {galleryImages.length > 0 && (
                      <DragDropContext onDragEnd={handleGalleryDragEnd}>
                        <Droppable droppableId="gallery-images">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                              {galleryImages.map((img, index) => (
                                <Draggable key={`gallery-${index}`} draggableId={`gallery-${index}`} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className={`flex items-center gap-3 p-2 bg-muted/50 rounded-lg border ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
                                    >
                                      <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                        <GripVertical className="w-4 h-4" />
                                      </div>
                                      <img 
                                        src={img} 
                                        alt={`Gallery ${index + 1}`} 
                                        className="w-16 h-12 object-cover rounded"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                                      />
                                      <span className="flex-1 text-sm truncate">{img}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeGalleryImage(index)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <X className="w-4 h-4" />
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
                    )}

                    {galleryImages.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        אין תמונות בגלריה. הוסף קישורים לתמונות למעלה.
                      </div>
                    )}
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
