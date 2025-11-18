-- Enable authenticated users to manage client logos
CREATE POLICY "Authenticated users can insert client_logos"
ON public.client_logos
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can update client_logos"
ON public.client_logos
FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated'::text)
WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Authenticated users can delete client_logos"
ON public.client_logos
FOR DELETE
TO authenticated
USING (auth.role() = 'authenticated'::text);

-- Create storage bucket for client logos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-logos', 'client-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for client logos bucket
CREATE POLICY "Public can view client logos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-logos');

CREATE POLICY "Authenticated users can upload client logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-logos');

CREATE POLICY "Authenticated users can update client logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-logos')
WITH CHECK (bucket_id = 'client-logos');

CREATE POLICY "Authenticated users can delete client logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-logos');