-- Create table for project inquiry form submissions
CREATE TABLE public.project_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_id TEXT NOT NULL,
  street TEXT NOT NULL,
  street_number TEXT NOT NULL,
  city TEXT NOT NULL,
  zip_code TEXT,
  contact_name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  email TEXT NOT NULL,
  accountant_name TEXT,
  accountant_phone TEXT,
  notes TEXT,
  file_urls TEXT[],
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;

-- Admin can view all inquiries
CREATE POLICY "Admins can view all project inquiries"
ON public.project_inquiries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can submit project inquiry"
ON public.project_inquiries
FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_project_inquiries_updated_at
BEFORE UPDATE ON public.project_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();