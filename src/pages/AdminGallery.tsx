import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, X, Edit, Save, Image, Video, FolderPlus } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface GalleryItem {
  id: string;
  image: string;
  video_url: string | null;
  title: string;
  title_en: string | null;
  description: string | null;
  description_en: string | null;
  category: string;
  display_order: number;
}

interface GalleryCategory {
  id: string;
  name_he: string;
  name_en: string | null;
  display_order: number;
}

export default function AdminGallery() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatHe, setNewCatHe] = useState('');
  const [newCatEn, setNewCatEn] = useState('');
  const [formData, setFormData] = useState({
    image: '',
    video_url: '',
    title: '',
    title_en: '',
    description: '',
    description_en: '',
    category: '',
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['gallery-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as GalleryCategory[];
    },
  });

  const { data: gallery = [], isLoading } = useQuery({
    queryKey: ['gallery-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as GalleryItem[];
    },
  });

  // Category mutations
  const addCategoryMutation = useMutation({
    mutationFn: async ({ name_he, name_en }: { name_he: string; name_en: string }) => {
      const maxOrder = categories.reduce((max, c) => Math.max(max, c.display_order || 0), 0);
      const { error } = await supabase.from('gallery_categories').insert({
        name_he,
        name_en: name_en || null,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
      toast.success(language === 'he' ? 'קטגוריה נוספה' : 'Category added');
      setNewCatHe('');
      setNewCatEn('');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-categories'] });
      toast.success(language === 'he' ? 'קטגוריה נמחקה' : 'Category deleted');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);
      return publicUrl;
    },
  });

  const uploadVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `video-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);
      return publicUrl;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const maxOrder = gallery.reduce((max, item) => Math.max(max, item.display_order || 0), 0);
      const { error } = await supabase.from('gallery').insert({
        image: data.image || '/placeholder.svg',
        video_url: data.video_url || null,
        title: data.title || '',
        title_en: data.title_en || null,
        description: data.description || null,
        description_en: data.description_en || null,
        category: data.category,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      toast.success(language === 'he' ? 'פריט נוסף בהצלחה' : 'Item added successfully');
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.video_url === '') updateData.video_url = null;
      const { error } = await supabase.from('gallery').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      toast.success(language === 'he' ? 'פריט עודכן בהצלחה' : 'Item updated successfully');
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-admin'] });
      toast.success(language === 'he' ? 'פריט נמחק בהצלחה' : 'Item deleted successfully');
    },
  });

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(gallery);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }));

    queryClient.setQueryData(['gallery-admin'], items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    })));

    for (const update of updates) {
      await supabase.from('gallery').update({ display_order: update.display_order }).eq('id', update.id);
    }
  };

  const resetForm = () => {
    setFormData({ image: '', video_url: '', title: '', title_en: '', description: '', description_en: '', category: categories[0]?.name_he || '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadMutation.mutateAsync(file);
      if (itemId) {
        updateMutation.mutate({ id: itemId, data: { image: publicUrl } });
      } else {
        setFormData(prev => ({ ...prev, image: publicUrl }));
      }
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת הקובץ' : 'Error uploading file');
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, itemId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadVideoMutation.mutateAsync(file);
      if (itemId) {
        updateMutation.mutate({ id: itemId, data: { video_url: publicUrl } });
      } else {
        setFormData(prev => ({ ...prev, video_url: publicUrl }));
      }
      toast.success(language === 'he' ? 'סרטון הועלה בהצלחה' : 'Video uploaded successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת הסרטון' : 'Error uploading video');
    }
  };

  const startEditing = (item: GalleryItem) => {
    setEditingId(item.id);
    setFormData({
      image: item.image,
      video_url: item.video_url || '',
      title: item.title,
      title_en: item.title_en || '',
      description: item.description || '',
      description_en: item.description_en || '',
      category: item.category,
    });
  };

  const saveEdit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    }
  };

  const categorySelectItems = categories.map(c => c.name_he);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4 pt-32">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'he' ? 'חזרה ללוח בקרה' : 'Back to Dashboard'}
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {language === 'he' ? 'ניהול גלריה' : 'Manage Gallery'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'he' ? 'הוספה, עריכה ומחיקה של תמונות וסרטונים' : 'Add, edit and delete images and videos'}
            </p>
          </div>
          <Button onClick={() => { setFormData(prev => ({ ...prev, category: categories[0]?.name_he || '' })); setIsAdding(true); }} disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'he' ? 'הוסף פריט' : 'Add Item'}
          </Button>
        </div>

        {/* Category Management */}
        <Card className="p-4 mb-8">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <FolderPlus className="w-5 h-5" />
            {language === 'he' ? 'ניהול קטגוריות' : 'Manage Categories'}
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1 text-sm">
                <span>{cat.name_he}{cat.name_en ? ` / ${cat.name_en}` : ''}</span>
                <button
                  onClick={() => deleteCategoryMutation.mutate(cat.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <div>
              <Label className="text-xs">{language === 'he' ? 'שם בעברית' : 'Name (Hebrew)'}</Label>
              <Input value={newCatHe} onChange={(e) => setNewCatHe(e.target.value)} className="h-9 w-40" placeholder="עברית" />
            </div>
            <div>
              <Label className="text-xs">{language === 'he' ? 'שם באנגלית' : 'Name (English)'}</Label>
              <Input value={newCatEn} onChange={(e) => setNewCatEn(e.target.value)} className="h-9 w-40" placeholder="English" />
            </div>
            <Button
              size="sm"
              disabled={!newCatHe.trim() || addCategoryMutation.isPending}
              onClick={() => addCategoryMutation.mutate({ name_he: newCatHe.trim(), name_en: newCatEn.trim() })}
            >
              <Plus className="w-4 h-4 mr-1" />
              {language === 'he' ? 'הוסף' : 'Add'}
            </Button>
          </div>
        </Card>

        {/* Add New Form */}
        {isAdding && (
          <Card className="p-6 mb-8 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'he' ? 'פריט חדש' : 'New Item'}
            </h3>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="w-40 h-32 border-2 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                  {formData.image ? (
                    <>
                      <img src={formData.image} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {language === 'he' ? 'העלה תמונה' : 'Upload Image'}
                      </span>
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e)} />
                    </label>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'he' ? 'כותרת (עברית)' : 'Title (Hebrew)'}</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>{language === 'he' ? 'כותרת (אנגלית)' : 'Title (English)'}</Label>
                    <Input
                      value={formData.title_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>{language === 'he' ? 'קטגוריה' : 'Category'}</Label>
                    <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categorySelectItems.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'he' ? 'סרטון MP4 (אופציונלי)' : 'Video MP4 (optional)'}</Label>
                    <div className="flex gap-2 items-center">
                      {formData.video_url ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Video className="w-4 h-4 text-primary" />
                          <span className="text-sm truncate flex-1">{language === 'he' ? 'סרטון הועלה' : 'Video uploaded'}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted transition-colors flex-1">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">{language === 'he' ? 'העלה סרטון' : 'Upload Video'}</span>
                          <input 
                            type="file" 
                            accept="video/mp4,video/webm" 
                            className="hidden" 
                            onChange={(e) => handleVideoUpload(e)} 
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'he' ? 'תיאור (עברית)' : 'Description (Hebrew)'}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>{language === 'he' ? 'תיאור (אנגלית)' : 'Description (English)'}</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  {language === 'he' ? 'ביטול' : 'Cancel'}
                </Button>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={(!formData.image && !formData.video_url) || !formData.category || createMutation.isPending}
                >
                  {language === 'he' ? 'שמור' : 'Save'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'he' ? 'טוען...' : 'Loading...'}
          </div>
        ) : gallery.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'he' ? 'אין פריטים בגלריה עדיין' : 'No gallery items yet'}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4">
                  {gallery.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 transition-all ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary' : ''}`}
                        >
                          {editingId === item.id ? (
                            <div className="grid gap-4">
                              <div className="flex gap-4">
                                <div className="w-32 h-24 border-2 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                                  {formData.image ? (
                                    <>
                                      <img src={formData.image} alt="" className="w-full h-full object-cover" />
                                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                        <Upload className="w-5 h-5 text-white" />
                                        <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, item.id)} />
                                      </label>
                                    </>
                                  ) : (
                                    <label className="cursor-pointer">
                                      <Upload className="w-5 h-5 text-muted-foreground" />
                                      <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleFileUpload(e, item.id)} />
                                    </label>
                                  )}
                                </div>
                                <div className="flex-1 grid grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs">{language === 'he' ? 'כותרת (עברית)' : 'Title (HE)'}</Label>
                                    <Input
                                      value={formData.title}
                                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">{language === 'he' ? 'כותרת (אנגלית)' : 'Title (EN)'}</Label>
                                    <Input
                                      value={formData.title_en}
                                      onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">{language === 'he' ? 'קטגוריה' : 'Category'}</Label>
                                    <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                                      <SelectTrigger className="h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categorySelectItems.map(cat => (
                                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">{language === 'he' ? 'תיאור (עברית)' : 'Description (HE)'}</Label>
                                  <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={2}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">{language === 'he' ? 'תיאור (אנגלית)' : 'Description (EN)'}</Label>
                                  <Textarea
                                    value={formData.description_en}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                                    rows={2}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">{language === 'he' ? 'סרטון MP4' : 'Video MP4'}</Label>
                                  <div className="flex gap-2 items-center">
                                    {formData.video_url ? (
                                      <div className="flex items-center gap-2 flex-1">
                                        <Video className="w-4 h-4 text-primary" />
                                        <span className="text-xs truncate flex-1">{language === 'he' ? 'סרטון הועלה' : 'Video uploaded'}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <label className="cursor-pointer flex items-center gap-2 px-2 py-1 border rounded-md hover:bg-muted transition-colors flex-1 h-9">
                                        <Upload className="w-3 h-3" />
                                        <span className="text-xs">{language === 'he' ? 'העלה' : 'Upload'}</span>
                                        <input 
                                          type="file" 
                                          accept="video/mp4,video/webm" 
                                          className="hidden" 
                                          onChange={(e) => handleVideoUpload(e, editingId!)} 
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={resetForm}>
                                  {language === 'he' ? 'ביטול' : 'Cancel'}
                                </Button>
                                <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending}>
                                  <Save className="w-4 h-4 mr-1" />
                                  {language === 'he' ? 'שמור' : 'Save'}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div className="w-24 h-16 rounded-lg overflow-hidden relative">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                {item.video_url && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Video className="w-6 h-6 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.title || (language === 'he' ? '(ללא כותרת)' : '(No title)')}</h4>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => startEditing(item)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => deleteMutation.mutate(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
