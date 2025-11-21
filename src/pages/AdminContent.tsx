import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContentItem {
  id: string;
  key: string;
  value_he: string;
  value_en: string | null;
  section: string;
  description: string | null;
}

export default function AdminContent() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: content, isLoading } = useQuery({
    queryKey: ['site-content-admin'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_content').select('*').order('section', { ascending: true });
      if (error) throw error;
      return data as ContentItem[];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, value_he, value_en }: { id: string; value_he: string; value_en: string }) => {
      const { error } = await supabase.from('site_content').update({ value_he, value_en }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-content-admin'] });
      toast.success('תוכן עודכן בהצלחה');
    }
  });

  const groupedContent = content?.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const [editingValues, setEditingValues] = useState<Record<string, { he: string; en: string }>>({});

  const handleSave = (item: ContentItem) => {
    const values = editingValues[item.id] || { he: item.value_he, en: item.value_en || '' };
    updateMutation.mutate({ id: item.id, value_he: values.he, value_en: values.en });
  };

  const handleChange = (id: string, lang: 'he' | 'en', value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [id]: { ...prev[id], [lang]: value }
    }));
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ניהול תוכן האתר</h1>
          <p className="text-muted-foreground">ערוך טקסטים בעברית ובאנגלית</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">טוען...</div>
        ) : (
          <Tabs defaultValue={Object.keys(groupedContent || {})[0]} className="space-y-6">
            <TabsList className="flex flex-wrap gap-2 bg-background border rounded-full p-1 shadow-sm overflow-x-auto">
              {Object.keys(groupedContent || {}).map(section => (
                <TabsTrigger key={section} value={section} className="px-4 py-1 rounded-full text-sm capitalize">
                  {section}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedContent || {}).map(([section, items]) => (
              <TabsContent key={section} value={section} className="space-y-4">
                {items.map(item => {
                  const currentHe = editingValues[item.id]?.he ?? item.value_he;
                  const currentEn = editingValues[item.id]?.en ?? item.value_en ?? '';
                  const isLong = currentHe.length > 100 || currentEn.length > 100;

                  return (
                    <Card key={item.id} className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{item.key}</h3>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <Button size="sm" onClick={() => handleSave(item)} disabled={updateMutation.isPending}>
                            <Save className="w-4 h-4 ml-2" />
                            שמור
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>עברית</Label>
                            {isLong ? (
                              <Textarea
                                value={currentHe}
                                onChange={(e) => handleChange(item.id, 'he', e.target.value)}
                                rows={5}
                                className="font-medium"
                              />
                            ) : (
                              <Input
                                value={currentHe}
                                onChange={(e) => handleChange(item.id, 'he', e.target.value)}
                                className="font-medium"
                              />
                            )}
                          </div>
                          <div>
                            <Label>English</Label>
                            {isLong ? (
                              <Textarea
                                value={currentEn}
                                onChange={(e) => handleChange(item.id, 'en', e.target.value)}
                                rows={5}
                                className="font-medium"
                              />
                            ) : (
                              <Input
                                value={currentEn}
                                onChange={(e) => handleChange(item.id, 'en', e.target.value)}
                                className="font-medium"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
