
CREATE TABLE public.gallery_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he text NOT NULL,
  name_en text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery categories" ON public.gallery_categories
FOR SELECT USING (true);

CREATE POLICY "Admins can insert gallery categories" ON public.gallery_categories
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update gallery categories" ON public.gallery_categories
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete gallery categories" ON public.gallery_categories
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
