import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "./LanguageContext";

interface ContentItem {
  key: string;
  value_he: string;
  value_en: string | null;
  section: string;
  description: string | null;
}

interface ContentContextType {
  content: Record<string, string>;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const { language } = useLanguage();
  const [contentData, setContentData] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("site_content")
        .select("*");

      if (fetchError) throw fetchError;

      setContentData(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Convert content array to key-value object based on current language
  const content = contentData.reduce((acc, item) => {
    const value = language === "he" ? item.value_he : (item.value_en || item.value_he);
    acc[item.key] = value;
    return acc;
  }, {} as Record<string, string>);

  const refreshContent = async () => {
    await fetchContent();
  };

  return (
    <ContentContext.Provider value={{ content, loading, error, refreshContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
