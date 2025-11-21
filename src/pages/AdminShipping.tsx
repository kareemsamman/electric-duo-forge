import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Pencil, Trash2, GripVertical, ArrowRight, ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ShippingMethod {
  id: string;
  name: string;
  name_en: string | null;
  region: string;
  price: number;
  is_active: boolean;
}

export default function AdminShipping() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    region: '',
    price: 0,
    is_active: true
  });

  const { data: shippingMethods, isLoading } = useQuery({
    queryKey: ['shipping-methods-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipping_methods')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as ShippingMethod[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('shipping_methods').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods-admin'] });
      toast.success('שיטת משלוח נוספה בהצלחה');
      setIsAdding(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShippingMethod> }) => {
      const { error } = await supabase.from('shipping_methods').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods-admin'] });
      toast.success('שיטת משלוח עודכנה בהצלחה');
      setEditingId(null);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shipping_methods').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods-admin'] });
      toast.success('שיטת משלוח נמחקה בהצלחה');
    }
  });

  const resetForm = () => {
    setFormData({ name: '', name_en: '', region: '', price: 0, is_active: true });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !shippingMethods) return;
    const items = Array.from(shippingMethods);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    queryClient.setQueryData(['shipping-methods-admin'], items.map((item, index) => ({ ...item, display_order: index })));

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      await supabase.from('shipping_methods').update({ display_order: index }).eq('id', item.id);
    }
    toast.success('סדר שיטות המשלוח עודכן');
  };

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
            <h1 className="text-4xl font-bold mb-2">ניהול שיטות משלוח</h1>
            <p className="text-muted-foreground">גרור לסידור מחדש, לחץ לעריכה</p>
          </div>
          <Button onClick={() => { setIsAdding(true); resetForm(); }} disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 ml-2" />הוסף שיטת משלוח
          </Button>
        </div>

        {isAdding && (
          <Card className="p-6 mb-4 border-2 border-primary">
            <h3 className="text-lg font-semibold mb-4">שיטת משלוח חדשה</h3>
            <div className="grid gap-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>שם (עברית)</Label>
                  <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                </div>
                <div>
                  <Label>שם (English)</Label>
                  <Input value={formData.name_en} onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>אזור</Label>
                  <Input value={formData.region} onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))} />
                </div>
                <div>
                  <Label>מחיר (₪)</Label>
                  <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
                <Label>פעיל</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={!formData.name || !formData.region}>
                  <Save className="w-4 h-4 ml-2" />שמור
                </Button>
                <Button variant="outline" onClick={() => { setIsAdding(false); resetForm(); }}>
                  <X className="w-4 h-4 ml-2" />ביטול
                </Button>
              </div>
            </div>
          </Card>
        )}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="shipping">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {shippingMethods?.map((method, index) => (
                  <Draggable key={method.id} draggableId={method.id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-6 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary' : 'hover:shadow-lg'}`}
                      >
                        {editingId === method.id ? (
                          <div className="grid gap-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <Label>שם (עברית)</Label>
                                <Input value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                              </div>
                              <div>
                                <Label>שם (English)</Label>
                                <Input value={formData.name_en} onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))} />
                              </div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <Label>אזור</Label>
                                <Input value={formData.region} onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))} />
                              </div>
                              <div>
                                <Label>מחיר (₪)</Label>
                                <Input type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))} />
                              <Label>פעיל</Label>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleSave} size="sm"><Save className="w-4 h-4 ml-2" />שמור</Button>
                              <Button variant="outline" onClick={() => { setEditingId(null); resetForm(); }} size="sm"><X className="w-4 h-4 ml-2" />ביטול</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{method.name}</h3>
                                {!method.is_active && <span className="text-xs bg-muted px-2 py-1 rounded">לא פעיל</span>}
                              </div>
                              <div className="text-sm text-muted-foreground space-x-3">
                                <span>אזור: {method.region}</span>
                                <span className="font-semibold text-foreground">₪{method.price}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingId(method.id);
                                  setFormData({
                                    name: method.name,
                                    name_en: method.name_en || '',
                                    region: method.region,
                                    price: method.price,
                                    is_active: method.is_active
                                  });
                                }}
                                disabled={editingId !== null || isAdding}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => { if (confirm('האם למחוק שיטת משלוח זו?')) deleteMutation.mutate(method.id); }}
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
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {isLoading && <div className="text-center py-12">טוען...</div>}
        {!isLoading && shippingMethods?.length === 0 && <div className="text-center py-12 text-muted-foreground">אין שיטות משלוח. הוסף את השיטה הראשונה!</div>}
      </div>
    </div>
  );
}
