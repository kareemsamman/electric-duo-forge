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
import { ArrowLeft, Plus, Trash2, GripVertical, Upload, X, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  role_en: string | null;
  description: string;
  description_en: string | null;
  photo: string;
  display_order: number | null;
}

export default function AdminTeam() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    role_en: '',
    description: '',
    description_en: '',
    photo: '',
  });

  const { data: team = [], isLoading } = useQuery({
    queryKey: ['team-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('team-photos')
        .getPublicUrl(fileName);
      return publicUrl;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const maxOrder = team.reduce((max, m) => Math.max(max, m.display_order || 0), 0);
      const { error } = await supabase.from('team').insert({
        name: data.name,
        role: data.role,
        role_en: data.role_en || null,
        description: data.description,
        description_en: data.description_en || null,
        photo: data.photo,
        display_order: maxOrder + 1,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-admin'] });
      toast.success(language === 'he' ? 'חבר צוות נוסף בהצלחה' : 'Team member added successfully');
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const { error } = await supabase.from('team').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-admin'] });
      toast.success(language === 'he' ? 'חבר צוות עודכן בהצלחה' : 'Team member updated successfully');
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('team').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-admin'] });
      toast.success(language === 'he' ? 'חבר צוות נמחק בהצלחה' : 'Team member deleted successfully');
    },
  });

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(team);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update display_order for all items
    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index + 1,
    }));

    // Optimistic update
    queryClient.setQueryData(['team-admin'], items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    })));

    // Persist to database
    for (const update of updates) {
      await supabase.from('team').update({ display_order: update.display_order }).eq('id', update.id);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', role_en: '', description: '', description_en: '', photo: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, memberId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await uploadMutation.mutateAsync(file);
      if (memberId) {
        updateMutation.mutate({ id: memberId, data: { photo: publicUrl } });
      } else {
        setFormData(prev => ({ ...prev, photo: publicUrl }));
      }
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading image');
    }
  };

  const startEditing = (member: TeamMember) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      role_en: member.role_en || '',
      description: member.description,
      description_en: member.description_en || '',
      photo: member.photo,
    });
  };

  const saveEdit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background py-12 px-4 pt-32">
      <div className="max-w-5xl mx-auto">
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
              {language === 'he' ? 'ניהול צוות' : 'Manage Team'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {language === 'he' ? 'הוספה, עריכה ומחיקה של חברי צוות' : 'Add, edit and delete team members'}
            </p>
          </div>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="w-4 h-4 mr-2" />
            {language === 'he' ? 'הוסף חבר צוות' : 'Add Member'}
          </Button>
        </div>

        {/* Add New Form */}
        {isAdding && (
          <Card className="p-6 mb-8 border-primary/20">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'he' ? 'חבר צוות חדש' : 'New Team Member'}
            </h3>
            <div className="grid gap-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                  {formData.photo ? (
                    <>
                      <img src={formData.photo} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {language === 'he' ? 'העלה תמונה' : 'Upload'}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e)} />
                    </label>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'he' ? 'שם' : 'Name'}</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>{language === 'he' ? 'תפקיד (עברית)' : 'Role (Hebrew)'}</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>{language === 'he' ? 'תפקיד (אנגלית)' : 'Role (English)'}</Label>
                    <Input
                      value={formData.role_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, role_en: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'he' ? 'תיאור (עברית)' : 'Description (Hebrew)'}</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>{language === 'he' ? 'תיאור (אנגלית)' : 'Description (English)'}</Label>
                  <Textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  {language === 'he' ? 'ביטול' : 'Cancel'}
                </Button>
                <Button
                  onClick={() => createMutation.mutate(formData)}
                  disabled={!formData.name || !formData.role || createMutation.isPending}
                >
                  {language === 'he' ? 'שמור' : 'Save'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Team List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'he' ? 'טוען...' : 'Loading...'}
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'he' ? 'אין חברי צוות עדיין' : 'No team members yet'}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="team-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {team.map((member, index) => (
                    <Draggable key={member.id} draggableId={member.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 transition-all ${snapshot.isDragging ? 'shadow-xl ring-2 ring-primary' : ''}`}
                        >
                          {editingId === member.id ? (
                            <div className="grid gap-4">
                              <div className="flex gap-4">
                                <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden">
                                  {formData.photo ? (
                                    <>
                                      <img src={formData.photo} alt="" className="w-full h-full object-cover" />
                                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                                        <Upload className="w-5 h-5 text-white" />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, member.id)} />
                                      </label>
                                    </>
                                  ) : (
                                    <label className="cursor-pointer">
                                      <Upload className="w-5 h-5 text-muted-foreground" />
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, member.id)} />
                                    </label>
                                  )}
                                </div>
                                <div className="flex-1 grid grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs">{language === 'he' ? 'שם' : 'Name'}</Label>
                                    <Input
                                      value={formData.name}
                                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">{language === 'he' ? 'תפקיד (עברית)' : 'Role (HE)'}</Label>
                                    <Input
                                      value={formData.role}
                                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                                      className="h-9"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">{language === 'he' ? 'תפקיד (אנגלית)' : 'Role (EN)'}</Label>
                                    <Input
                                      value={formData.role_en}
                                      onChange={(e) => setFormData(prev => ({ ...prev, role_en: e.target.value }))}
                                      className="h-9"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
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
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{member.name}</h4>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="icon" onClick={() => startEditing(member)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => deleteMutation.mutate(member.id)}
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
