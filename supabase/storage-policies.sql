-- Storage Bucket Policies for MyMeme App

-- Create buckets (to be done in Supabase dashboard)
-- 1. "creations" - Public bucket for generated images/videos
-- 2. "originals" - Private bucket for uploaded selfies

-- Policies for "creations" bucket (public access for viewing)
CREATE POLICY "Public read access for creations" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'creations');

-- Policies for "originals" bucket (private, user-specific access)
CREATE POLICY "Users can access own original images"
ON storage.objects FOR ALL 
USING (
  auth.uid() = CAST(metadata->>'user_id' AS uuid) AND 
  bucket_id = 'originals'
);