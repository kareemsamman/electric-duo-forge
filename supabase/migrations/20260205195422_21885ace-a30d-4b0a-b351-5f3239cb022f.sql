-- Add links column to services table (array of objects with text and url)
ALTER TABLE public.services ADD COLUMN links jsonb DEFAULT '[]'::jsonb;

-- Migrate existing link_url data to new links format
UPDATE public.services 
SET links = jsonb_build_array(jsonb_build_object('text', 'קישור', 'url', link_url))
WHERE link_url IS NOT NULL AND link_url != '';