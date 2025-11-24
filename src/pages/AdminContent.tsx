import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ArrowRight, ArrowLeft, Upload, ImageIcon, Video } from 'lucide-react';
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

  const handleFileUpload = async (file: File, key: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `hero/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const contentItem = content?.find(item => item.key === key);
      if (contentItem) {
        await updateMutation.mutateAsync({
          id: contentItem.id,
          value_he: publicUrl,
          value_en: publicUrl
        });
      }

      toast.success('קובץ הועלה בהצלחה');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('שגיאה בהעלאת הקובץ');
    }
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

                  // Special handling for hero background fields
                  const isBackgroundType = item.key === 'hero.background_type';
                  const isVideoUrl = item.key === 'hero.video_url';
                  const isImageUrl = item.key === 'hero.image_desktop_url' || item.key === 'hero.image_mobile_url';

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

                        {isBackgroundType ? (
                          <div>
                            <Label>סוג רקע</Label>
                            <Select value={currentHe} onValueChange={(value) => handleChange(item.id, 'he', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4" />
                                    וידאו
                                  </div>
                                </SelectItem>
                                <SelectItem value="image">
                                  <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    תמונה
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (isVideoUrl || isImageUrl) ? (
                          <div className="space-y-3">
                            <div>
                              <Label>העלאת קובץ</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = isVideoUrl ? 'video/*' : 'image/*';
                                    input.onchange = (e) => {
                                      const file = (e.target as HTMLInputElement).files?.[0];
                                      if (file) handleFileUpload(file, item.key);
                                    };
                                    input.click();
                                  }}
                                >
                                  <Upload className="w-4 h-4 ml-2" />
                                  {isVideoUrl ? 'העלה וידאו' : 'העלה תמונה'}
                                </Button>
                              </div>
                            </div>
                            <div>
                              <Label>או הזן URL</Label>
                              <Input
                                value={currentHe}
                                onChange={(e) => handleChange(item.id, 'he', e.target.value)}
                                placeholder="https://..."
                                className="font-medium"
                              />
                            </div>
                            {currentHe && (
                              <div className="mt-2 p-2 border rounded-lg">
                                {isVideoUrl ? (
                                  <video src={currentHe} className="w-full h-32 object-cover rounded" controls />
                                ) : (
                                  <img src={currentHe} alt="Preview" className="w-full h-32 object-cover rounded" />
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
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
                        )}
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
