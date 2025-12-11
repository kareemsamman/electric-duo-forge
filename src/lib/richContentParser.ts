/**
 * Parse rich content and convert shortcodes to proper HTML
 * Supports:
 * - [video=URL] - Direct video files (mp4, webm, etc.)
 * - [image=URL] - Single image or start of image grid
 * - YouTube URLs - Automatically embedded as iframe
 * 
 * Image Grid Logic:
 * - 1 image = full width
 * - 2 images = 2 columns
 * - 3 images = 3 columns
 * - 4+ images = 4 columns grid
 */

const VIDEO_SHORTCODE_REGEX = /\[video=([^\]]+)\]/g;
const IMAGE_SHORTCODE_REGEX = /\[image=([^\]]+)\]/g;

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

/**
 * Find consecutive image shortcodes and group them for grid layout
 */
const parseImageShortcodes = (content: string): string => {
  // Find all image shortcodes with their positions
  const matches: { match: string; url: string; index: number }[] = [];
  let match;
  const regex = new RegExp(IMAGE_SHORTCODE_REGEX.source, 'g');
  
  while ((match = regex.exec(content)) !== null) {
    const cleanUrl = extractCleanUrl(match[1]);
    if (cleanUrl) {
      matches.push({
        match: match[0],
        url: cleanUrl,
        index: match.index
      });
    }
  }
  
  if (matches.length === 0) return content;
  
  // Group consecutive images (within 50 chars of each other, accounting for whitespace/tags)
  const groups: { urls: string[]; startIndex: number; endIndex: number; originalMatches: string[] }[] = [];
  let currentGroup: { urls: string[]; startIndex: number; endIndex: number; originalMatches: string[] } | null = null;
  
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const prev = matches[i - 1];
    
    // Check if this image is close enough to the previous to be in the same group
    const isConsecutive = prev && (current.index - (prev.index + prev.match.length) < 100);
    
    if (!currentGroup || !isConsecutive) {
      // Start a new group
      if (currentGroup) {
        groups.push(currentGroup);
      }
      currentGroup = {
        urls: [current.url],
        startIndex: current.index,
        endIndex: current.index + current.match.length,
        originalMatches: [current.match]
      };
    } else {
      // Add to current group
      currentGroup.urls.push(current.url);
      currentGroup.endIndex = current.index + current.match.length;
      currentGroup.originalMatches.push(current.match);
    }
  }
  
  if (currentGroup) {
    groups.push(currentGroup);
  }
  
  // Replace groups with grid HTML (process from end to start to preserve indices)
  let result = content;
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i];
    const imageCount = group.urls.length;
    
    // Determine grid columns based on image count
    let gridClass = 'grid-cols-1'; // 1 image = full width
    if (imageCount === 2) gridClass = 'grid-cols-2';
    else if (imageCount === 3) gridClass = 'grid-cols-3';
    else if (imageCount >= 4) gridClass = 'grid-cols-4';
    
    // Build grid HTML
    const imagesHtml = group.urls.map(url => `
      <div class="overflow-hidden rounded-lg">
        <img 
          src="${url}" 
          alt="" 
          class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
    `).join('');
    
    const gridHtml = `
      <div class="my-6 grid ${gridClass} gap-3">
        ${imagesHtml}
      </div>
    `;
    
    // Find the full range to replace (including any whitespace/tags between shortcodes)
    const beforeGroup = result.substring(0, group.startIndex);
    const afterGroup = result.substring(group.endIndex);
    
    // Clean up any paragraph tags or whitespace that wrapped the shortcodes
    const cleanedBefore = beforeGroup.replace(/<p>\s*$/, '');
    const cleanedAfter = afterGroup.replace(/^\s*<\/p>/, '');
    
    result = cleanedBefore + gridHtml + cleanedAfter;
  }
  
  return result;
};

export const parseRichContent = (content: string): string => {
  if (!content) return '';

  let parsed = content;

  // Parse [image=URL] shortcodes for image grids (must be done first)
  parsed = parseImageShortcodes(parsed);

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
