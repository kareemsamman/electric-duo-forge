-- Add English PDF and image fields, plus multiple images support
ALTER TABLE public.certificates
ADD COLUMN IF NOT EXISTS pdf_file_en text,
ADD COLUMN IF NOT EXISTS certificate_image_en text,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}'::text[];