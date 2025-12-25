import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Save, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminSettings() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    admin_email: '',
    gmail_email: '',
    gmail_app_password: '',
  });

  // Fetch current settings
  const { data: currentSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .in('key', ['admin_email', 'gmail_email', 'gmail_app_password']);
      
      if (error) throw error;
      
      const settingsMap: Record<string, string> = {};
      data?.forEach(item => {
        settingsMap[item.key] = item.value_he;
      });
      
      setSettings({
        admin_email: settingsMap.admin_email || '',
        gmail_email: settingsMap.gmail_email || '',
        gmail_app_password: settingsMap.gmail_app_password || '',
      });
      
      return settingsMap;
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'admin_email', section: 'settings', value_he: settings.admin_email, value_en: settings.admin_email },
        { key: 'gmail_email', section: 'settings', value_he: settings.gmail_email, value_en: settings.gmail_email },
        { key: 'gmail_app_password', section: 'settings', value_he: settings.gmail_app_password, value_en: settings.gmail_app_password },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('site_content')
          .upsert(setting, { onConflict: 'key' });
        if (error) throw error;
      }

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
            {language === 'he' ? 'עדכון הגדרות אימייל' : 'Update email settings'}
          </p>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>{language === 'he' ? 'הגדרות אימייל' : 'Email Settings'}</AlertTitle>
          <AlertDescription>
            {language === 'he' 
              ? 'הגדר את כתובת האימייל לקבלת התראות על הזמנות חדשות.'
              : 'Configure the email address to receive notifications for new orders.'}
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{language === 'he' ? 'הגדרות כלליות' : 'General Settings'}</CardTitle>
            <CardDescription>
              {language === 'he' 
                ? 'הגדר את כתובת האימייל של המנהל'
                : 'Configure admin email address'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin_email">
                {language === 'he' ? 'אימייל מנהל (לקבלת הודעות)' : 'Admin Email (for notifications)'}
              </Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings(prev => ({ ...prev, admin_email: e.target.value }))}
                placeholder="admin@example.com"
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'כתובת זו תקבל התראות על הזמנות חדשות'
                  : 'This address will receive notifications for new orders'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gmail_email">
                {language === 'he' ? 'כתובת Gmail לשליחה' : 'Gmail Address for Sending'}
              </Label>
              <Input
                id="gmail_email"
                type="email"
                value={settings.gmail_email}
                onChange={(e) => setSettings(prev => ({ ...prev, gmail_email: e.target.value }))}
                placeholder="your-email@gmail.com"
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'כתובת Gmail ממנה יישלחו האימיילים'
                  : 'Gmail address from which emails will be sent'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gmail_app_password">
                {language === 'he' ? 'סיסמת אפליקציה של Gmail' : 'Gmail App Password'}
              </Label>
              <Input
                id="gmail_app_password"
                type="password"
                value={settings.gmail_app_password}
                onChange={(e) => setSettings(prev => ({ ...prev, gmail_app_password: e.target.value }))}
                placeholder="xxxx xxxx xxxx xxxx"
                dir="ltr"
              />
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'צור סיסמת אפליקציה בהגדרות האבטחה של Google'
                  : 'Create an app password in Google security settings'}
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
