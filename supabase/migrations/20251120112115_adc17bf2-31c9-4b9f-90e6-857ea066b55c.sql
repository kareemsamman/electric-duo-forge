-- Allow authenticated users to insert into site_content table
CREATE POLICY "Authenticated users can insert site_content"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'authenticated'::text);