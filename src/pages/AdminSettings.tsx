import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export default function AdminSettings() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    admin_email: '',
    grow_api_key: ''
  });

  // Fetch current settings
  const { data: currentSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .in('key', ['admin_email', 'grow_api_key']);
      
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value_he;
      });
      
      setSettings({
        admin_email: settingsMap.admin_email || '',
        grow_api_key: settingsMap.grow_api_key || ''
      });
      
      return settingsMap;
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update or insert admin_email
      const { error: emailError } = await supabase
        .from('site_content')
        .upsert({
          key: 'admin_email',
          section: 'settings',
          value_he: settings.admin_email,
          value_en: settings.admin_email
        }, { onConflict: 'key' });

      if (emailError) throw emailError;

      // Update or insert grow_api_key
      const { error: apiError } = await supabase
        .from('site_content')
        .upsert({
          key: 'grow_api_key',
          section: 'settings',
          value_he: settings.grow_api_key,
          value_en: settings.grow_api_key
        }, { onConflict: 'key' });

      if (apiError) throw apiError;

      toast.success(language === 'he' ? 'ההגדרות נשמרו בהצלחה' : 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(language === 'he' ? 'שגיאה בשמירת ההגדרות' : 'Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="mb-4"
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
          <h1 className="text-4xl font-bold mb-2">
            {language === 'he' ? 'הגדרות מערכת' : 'System Settings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'he' ? 'עדכון הגדרות אימייל ו-API' : 'Update email and API settings'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'he' ? 'הגדרות כלליות' : 'General Settings'}</CardTitle>
            <CardDescription>
              {language === 'he' 
                ? 'הגדר את כתובת האימייל של המנהל ומפתח API של Grow'
                : 'Configure admin email and Grow API key'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin_email">
                {language === 'he' ? 'אימייל מנהל' : 'Admin Email'}
              </Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings(prev => ({ ...prev, admin_email: e.target.value }))}
                placeholder={language === 'he' ? 'admin@example.com' : 'admin@example.com'}
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'כתובת זו תקבל התראות על הזמנות חדשות'
                  : 'This address will receive notifications for new orders'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grow_api_key">
                {language === 'he' ? 'מפתח API של Grow' : 'Grow API Key'}
              </Label>
              <Input
                id="grow_api_key"
                type="password"
                value={settings.grow_api_key}
                onChange={(e) => setSettings(prev => ({ ...prev, grow_api_key: e.target.value }))}
                placeholder="••••••••••••••••"
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'מפתח API לעיבוד תשלומים בכרטיס אשראי'
                  : 'API key for processing credit card payments'}
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Save className="ml-2 h-4 w-4 animate-spin" />
                  {language === 'he' ? 'שומר...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  {language === 'he' ? 'שמור הגדרות' : 'Save Settings'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
