

## Problem

The favicon and site title you set in Admin Settings only work while you're on the settings page itself. When you leave or reload the site, they revert to the hardcoded defaults from `index.html`. This is because the code that applies these settings only runs inside the AdminSettings page component.

## Solution

Create a global component that runs on every page, fetches the SEO settings (title, favicon, OG image, meta description) from the database, and applies them to the page.

## Technical Details

1. **Create `src/components/SeoManager.tsx`** -- A new component that:
   - Fetches `site_title`, `meta_description`, `favicon_url`, and `og_image_url` from the `site_content` table on app load
   - Applies them to the document head (title, favicon link, meta tags)
   - Reacts to language changes to show the correct bilingual title/description

2. **Add `SeoManager` to `src/App.tsx`** -- Place it inside the providers so it runs globally on every page load.

3. **Clean up `src/pages/AdminSettings.tsx`** -- Remove the duplicate `useEffect` that applies SEO settings (since the global component now handles it). After saving settings, invalidate the React Query cache so the global component re-fetches and applies the new values immediately.

