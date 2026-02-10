

## Add YouTube Background Option to Hero Section

Currently the hero supports two background types: **video** (direct MP4 upload) and **image**. This plan adds a third option: **youtube** -- an embedded YouTube iframe that autoplays, loops, and hides all controls.

### Changes

**1. Admin Content (`src/pages/AdminContent.tsx`)**
- Add a third option "YouTube" to the background type selector dropdown
- When "youtube" is selected, show a text input for the YouTube URL/ID instead of a file upload
- Store the YouTube URL in the existing `hero.video_url` content key (reuse the same field)

**2. Hero Section (`src/components/home/HeroSection.tsx`)**
- Add a third branch for `backgroundType === "youtube"`
- Extract the YouTube video ID from the URL
- Render an iframe with YouTube embed parameters that disable controls and enable autoplay:
  - `autoplay=1`, `mute=1`, `loop=1`, `controls=0`, `showinfo=0`, `modestbranding=1`, `disablekb=1`, `fs=0`, `rel=0`
  - `playlist=VIDEO_ID` (required for looping)
  - `playsinline=1`
- Style the iframe to cover the full background (absolute positioned, scaled up slightly to hide black bars)
- Add `pointer-events: none` so users can't interact with the YouTube player

### Technical Details

- **YouTube ID extraction**: Parse URLs like `youtube.com/watch?v=ID`, `youtu.be/ID`, or raw IDs
- **Iframe embed URL**: `https://www.youtube.com/embed/{ID}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist={ID}&playsinline=1&modestbranding=1&disablekb=1&fs=0`
- **CSS**: The iframe needs `pointer-events-none` and a slight scale (e.g., `scale-110`) to ensure no YouTube UI elements are visible and the video fills the area edge-to-edge
- No database migration needed -- reuses existing `hero.background_type` and `hero.video_url` keys
