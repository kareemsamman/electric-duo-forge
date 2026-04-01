
-- Create project_categories table
CREATE TABLE public.project_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create junction table
CREATE TABLE public.project_category_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.project_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(project_id, category_id)
);

-- Enable RLS
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_category_assignments ENABLE ROW LEVEL SECURITY;

-- project_categories policies
CREATE POLICY "Public can view project categories" ON public.project_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage project categories" ON public.project_categories FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- project_category_assignments policies  
CREATE POLICY "Public can view category assignments" ON public.project_category_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage category assignments" ON public.project_category_assignments FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
