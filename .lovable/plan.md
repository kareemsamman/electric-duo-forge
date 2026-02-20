

## Fix: YouTube Video Not Playing in Hero Section

### Problem
The `hero.background_type` in the database is set to `"video"` but the `hero.video_url` contains a YouTube link. The code has separate handling for `"video"` (direct MP4) and `"youtube"` (YouTube embed), so the YouTube URL is being treated as an MP4 file -- which doesn't work.

### Solution (Two Parts)

**1. Update the database value**
Change `hero.background_type` from `"video"` to `"youtube"` so the correct YouTube embed code path is used.

**2. Improve the YouTube iframe for iPhone compatibility**
Update the iframe in `HeroSection.tsx` to ensure it works on iPhones:
- Add `&enablejsapi=1` parameter
- Add `allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"` 
- Add a CSS `scale-110` transform to fully hide any YouTube UI chrome
- Ensure no controls are visible

### Technical Details

**Database fix:**
- Run SQL to update `hero.background_type` value_he from `"video"` to `"youtube"`

**File: `src/components/home/HeroSection.tsx`**
- Line 109: Update iframe `src` URL parameters to add `enablejsapi=1` and `origin` for better autoplay support
- Line 110: Expand `allow` attribute to include `accelerometer; gyroscope`
- Line 111: Add `scale-110` transform class to hide YouTube player chrome around edges
- Add `frameBorder="0"` and `allowFullScreen={false}` attributes
