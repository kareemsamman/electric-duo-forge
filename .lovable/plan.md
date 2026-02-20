

## Multi-Panel Support for Projects

### Overview

Some projects (like "מלון אינטרקונטיננטל - ירושלים") have multiple electrical panels (לוחות). This feature adds the ability to toggle multi-panel mode on a project, where each panel has its own name, current rating, and set of images -- while the project text (description, tags, location, etc.) stays the same across all panels.

### How it will work

**Admin side:**
- In the project edit dialog, the "פרטי לוח" (Panel Details) tab gets a toggle: "מספר לוחות" (Multiple Panels)
- When off (default): works exactly like today -- single panel name, current, and one image gallery
- When on: shows a repeater where you can add multiple panels, each with its own name (HE/EN), current, and image gallery

**Public side (ProjectDetail page):**
- If a project has multiple panels, tabs appear in the panel details section
- Clicking a panel tab switches the displayed images (main + gallery) to that panel's images
- All text content (title, description, tags, rich content, video) stays the same regardless of selected panel

### Steps

**1. Create `project_panels` table**

New table to store individual panels for a project:

```text
project_panels
  id              uuid PK
  project_id      uuid FK -> projects.id (ON DELETE CASCADE)
  panel_name      text NOT NULL
  panel_name_en   text
  panel_current   text
  image           text (main image for this panel)
  images          text[] (gallery images for this panel)
  display_order   integer DEFAULT 0
  created_at      timestamptz DEFAULT now()
```

RLS: public SELECT, admin INSERT/UPDATE/DELETE via `has_role()`.

**2. Add `has_multiple_panels` boolean to `projects` table**

A simple flag (`DEFAULT false`) so the admin can toggle multi-panel mode. When false, the existing `panel_name`, `panel_current`, `image`, and `images` columns are used as before.

**3. Update AdminProjects.tsx - Panel Details tab**

- Add a Switch toggle for "מספר לוחות"
- When toggled on, hide the single panel fields and show a repeater:
  - Each panel entry: name (HE/EN), current, main image URL, gallery images
  - Add/remove panel buttons
- On save: if multi-panel is on, save panels to `project_panels` table and clear single panel fields; if off, use existing fields as before

**4. Update ProjectDetail.tsx**

- Query `project_panels` for the current project (only if `has_multiple_panels` is true)
- If panels exist, show tabs (one per panel name) above the image area
- Selecting a panel tab swaps `mainImage` and `allImages` to that panel's images
- Panel details section shows the selected panel's name and current
- Everything else (title, description, tags, video, rich content) remains unchanged

### Technical Details

**Migration SQL:**
- `ALTER TABLE projects ADD COLUMN has_multiple_panels boolean NOT NULL DEFAULT false;`
- `CREATE TABLE project_panels (...)` with foreign key to `projects.id` and cascade delete
- RLS policies on `project_panels`: SELECT for public, ALL for admin

**AdminProjects.tsx changes:**
- New state: `panels` array and `hasMultiplePanels` boolean
- On edit: fetch panels from `project_panels` where `project_id = id`
- On save: upsert panels (delete old, insert new) inside the mutation
- Panel repeater UI with add/remove and image gallery per panel

**ProjectDetail.tsx changes:**
- Additional query for `project_panels` when `has_multiple_panels` is true
- State for `selectedPanelIndex` (default 0)
- Conditional tabs rendering above the main image
- Dynamic `mainImage` and `allImages` based on selected panel
- Panel details section updates to show selected panel info

