-- Create storage bucket for team photos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-photos', 'team-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to team photos
CREATE POLICY "Team photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'team-photos');

-- Allow authenticated users to upload team photos
CREATE POLICY "Authenticated users can upload team photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'team-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to update team photos
CREATE POLICY "Authenticated users can update team photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'team-photos' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete team photos
CREATE POLICY "Authenticated users can delete team photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'team-photos' AND auth.role() = 'authenticated');