/**
 * Parse rich content and convert shortcodes to proper HTML
 * Supports:
 * - [video=URL] - Direct video files (mp4, webm, etc.)
 * - YouTube URLs - Automatically embedded as iframe
 */

const VIDEO_SHORTCODE_REGEX = /\[video=([^\]]+)\]/g;

export const getYoutubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Extract clean URL from potentially wrapped anchor tags and HTML entities
 */
const extractCleanUrl = (input: string): string => {
  let url = input;
  
  // Decode HTML entities first
  url = url
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Extract URL from anchor tag if present: <a ...href=URL>URL</a>
  const anchorMatch = url.match(/href=["']?([^"'>\s]+)["']?[^>]*>/i);
  if (anchorMatch) {
    url = anchorMatch[1];
  } else {
    // Try to extract just the URL from the text
    const urlMatch = url.match(/(https?:\/\/[^\s<>"]+)/i);
    if (urlMatch) {
      url = urlMatch[1];
    }
  }
  
  // Remove quotes and trim
  url = url.replace(/["']/g, '').trim();
  
  return url;
};

export const parseRichContent = (content: string): string => {
  if (!content) return '';

  let parsed = content;

  // Parse [video=URL] shortcodes for direct video files
  // Handle cases where URL might be wrapped in <a> tags by Tiptap
  parsed = parsed.replace(VIDEO_SHORTCODE_REGEX, (match, urlPart) => {
    const cleanUrl = extractCleanUrl(urlPart);
    
    if (!cleanUrl) return match;
    
    return `
      <div class="my-6 aspect-video">
        <video 
          controls 
          class="w-full h-full rounded-xl shadow-lg object-contain bg-black" 
          preload="metadata"
        >
          <source src="${cleanUrl}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  });

  // Parse standalone YouTube URLs (not already in iframes)
  parsed = parsed.replace(
    /(?:<p>)?\s*(?:<a[^>]*>)?((?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*))(?:<\/a>)?\s*(?:<\/p>)?/gi,
    (match, fullUrl, videoId) => {
      // Skip if already inside an iframe or processed
      if (match.includes('iframe') || match.includes('embed')) {
        return match;
      }
      return `
        <div class="my-6 aspect-video">
          <iframe 
            src="${getYoutubeEmbedUrl(videoId)}" 
            class="w-full h-full rounded-xl shadow-lg"
            allowfullscreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          ></iframe>
        </div>
      `;
    }
  );

  return parsed;
};
