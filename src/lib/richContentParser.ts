/**
 * Parse rich content and convert shortcodes to proper HTML
 * Supports:
 * - [video=URL] - Direct video files (mp4, webm, etc.)
 * - YouTube URLs - Automatically embedded as iframe
 */

const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
const VIDEO_SHORTCODE_REGEX = /\[video=([^\]]+)\]/g;

export const getYoutubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

export const parseRichContent = (content: string): string => {
  if (!content) return '';

  let parsed = content;

  // Parse [video=URL] shortcodes for direct video files
  parsed = parsed.replace(VIDEO_SHORTCODE_REGEX, (match, url) => {
    // Clean the URL (remove quotes if present)
    const cleanUrl = url.replace(/["']/g, '').trim();
    return `
      <div class="my-6">
        <video 
          controls 
          class="w-full rounded-xl shadow-lg" 
          preload="metadata"
        >
          <source src="${cleanUrl}" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    `;
  });

  // Parse standalone YouTube URLs (not already in iframes)
  // Only match URLs that are on their own line or surrounded by whitespace/tags
  parsed = parsed.replace(
    /(?:<p>)?\s*((?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^\s<]*))\s*(?:<\/p>)?/gi,
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
