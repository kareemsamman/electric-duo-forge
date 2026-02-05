import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, ArrowLeft, Save, X, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardCheck, Factory, Wrench, FlaskConical, Headphones, Zap, Settings, Shield, Cpu, Cable } from 'lucide-react';

const iconOptions = [
  { value: 'ClipboardCheck', label: 'תכנון', Icon: ClipboardCheck },
  { value: 'Factory', label: 'מפעל', Icon: Factory },
  { value: 'Wrench', label: 'כלים', Icon: Wrench },
  { value: 'FlaskConical', label: 'בדיקות', Icon: FlaskConical },
  { value: 'Headphones', label: 'תמיכה', Icon: Headphones },
  { value: 'Zap', label: 'חשמל', Icon: Zap },
  { value: 'Settings', label: 'הגדרות', Icon: Settings },
  { value: 'Shield', label: 'אבטחה', Icon: Shield },
  { value: 'Cpu', label: 'טכנולוגיה', Icon: Cpu },
  { value: 'Cable', label: 'כבלים', Icon: Cable },
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(opt => opt.value === iconName);
  return found ? found.Icon : ClipboardCheck;
};

interface ServiceLink {
  text: string;
  url: string;
}

interface Service {
  id: string;
  icon: string;
  title_he: string;
  title_en: string | null;
  description_he: string;
  description_en: string | null;
  link_url: string | null;
  links: ServiceLink[] | null;
  display_order: number;
  is_active: boolean;
}

export default function AdminServices() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    icon: 'ClipboardCheck',
    title_he: '',
    title_en: '',
    description_he: '',
    description_en: '',
    links: [] as ServiceLink[],
    is_active: true
  });

  const { data: services, isLoading } = useQuery({
    queryKey: ['services-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as unknown as Service[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const maxOrder = services?.length ? Math.max(...services.map(s => s.display_order)) + 1 : 0;
      const { error } = await supabase.from('services').insert([{ 
        icon: data.icon,
        title_he: data.title_he,
        title_en: data.title_en || null,
        description_he: data.description_he,
        description_en: data.description_en || null,
        links: data.links as unknown as any,
        is_active: data.is_active,
        display_order: maxOrder 
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-admin'] });
      toast.success('שירות נוסף בהצלחה');
      setIsAdding(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const updateData = {
        ...data,
        links: data.links as unknown as any
      };
      const { error } = await supabase.from('services').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-admin'] });
      toast.success('שירות עודכן בהצלחה');
      setEditingId(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-admin'] });
      toast.success('שירות נמחק בהצלחה');
    }
  });

  const resetForm = () => {
    setFormData({ icon: 'ClipboardCheck', title_he: '', title_en: '', description_he: '', description_en: '', links: [], is_active: true });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !services) return;
    const items = Array.from(services);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    queryClient.setQueryData(['services-admin'], items.map((item, index) => ({ ...item, display_order: index })));

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      await supabase.from('services').update({ display_order: index }).eq('id', item.id);
    }
    toast.success('סדר השירותים עודכן');
  };

  const addLink = () => {
    setFormData(prev => ({
      ...prev,
      links: [...prev.links, { text: '', url: '' }]
    }));
  };

  const updateLink = (index: number, field: 'text' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === index ? { ...link, [field]: value } : link)
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const ServiceForm = ({ isNew = false }: { isNew?: boolean }) => (
    <Card className={`p-6 mb-4 ${isNew ? 'border-2 border-primary' : ''}`}>
      <h3 className="text-lg font-semibold mb-4">{isNew ? 'שירות חדש' : 'עריכת שירות'}</h3>
      <div className="grid gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>אייקון</Label>
            <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map(opt => {
                  const IconComp = opt.Icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <IconComp className="w-4 h-4" />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
            <Label>פעיל</Label>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>כותרת (עברית)</Label>
            <Input value={formData.title_he} onChange={(e) => setFormData(prev => ({ ...prev, title_he: e.target.value }))} />
          </div>
          <div>
            <Label>כותרת (English)</Label>
            <Input value={formData.title_en} onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>תיאור (עברית)</Label>
            <Textarea value={formData.description_he} onChange={(e) => setFormData(prev => ({ ...prev, description_he: e.target.value }))} rows={3} />
          </div>
          <div>
            <Label>תיאור (English)</Label>
            <Textarea value={formData.description_en} onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))} rows={3} />
          </div>
        </div>
        
        {/* Links Repeater */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <Label className="flex items-center gap-2 text-base">
              <LinkIcon className="w-4 h-4" />
              קישורים
            </Label>
            <Button type="button" variant="outline" size="sm" onClick={addLink}>
              <Plus className="w-4 h-4 ml-1" />
              הוסף קישור
            </Button>
          </div>
          
          {formData.links.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">אין קישורים. לחץ על "הוסף קישור" כדי להוסיף.</p>
          ) : (
            <div className="space-y-3">
              {formData.links.map((link, index) => (
                <div key={index} className="flex items-start gap-3 bg-background p-3 rounded-md border">
                  <div className="flex-1 grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">טקסט הקישור</Label>
                      <Input 
                        value={link.text} 
                        onChange={(e) => updateLink(index, 'text', e.target.value)}
                        placeholder="לדוגמה: לוחות חשמל"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">כתובת URL</Label>
                      <Input 
                        value={link.url} 
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        placeholder="/projects או https://..."
                      />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10 mt-5"
                    onClick={() => removeLink(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">הקישורים יופיעו מתחת לתיאור השירות</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!formData.title_he || !formData.description_he}>
            <Save className="w-4 h-4 ml-2" />שמור
          </Button>
          <Button variant="outline" onClick={() => { isNew ? setIsAdding(false) : setEditingId(null); resetForm(); }}>
            <X className="w-4 h-4 ml-2" />ביטול
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-muted/20 py-12 pt-32 px-4">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-6">
          {language === 'he' ? (
            <><ArrowRight className="ml-2 h-4 w-4" />חזרה ללוח הבקרה</>
          ) : (
            <><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</>
          )}
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">ניהול שירותים</h1>
            <p className="text-muted-foreground">גרור לסידור מחדש. הוסף קישורים לכל שירות.</p>
          </div>
          <Button onClick={() => { setIsAdding(true); resetForm(); }} disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 ml-2" />הוסף שירות
          </Button>
        </div>

        {isAdding && <ServiceForm isNew />}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="services">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {services?.map((service, index) => {
                  const IconComp = getIconComponent(service.icon);
                  const linksArray = (service.links as ServiceLink[] | null) || [];
                  return (
                    <Draggable key={service.id} draggableId={service.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-6 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary' : 'hover:shadow-lg'}`}
                        >
                          {editingId === service.id ? (
                            <ServiceForm />
                          ) : (
                            <div className="flex items-center gap-4">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div className="flex-shrink-0 w-12 h-12 bg-[#1A73E8]/10 rounded-full flex items-center justify-center">
                                <IconComp className="text-[#1A73E8] w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="text-lg font-semibold">{service.title_he}</h3>
                                  {!service.is_active && <span className="text-xs bg-muted px-2 py-1 rounded">לא פעיל</span>}
                                  {linksArray.length > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-[#1A73E8]">
                                      <LinkIcon className="w-3 h-3" />
                                      {linksArray.length} קישורים
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-1">{service.description_he}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingId(service.id);
                                    setFormData({
                                      icon: service.icon,
                                      title_he: service.title_he,
                                      title_en: service.title_en || '',
                                      description_he: service.description_he,
                                      description_en: service.description_en || '',
                                      links: linksArray,
                                      is_active: service.is_active
                                    });
                                  }}
                                  disabled={editingId !== null || isAdding}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => { if (confirm('האם למחוק שירות זה?')) deleteMutation.mutate(service.id); }}
                                  disabled={editingId !== null || isAdding}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isLoading && <div className="text-center py-12">טוען...</div>}
        {!isLoading && services?.length === 0 && <div className="text-center py-12 text-muted-foreground">אין שירותים. הוסף את השירות הראשון!</div>}
      </div>
    </div>
  );
}