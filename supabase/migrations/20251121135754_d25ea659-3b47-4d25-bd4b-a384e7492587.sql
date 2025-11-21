-- Add display_order columns for ordering via drag-and-drop
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

ALTER TABLE public.shipping_methods
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0;

-- Initialize display_order based on created_at for existing rows
UPDATE public.products
SET display_order = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.products
) AS sub
WHERE public.products.id = sub.id;

UPDATE public.projects
SET display_order = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.projects
) AS sub
WHERE public.projects.id = sub.id;

UPDATE public.shipping_methods
SET display_order = sub.rn - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.shipping_methods
) AS sub
WHERE public.shipping_methods.id = sub.id;