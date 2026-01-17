import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, Save, Info, Upload, Globe, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminSettings() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  const [settings, setSettings] = useState({
    admin_email: '',
    gmail_email: '',
    gmail_app_password: '',
    site_title: '',
    site_title_en: '',
    meta_description: '',
    meta_description_en: '',
    favicon_url: '',
  });

  // Fetch current settings
  const { data: currentSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .in('key', [
          'admin_email', 
          'gmail_email', 
          'gmail_app_password',
          'site_title',
          'meta_description',
          'favicon_url'
        ]);
      
      if (error) throw error;
      
      const settingsMap: Record<string, { he: string; en: string }> = {};
      data?.forEach(item => {
        settingsMap[item.key] = { 
          he: item.value_he, 
          en: item.value_en || '' 
        };
      });
      
      setSettings({
        admin_email: settingsMap.admin_email?.he || '',
        gmail_email: settingsMap.gmail_email?.he || '',
        gmail_app_password: settingsMap.gmail_app_password?.he || '',
        site_title: settingsMap.site_title?.he || '',
        site_title_en: settingsMap.site_title?.en || '',
        meta_description: settingsMap.meta_description?.he || '',
        meta_description_en: settingsMap.meta_description?.en || '',
        favicon_url: settingsMap.favicon_url?.he || '',
      });
      
      return settingsMap;
    }
  });

  // Update document title and meta dynamically
  useEffect(() => {
    if (settings.site_title || settings.site_title_en) {
      const title = language === 'he' 
        ? settings.site_title || settings.site_title_en 
        : settings.site_title_en || settings.site_title;
      if (title) document.title = title;
    }
    
    if (settings.meta_description || settings.meta_description_en) {
      const desc = language === 'he' 
        ? settings.meta_description || settings.meta_description_en 
        : settings.meta_description_en || settings.meta_description;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && desc) metaDesc.setAttribute('content', desc);
    }

    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }
  }, [settings, language]);

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFavicon(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `favicon-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName);

      setSettings(prev => ({ ...prev, favicon_url: publicUrl }));
      toast.success(language === 'he' ? 'הפביקון הועלה בהצלחה' : 'Favicon uploaded successfully');
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast.error(language === 'he' ? 'שגיאה בהעלאת הפביקון' : 'Error uploading favicon');
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'admin_email', section: 'settings', value_he: settings.admin_email, value_en: settings.admin_email },
        { key: 'gmail_email', section: 'settings', value_he: settings.gmail_email, value_en: settings.gmail_email },
        { key: 'gmail_app_password', section: 'settings', value_he: settings.gmail_app_password, value_en: settings.gmail_app_password },
        { key: 'site_title', section: 'seo', value_he: settings.site_title, value_en: settings.site_title_en },
        { key: 'meta_description', section: 'seo', value_he: settings.meta_description, value_en: settings.meta_description_en },
        { key: 'favicon_url', section: 'seo', value_he: settings.favicon_url, value_en: settings.favicon_url },
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
            {language === 'he' ? 'עדכון הגדרות אימייל ו-SEO' : 'Update email and SEO settings'}
          </p>
        </div>

        {/* SEO Settings Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {language === 'he' ? 'הגדרות SEO' : 'SEO Settings'}
            </CardTitle>
            <CardDescription>
              {language === 'he' 
                ? 'הגדר את כותרת האתר, תיאור ופביקון'
                : 'Configure site title, description and favicon'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Favicon */}
            <div className="space-y-2">
              <Label>{language === 'he' ? 'פביקון (אייקון האתר)' : 'Favicon (Site Icon)'}</Label>
              <div className="flex items-center gap-4">
                {settings.favicon_url && (
                  <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted overflow-hidden">
                    <img 
                      src={settings.favicon_url} 
                      alt="Favicon" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*,.ico"
                    onChange={handleFaviconUpload}
                    disabled={isUploadingFavicon}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <Label htmlFor="favicon-upload" className="cursor-pointer">
                    <Button 
                      variant="outline" 
                      disabled={isUploadingFavicon}
                      asChild
                    >
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploadingFavicon 
                          ? (language === 'he' ? 'מעלה...' : 'Uploading...') 
                          : (language === 'he' ? 'העלה פביקון' : 'Upload Favicon')}
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? 'מומלץ להעלות תמונה בגודל 32x32 או 64x64 פיקסלים'
                  : 'Recommended size: 32x32 or 64x64 pixels'}
              </p>
            </div>

            {/* Site Title Hebrew */}
            <div className="space-y-2">
              <Label htmlFor="site_title">
                {language === 'he' ? 'כותרת האתר (עברית)' : 'Site Title (Hebrew)'}
              </Label>
              <Input
                id="site_title"
                value={settings.site_title}
                onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                placeholder="גלובל אלקטריק - הנדסת חשמל"
                dir="rtl"
              />
            </div>

            {/* Site Title English */}
            <div className="space-y-2">
              <Label htmlFor="site_title_en">
                {language === 'he' ? 'כותרת האתר (אנגלית)' : 'Site Title (English)'}
              </Label>
              <Input
                id="site_title_en"
                value={settings.site_title_en}
                onChange={(e) => setSettings(prev => ({ ...prev, site_title_en: e.target.value }))}
                placeholder="Global Electric - Electrical Engineering"
                dir="ltr"
              />
            </div>

            {/* Meta Description Hebrew */}
            <div className="space-y-2">
              <Label htmlFor="meta_description">
                {language === 'he' ? 'תיאור האתר (עברית)' : 'Meta Description (Hebrew)'}
              </Label>
              <Textarea
                id="meta_description"
                value={settings.meta_description}
                onChange={(e) => setSettings(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="תיאור קצר של האתר לתוצאות החיפוש..."
                dir="rtl"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? `${settings.meta_description.length}/160 תווים (מומלץ עד 160)`
                  : `${settings.meta_description.length}/160 characters (recommended max 160)`}
              </p>
            </div>

            {/* Meta Description English */}
            <div className="space-y-2">
              <Label htmlFor="meta_description_en">
                {language === 'he' ? 'תיאור האתר (אנגלית)' : 'Meta Description (English)'}
              </Label>
              <Textarea
                id="meta_description_en"
                value={settings.meta_description_en}
                onChange={(e) => setSettings(prev => ({ ...prev, meta_description_en: e.target.value }))}
                placeholder="Short description for search results..."
                dir="ltr"
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                {language === 'he' 
                  ? `${settings.meta_description_en.length}/160 תווים (מומלץ עד 160)`
                  : `${settings.meta_description_en.length}/160 characters (recommended max 160)`}
              </p>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle>{language === 'he' ? 'הגדרות אימייל' : 'Email Settings'}</CardTitle>
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
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
            size="lg"
          >
            {isSaving ? (
              <>
                <Save className="ml-2 h-4 w-4 animate-spin" />
                {language === 'he' ? 'שומר...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                {language === 'he' ? 'שמור כל ההגדרות' : 'Save All Settings'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}