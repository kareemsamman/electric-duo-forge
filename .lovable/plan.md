

## Two Fixes

### 1. Remove "מתוך העבודות שלנו" from Home Page
The section visible on the home page is the `HeroGallerySlider` component (not the previously removed `ProjectsSection`). It will be removed from `src/pages/Home.tsx` by deleting its import and usage.

### 2. Allow Empty Description in Services Admin
In `src/pages/AdminServices.tsx`, the Save button is disabled when `description_he` is empty (line 456: `disabled={!formData.title_he || !formData.description_he}`). The fix removes `!formData.description_he` from the disabled condition, so only the title is required.

### Technical Details

**File: `src/pages/Home.tsx`**
- Remove `import HeroGallerySlider` (line 10)
- Remove `<HeroGallerySlider />` from the JSX (line 16)

**File: `src/pages/AdminServices.tsx`**
- Change line 456 from `disabled={!formData.title_he || !formData.description_he}` to `disabled={!formData.title_he}`

