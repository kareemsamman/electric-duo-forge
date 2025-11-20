-- Create shipping_methods table for admin-configurable shipping
CREATE TABLE IF NOT EXISTS public.shipping_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  region TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shipping_methods ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active shipping methods
CREATE POLICY "Allow public read access to active shipping methods"
ON public.shipping_methods
FOR SELECT
USING (is_active = true);

-- Allow authenticated users to manage shipping methods
CREATE POLICY "Authenticated users can insert shipping methods"
ON public.shipping_methods
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update shipping methods"
ON public.shipping_methods
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete shipping methods"
ON public.shipping_methods
FOR DELETE
USING (auth.role() = 'authenticated');

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name, name_en, region, price) VALUES
  ('משלוח לירושלים', 'Jerusalem Delivery', 'jerusalem', 30),
  ('משלוח לאזור הצפה', 'West Bank Delivery', 'west_bank', 20);