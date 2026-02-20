
-- Add multi-panel flag to projects
ALTER TABLE public.projects ADD COLUMN has_multiple_panels boolean NOT NULL DEFAULT false;

-- Create project_panels table
CREATE TABLE public.project_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  panel_name text NOT NULL,
  panel_name_en text,
  panel_current text,
  image text,
  images text[] DEFAULT '{}'::text[],
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_panels ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Public can view project panels"
ON public.project_panels
FOR SELECT
USING (true);

-- Admins can manage
CREATE POLICY "Admins can manage project panels"
ON public.project_panels
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));
