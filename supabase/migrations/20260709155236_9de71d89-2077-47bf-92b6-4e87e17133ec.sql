
CREATE POLICY "Memories are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'memories');

CREATE POLICY "Users can upload to their own memories folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own memories"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own memories"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'memories' AND auth.uid()::text = (storage.foldername(name))[1]);
