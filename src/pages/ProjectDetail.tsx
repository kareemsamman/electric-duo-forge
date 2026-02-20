import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft, MapPin, Loader2, ChevronLeft, ChevronRight, Play, Zap, X } from "lucide-react";
import { parseRichContent } from "@/lib/richContentParser";
import { motion } from "framer-motion";

type Project = {
  id: string;
  project_name: string;
  project_name_en?: string | null;
  description: string;
  description_en?: string | null;
  location?: string | null;
  location_en?: string | null;
  tags?: string[];
  tags_en?: string[] | null;
  image: string;
  images?: string[] | null;
  video_url?: string | null;
  panel_name?: string | null;
  panel_name_en?: string | null;
  panel_current?: string | null;
  rich_content?: string | null;
  rich_content_en?: string | null;
  has_multiple_panels?: boolean;
  created_at: string;
};

type ProjectPanel = {
  id: string;
  panel_name: string;
  panel_name_en?: string | null;
  panel_current?: string | null;
  image?: string | null;
  images?: string[] | null;
  display_order: number;
};

const getImageUrl = (imagePath: string) => {
  try {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/projects/")) {
      const fileName = imagePath.replace("/projects/", "");
      return new URL(`../assets/projects/${fileName}`, import.meta.url).href;
    }
    if (imagePath.startsWith("/src/assets/")) {
      const relativePath = imagePath.replace("/src/", "../");
      return new URL(relativePath, import.meta.url).href;
    }
    return imagePath;
  } catch (error) {
    console.error("Error loading image:", imagePath, error);
    return imagePath;
  }
};

const getYoutubeEmbedUrl = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&?\s]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const isHebrew = language === "he";
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [richContentGallery, setRichContentGallery] = useState<string[] | null>(null);
  const [richContentImageIndex, setRichContentImageIndex] = useState<number | null>(null);
  const [selectedPanelIndex, setSelectedPanelIndex] = useState(0);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Project;
    },
    enabled: !!id,
  });

  const { data: panels } = useQuery({
    queryKey: ["project-panels", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_panels")
        .select("*")
        .eq("project_id", id)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as ProjectPanel[];
    },
    enabled: !!id && !!project?.has_multiple_panels,
  });

  // Handle clicks on rich content images - MUST be before early returns
  const handleRichContentClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('rich-content-image')) {
      const galleryUrls = target.getAttribute('data-gallery-urls');
      const index = parseInt(target.getAttribute('data-index') || '0', 10);
      if (galleryUrls) {
        try {
          const urls = JSON.parse(galleryUrls.replace(/&quot;/g, '"'));
          setRichContentGallery(urls);
          setRichContentImageIndex(index);
        } catch (err) {
          console.error('Failed to parse gallery urls', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleRichContentClick);
    return () => document.removeEventListener('click', handleRichContentClick);
  }, [handleRichContentClick]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background" dir={isHebrew ? "rtl" : "ltr"}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold mb-4">
            {isHebrew ? "הפרויקט לא נמצא" : "Project not found"}
          </h1>
          <Button asChild>
            <Link to="/projects">
              {isHebrew ? <ArrowRight className="ml-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
              {isHebrew ? "חזרה לפרויקטים" : "Back to Projects"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const title = isHebrew ? project.project_name : project.project_name_en || project.project_name;
  const description = isHebrew ? project.description : project.description_en || project.description;
  const location = isHebrew ? project.location : project.location_en || project.location;
  const tags = isHebrew ? project.tags : project.tags_en || project.tags;
  const richContent = isHebrew ? project.rich_content : project.rich_content_en || project.rich_content;

  // Determine panel info and images based on multi-panel mode
  const hasMultiplePanels = project.has_multiple_panels && panels && panels.length > 0;
  const selectedPanel = hasMultiplePanels ? panels[selectedPanelIndex] : null;
  const panelName = selectedPanel
    ? (isHebrew ? selectedPanel.panel_name : selectedPanel.panel_name_en || selectedPanel.panel_name)
    : (isHebrew ? project.panel_name : project.panel_name_en || project.panel_name);
  const panelCurrent = selectedPanel ? selectedPanel.panel_current : project.panel_current;

  const mainImage = selectedPanel && selectedPanel.image
    ? getImageUrl(selectedPanel.image)
    : getImageUrl(project.image);
  const allImages = selectedPanel
    ? [selectedPanel.image, ...(selectedPanel.images || [])].filter(Boolean).map(getImageUrl)
    : [project.image, ...(project.images || [])].filter(Boolean).map(getImageUrl);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex === 0 ? allImages.length - 1 : selectedImageIndex - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex === allImages.length - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  const navigateRichContentImage = (direction: 'prev' | 'next') => {
    if (richContentImageIndex === null || !richContentGallery) return;
    if (direction === 'prev') {
      setRichContentImageIndex(richContentImageIndex === 0 ? richContentGallery.length - 1 : richContentImageIndex - 1);
    } else {
      setRichContentImageIndex(richContentImageIndex === richContentGallery.length - 1 ? 0 : richContentImageIndex + 1);
    }
  };


  return (
    <div className="min-h-screen pt-32 pb-20 bg-background" dir={isHebrew ? "rtl" : "ltr"}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16 max-w-[1400px]">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Button variant="ghost" asChild>
            <Link to="/projects">
              {isHebrew ? <ArrowRight className="ml-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
              {isHebrew ? "חזרה לפרויקטים" : "Back to Projects"}
            </Link>
          </Button>
        </motion.div>

        {/* Panel tabs */}
        {hasMultiplePanels && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {panels.map((panel, index) => {
                const name = isHebrew ? panel.panel_name : panel.panel_name_en || panel.panel_name;
                return (
                  <button
                    key={panel.id}
                    onClick={() => { setSelectedPanelIndex(index); setSelectedImageIndex(null); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedPanelIndex === index
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Main image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <img
            src={mainImage}
            alt={title}
            loading="eager"
            decoding="async"
            className="w-full h-[400px] md:h-[600px] object-cover rounded-2xl shadow-lg cursor-pointer hover:opacity-95 transition-opacity"
            onClick={() => setSelectedImageIndex(0)}
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Image+Not+Found";
            }}
          />
        </motion.div>

        {/* Image gallery thumbnails */}
        {allImages.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mb-12"
          >
            {allImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${title} ${index + 1}`}
                loading="lazy"
                decoding="async"
                className={`w-full h-20 object-cover rounded-lg cursor-pointer transition-all hover:opacity-80 ${
                  index === 0 ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedImageIndex(index)}
              />
            ))}
          </motion.div>
        )}

        {/* Project info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
              {location && (
                <div className="flex items-center gap-2 text-muted-foreground text-lg mb-6">
                  <MapPin className="h-5 w-5" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {/* Panel details */}
            {(panelName || panelCurrent) && (
              <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {isHebrew ? "פרטי הלוח" : "Panel Details"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {panelName && (
                    <div>
                      <span className="text-sm text-muted-foreground">{isHebrew ? "שם לוח:" : "Panel Name:"}</span>
                      <p className="font-semibold text-lg">{panelName}</p>
                    </div>
                  )}
                  {panelCurrent && (
                    <div>
                      <span className="text-sm text-muted-foreground">{isHebrew ? "זרם הלוח:" : "Panel Current:"}</span>
                      <p className="font-semibold text-lg">{panelCurrent}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>

            {/* Video */}
            {project.video_url && (
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  {isHebrew ? "סרטון הפרויקט" : "Project Video"}
                </h3>
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src={getYoutubeEmbedUrl(project.video_url)}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            )}

            {/* Rich content */}
            {richContent && (
              <div className="mt-8">
                <div 
                  className="prose prose-lg max-w-none [&_video]:rounded-xl [&_iframe]:rounded-xl"
                  dangerouslySetInnerHTML={{ __html: parseRichContent(richContent) }}
                />
              </div>
            )}
          </motion.div>

          {/* Right column - Tags and metadata */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {tags && tags.length > 0 && (
              <div className="bg-muted/50 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">
                  {isHebrew ? "תגיות" : "Tags"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-muted/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-4">
                {isHebrew ? "פרטי הפרויקט" : "Project Details"}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">{isHebrew ? "תאריך:" : "Date:"}</span>
                  <span className="text-muted-foreground mr-2">
                    {new Date(project.created_at).toLocaleDateString(isHebrew ? "he-IL" : "en-US")}
                  </span>
                </div>
                {allImages.length > 1 && (
                  <div>
                    <span className="font-medium">{isHebrew ? "תמונות:" : "Images:"}</span>
                    <span className="text-muted-foreground mr-2">{allImages.length}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Lightbox modal */}
      {/* Lightbox modal for gallery images */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={() => setSelectedImageIndex(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          
          {selectedImageIndex !== null && (
            <div className="relative w-full h-[90vh] flex items-center justify-center">
              <img
                src={allImages[selectedImageIndex]}
                alt={`${title} ${selectedImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => navigateImage('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </button>
                  <button
                    onClick={() => navigateImage('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80">
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox modal for rich content images */}
      <Dialog open={richContentImageIndex !== null} onOpenChange={() => { setRichContentImageIndex(null); setRichContentGallery(null); }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <button
            onClick={() => { setRichContentImageIndex(null); setRichContentGallery(null); }}
            className="absolute top-4 right-4 z-50 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          
          {richContentImageIndex !== null && richContentGallery && (
            <div className="relative w-full h-[90vh] flex items-center justify-center">
              <img
                src={richContentGallery[richContentImageIndex]}
                alt={`Image ${richContentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
              
              {richContentGallery.length > 1 && (
                <>
                  <button
                    onClick={() => navigateRichContentImage('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  >
                    <ChevronLeft className="h-8 w-8 text-white" />
                  </button>
                  <button
                    onClick={() => navigateRichContentImage('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
                  >
                    <ChevronRight className="h-8 w-8 text-white" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80">
                    {richContentImageIndex + 1} / {richContentGallery.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectDetail;
