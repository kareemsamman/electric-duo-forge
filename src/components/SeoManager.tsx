import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SeoManager() {
  const { language } = useLanguage();

  const { data: seoSettings } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, value_he, value_en')
        .in('key', ['site_title', 'meta_description', 'favicon_url', 'og_image_url']);

      if (error) throw error;

      const map: Record<string, { he: string; en: string }> = {};
      data?.forEach(item => {
        map[item.key] = { he: item.value_he, en: item.value_en || '' };
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!seoSettings) return;

    // Title
    const titleData = seoSettings.site_title;
    if (titleData) {
      const title = language === 'he'
        ? titleData.he || titleData.en
        : titleData.en || titleData.he;
      if (title) document.title = title;
    }

    // Meta description
    const descData = seoSettings.meta_description;
    if (descData) {
      const desc = language === 'he'
        ? descData.he || descData.en
        : descData.en || descData.he;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && desc) metaDesc.setAttribute('content', desc);
    }

    // Favicon
    const faviconUrl = seoSettings.favicon_url?.he;
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }

    // OG Image
    const ogUrl = seoSettings.og_image_url?.he;
    if (ogUrl) {
      let ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute('content', ogUrl);
    }
  }, [seoSettings, language]);

  return null;
}
