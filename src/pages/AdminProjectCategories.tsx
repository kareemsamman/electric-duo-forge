import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, ArrowRight, Tag, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';

interface CategoryFormData {
  name_he: string;
  name_en: string;
  display_order: number;
}

export default function AdminProjectCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [assigningCategory, setAssigningCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name_he: '',
    name_en: '',
    display_order: 0,
  });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: categories, isLoading } = useQuery({
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

  const { data: projects } = useQuery({
    queryKey: ['admin-projects-for-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, project_name, project_name_en')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ['admin-category-assignments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_category_assignments')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      if (editingCategory) {
        const { error } = await supabase
          .from('project_categories')
          .update(data)
          .eq('id', editingCategory.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_categories')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-categories'] });
      setIsDialogOpen(false);
      setEditingCategory(null);
      toast.success(editingCategory ? 'קטגוריה עודכנה' : 'קטגוריה נוצרה');
    },
    onError: () => toast.error('שגיאה בשמירה'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('project_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-project-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-category-assignments'] });
      toast.success('קטגוריה נמחקה');
    },
    onError: () => toast.error('שגיאה במחיקה'),
  });

  const toggleAssignment = useMutation({
    mutationFn: async ({ projectId, categoryId, isAssigned }: { projectId: string; categoryId: string; isAssigned: boolean }) => {
      if (isAssigned) {
        const { error } = await supabase
          .from('project_category_assignments')
          .delete()
          .eq('project_id', projectId)
          .eq('category_id', categoryId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_category_assignments')
          .insert({ project_id: projectId, category_id: categoryId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-category-assignments'] });
    },
    onError: () => toast.error('שגיאה בעדכון'),
  });

  const openCreate = () => {
    setEditingCategory(null);
    setFormData({ name_he: '', name_en: '', display_order: 0 });
    setIsDialogOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditingCategory(cat);
    setFormData({
      name_he: cat.name_he,
      name_en: cat.name_en || '',
      display_order: cat.display_order || 0,
    });
    setIsDialogOpen(true);
  };

  const openAssign = (cat: any) => {
    setAssigningCategory(cat);
    setIsAssignDialogOpen(true);
  };

  const isProjectAssigned = (projectId: string, categoryId: string) => {
    return assignments?.some((a) => a.project_id === projectId && a.category_id === categoryId) ?? false;
  };

  const getAssignedCount = (categoryId: string) => {
    return assignments?.filter((a) => a.category_id === categoryId).length ?? 0;
  };

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">ניהול קטגוריות פרויקטים</h1>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 ml-2" />
            קטגוריה חדשה
          </Button>
        </div>

        {isLoading && <p className="text-center text-muted-foreground">טוען...</p>}

        <div className="grid gap-4">
          {categories?.map((cat) => (
            <Card key={cat.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{cat.name_he}</p>
                  {cat.name_en && <p className="text-sm text-muted-foreground">{cat.name_en}</p>}
                  <p className="text-xs text-muted-foreground">{getAssignedCount(cat.id)} פרויקטים</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openAssign(cat)}>
                  <Link2 className="h-4 w-4 ml-1" />
                  שייך פרויקטים
                </Button>
                <Button variant="outline" size="icon" onClick={() => openEdit(cat)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    if (confirm('למחוק קטגוריה זו?')) deleteMutation.mutate(cat.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>שם (עברית)</Label>
                <Input
                  value={formData.name_he}
                  onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                />
              </div>
              <div>
                <Label>Name (English)</Label>
                <Input
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div>
                <Label>סדר תצוגה</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => saveMutation.mutate(formData)}
                disabled={!formData.name_he || saveMutation.isPending}
              >
                {saveMutation.isPending ? 'שומר...' : 'שמור'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Assign Projects Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent dir="rtl" className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>שייך פרויקטים ל: {assigningCategory?.name_he}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {projects?.map((project) => {
                const assigned = assigningCategory ? isProjectAssigned(project.id, assigningCategory.id) : false;
                return (
                  <label
                    key={project.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={assigned}
                      onCheckedChange={() => {
                        if (assigningCategory) {
                          toggleAssignment.mutate({
                            projectId: project.id,
                            categoryId: assigningCategory.id,
                            isAssigned: assigned,
                          });
                        }
                      }}
                    />
                    <span className="font-medium">{project.project_name}</span>
                    {project.project_name_en && (
                      <span className="text-sm text-muted-foreground">({project.project_name_en})</span>
                    )}
                  </label>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
