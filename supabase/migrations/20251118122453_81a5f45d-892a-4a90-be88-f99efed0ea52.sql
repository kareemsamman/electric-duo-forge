-- Create client_logos table for dynamic logo management
CREATE TABLE public.client_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  logo_image TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_name_en TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access to client_logos" 
ON public.client_logos 
FOR SELECT 
USING (true);

-- Insert the existing logos as initial data
INSERT INTO public.client_logos (logo_image, company_name, display_order) VALUES
('/src/assets/client-logos/logo-1.png', 'Client 1', 1),
('/src/assets/client-logos/logo-2.png', 'Client 2', 2),
('/src/assets/client-logos/logo-3.png', 'Client 3', 3),
('/src/assets/client-logos/logo-4.png', 'Client 4', 4),
('/src/assets/client-logos/logo-5.png', 'Client 5', 5),
('/src/assets/client-logos/logo-6.png', 'Client 6', 6),
('/src/assets/client-logos/logo-7.png', 'Client 7', 7),
('/src/assets/client-logos/logo-8.png', 'Client 8', 8),
('/src/assets/client-logos/logo-9.png', 'Client 9', 9),
('/src/assets/client-logos/logo-10.png', 'Client 10', 10),
('/src/assets/client-logos/logo-11.png', 'Client 11', 11),
('/src/assets/client-logos/logo-12.png', 'Client 12', 12),
('/src/assets/client-logos/logo-13.png', 'Client 13', 13),
('/src/assets/client-logos/logo-14.png', 'Client 14', 14),
('/src/assets/client-logos/logo-15.png', 'Client 15', 15),
('/src/assets/client-logos/logo-16.png', 'Client 16', 16),
('/src/assets/client-logos/logo-17.png', 'Client 17', 17);