import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Truck, Plus, Pencil, Trash2, Save, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

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
        .order('region', { ascending: true });
      
      if (error) throw error;
      return data as ShippingMethod[];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('shipping_methods')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods-admin'] });
      toast.success('שיטת משלוח נוספה בהצלחה');
      setIsAdding(false);
      resetForm();
    },
    onError: () => {
      toast.error('שגיאה בהוספת שיטת משלוח');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ShippingMethod> }) => {
      const { error } = await supabase
        .from('shipping_methods')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods-admin'] });
      toast.success('שיטת משלוח עודכנה בהצלחה');
      setEditingId(null);
      resetForm();
    },
    onError: () => {
      toast.error('שגיאה בעדכון שיטת משלוח');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shipping_methods')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-methods-admin'] });
      toast.success('שיטת משלוח נמחקה בהצלחה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת שיטת משלוח');
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      name_en: '',
      region: '',
      price: 0,
      is_active: true
    });
  };

  const handleEdit = (method: ShippingMethod) => {
    setEditingId(method.id);
    setFormData({
      name: method.name,
      name_en: method.name_en || '',
      region: method.region,
      price: method.price,
      is_active: method.is_active
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">טוען...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 pt-28">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="mb-6"
        >
          {language === 'he' ? (
            <>
              <ArrowRight className="ml-2 h-4 w-4" />
              חזרה ללוח הבקרה
            </>
          ) : (
            <>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </>
          )}
        </Button>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8" />
            <h1 className="text-3xl font-bold">ניהול שיטות משלוח</h1>
          </div>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 ml-2" />
            הוסף שיטת משלוח
          </Button>
        </div>

        <div className="space-y-4">
          {/* Add New Form */}
          {isAdding && (
            <Card className="p-6 border-2 border-primary">
              <h3 className="text-lg font-semibold mb-4">שיטת משלוח חדשה</h3>
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">שם (עברית)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="למשל: משלוח לירושלים"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_en">שם (אנגלית)</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="e.g., Jerusalem Delivery"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region">אזור (באנגלית)</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      placeholder="jerusalem, west_bank, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">מחיר (₪)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>פעיל</Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={!formData.name || !formData.region}>
                    <Save className="w-4 h-4 ml-2" />
                    שמור
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 ml-2" />
                    ביטול
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Existing Methods */}
          {shippingMethods?.map((method) => (
            <Card key={method.id} className="p-6">
              {editingId === method.id ? (
                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${method.id}`}>שם (עברית)</Label>
                      <Input
                        id={`name-${method.id}`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`name_en-${method.id}`}>שם (אנגלית)</Label>
                      <Input
                        id={`name_en-${method.id}`}
                        value={formData.name_en}
                        onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`region-${method.id}`}>אזור</Label>
                      <Input
                        id={`region-${method.id}`}
                        value={formData.region}
                        onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`price-${method.id}`}>מחיר (₪)</Label>
                      <Input
                        id={`price-${method.id}`}
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>פעיל</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 ml-2" />
                      שמור
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      <X className="w-4 h-4 ml-2" />
                      ביטול
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{method.name}</h3>
                      {!method.is_active && (
                        <span className="text-xs bg-muted px-2 py-1 rounded">לא פעיל</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>אנגלית: {method.name_en || '-'}</p>
                      <p>אזור: {method.region}</p>
                      <p className="font-semibold text-foreground">מחיר: ₪{method.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(method)}
                      disabled={editingId !== null || isAdding}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        if (confirm('האם למחוק שיטת משלוח זו?')) {
                          deleteMutation.mutate(method.id);
                        }
                      }}
                      disabled={editingId !== null || isAdding}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
