

## Gallery Categories with Tabs

### What will change

**Public Gallery page (`/gallery`)** will have tabs at the top. Each tab shows only the images assigned to that category. A "All" tab will show everything.

**Admin Gallery page** will keep using the category dropdown, but categories will be dynamic -- managed from a new admin section instead of hardcoded.

### Steps

**1. Create a `gallery_categories` table**
- Columns: `id`, `name_he`, `name_en`, `display_order`, `created_at`
- RLS: public read, admin write
- This replaces the hardcoded `CATEGORIES` array

**2. Update the public Gallery page (`src/pages/Gallery.tsx`)**
- Fetch categories from `gallery_categories` table
- Add a `Tabs` component at the top with one tab per category plus an "All" tab
- Filter displayed images based on selected tab
- Keep the existing lightbox and layout

**3. Update Admin Gallery (`src/pages/AdminGallery.tsx`)**
- Replace the hardcoded `CATEGORIES` array with data from `gallery_categories`
- Add a small section at the top to manage categories (add/delete category names in Hebrew and English)
- The category dropdown when adding/editing items will use the dynamic list

**4. Update related components**
- `GalleryPreview.tsx` and `ProjectsSlider.tsx` filter by category already -- they will continue working since they query by the category string value

### Technical Details

**New table: `gallery_categories`**
```text
id          uuid (PK, default gen_random_uuid())
name_he     text NOT NULL
name_en     text
display_order integer DEFAULT 0
created_at  timestamptz DEFAULT now()
```

RLS policies:
- SELECT: public (true)
- INSERT/UPDATE/DELETE: admin only via has_role()

**Gallery.tsx changes:**
- Import `Tabs, TabsList, TabsTrigger, TabsContent` from ui/tabs
- Query `gallery_categories` ordered by `display_order`
- State for active tab, default "all"
- Filter gallery items by matching `category` to the selected category's `name_he`

**AdminGallery.tsx changes:**
- Add category management UI (inline add/delete)
- Replace `CATEGORIES` constant with fetched categories
- Category select dropdown uses `name_he` as value, shows `name_he` / `name_en`

