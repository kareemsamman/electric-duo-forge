-- Add new fields for enhanced project details
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS panel_name text,
ADD COLUMN IF NOT EXISTS panel_name_en text,
ADD COLUMN IF NOT EXISTS panel_current text,
ADD COLUMN IF NOT EXISTS rich_content text,
ADD COLUMN IF NOT EXISTS rich_content_en text;