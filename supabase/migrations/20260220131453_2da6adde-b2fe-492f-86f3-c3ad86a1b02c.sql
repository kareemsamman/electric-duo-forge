
-- =============================================
-- FIX 1: Tighten RLS policies on content tables
-- Replace auth.role() = 'authenticated' with has_role(auth.uid(), 'admin')
-- =============================================

-- PROJECTS: Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;

-- PRODUCTS: Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

-- CLIENT_LOGOS: Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert client_logos" ON public.client_logos;
DROP POLICY IF EXISTS "Authenticated users can update client_logos" ON public.client_logos;
DROP POLICY IF EXISTS "Authenticated users can delete client_logos" ON public.client_logos;

-- SITE_CONTENT: Drop overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to update site_content" ON public.site_content;
DROP POLICY IF EXISTS "Authenticated users can insert site_content" ON public.site_content;

-- Replace site_content SELECT to exclude sensitive keys from non-admins
DROP POLICY IF EXISTS "Allow public read access to site_content" ON public.site_content;
CREATE POLICY "Public read non-sensitive site_content" ON public.site_content
FOR SELECT USING (
  CASE 
    WHEN key IN ('gmail_email', 'gmail_app_password') 
    THEN has_role(auth.uid(), 'admin'::app_role)
    ELSE true
  END
);

-- Create admin-only write policies for site_content
CREATE POLICY "Admins can update site_content" ON public.site_content
FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert site_content" ON public.site_content
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site_content" ON public.site_content
FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- VIDEO_SECTIONS: Add admin write policies
CREATE POLICY "Admins can manage video_sections" ON public.video_sections
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- SHIPPING_METHODS: Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can insert shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Authenticated users can update shipping methods" ON public.shipping_methods;
DROP POLICY IF EXISTS "Authenticated users can delete shipping methods" ON public.shipping_methods;

-- =============================================
-- FIX 2: Tighten storage bucket policies
-- =============================================

-- Drop overly permissive storage policies and recreate with admin check
DROP POLICY IF EXISTS "Allow authenticated users to upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update product images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

DROP POLICY IF EXISTS "Allow authenticated uploads to client-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to client-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes from client-logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload client logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update client logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete client logos" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete gallery images" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload team photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update team photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete team photos" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload service images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update service images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete service images" ON storage.objects;

-- Create admin-only storage policies for all buckets
CREATE POLICY "Admins can upload to product-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update product-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete product-images" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload to client-logos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update client-logos" ON storage.objects
FOR UPDATE USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete client-logos" ON storage.objects
FOR DELETE USING (bucket_id = 'client-logos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload to gallery" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update gallery" ON storage.objects
FOR UPDATE USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete gallery" ON storage.objects
FOR DELETE USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload to team-photos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update team-photos" ON storage.objects
FOR UPDATE USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete team-photos" ON storage.objects
FOR DELETE USING (bucket_id = 'team-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload to service-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update service-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete service-images" ON storage.objects
FOR DELETE USING (bucket_id = 'service-images' AND public.has_role(auth.uid(), 'admin'::app_role));
