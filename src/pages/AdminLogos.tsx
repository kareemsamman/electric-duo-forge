import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, ArrowRight, ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ClientLogo {
  id: string;
  logo_image: string;
  company_name: string;
  company_name_en: string | null;
  display_order: number | null;
}

export default function AdminLogos() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const { data: logos, isLoading } = useQuery({
    queryKey: ['client-logos-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_logos')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as ClientLogo[];
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('client-logos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('client-logos').getPublicUrl(fileName);
      const nextOrder = (logos?.length || 0);

      const { error } = await supabase.from('client_logos').insert({
        logo_image: urlData.publicUrl,
        company_name: 'לקוח חדש',
        company_name_en: 'New Client',
        display_order: nextOrder
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-logos-admin'] });
      toast.success('לוגו הועלה בהצלחה');
    }
  });

  const updateNameMutation = useMutation({
    mutationFn: async ({ id, name_he, name_en }: { id: string; name_he: string; name_en: string }) => {
      const { error } = await supabase
        .from('client_logos')
        .update({ company_name: name_he, company_name_en: name_en })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-logos-admin'] });
      toast.success('שם עודכן בהצלחה');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_logos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-logos-admin'] });
      toast.success('לוגו נמחק בהצלחה');
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await uploadMutation.mutateAsync(file);
    setUploading(false);
    e.target.value = '';
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !logos) return;
    const items = Array.from(logos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({ id: item.id, display_order: index }));
    queryClient.setQueryData(['client-logos-admin'], items.map((item, index) => ({ ...item, display_order: index })));

    for (const update of updates) {
      await supabase.from('client_logos').update({ display_order: update.display_order }).eq('id', update.id);
    }
    toast.success('סדר הלוגואים עודכן');
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
            <h1 className="text-4xl font-bold mb-2">ניהול לוגואי לקוחות</h1>
            <p className="text-muted-foreground">גרור לסידור מחדש, ערוך שמות</p>
          </div>
          <div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button asChild disabled={uploading}>
              <label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="w-4 h-4 ml-2" />
                {uploading ? 'מעלה...' : 'העלה לוגו חדש'}
              </label>
            </Button>
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="logos">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logos?.map((logo, index) => (
                  <Draggable key={logo.id} draggableId={logo.id} index={index}>
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
                          <img src={logo.logo_image} alt={logo.company_name} className="w-24 h-16 object-contain bg-white rounded border p-2" />
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="שם החברה (עברית)"
                              defaultValue={logo.company_name}
                              onBlur={(e) => updateNameMutation.mutate({ 
                                id: logo.id, 
                                name_he: e.target.value, 
                                name_en: logo.company_name_en || '' 
                              })}
                            />
                            <Input
                              placeholder="Company Name (English)"
                              defaultValue={logo.company_name_en || ''}
                              onBlur={(e) => updateNameMutation.mutate({ 
                                id: logo.id, 
                                name_he: logo.company_name, 
                                name_en: e.target.value 
                              })}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              if (confirm('למחוק לוגו זה?')) {
                                deleteMutation.mutate(logo.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
        {!isLoading && logos?.length === 0 && <div className="text-center py-12 text-muted-foreground">אין לוגואים. העלה את הלוגו הראשון!</div>}
      </div>
    </div>
  );
}
