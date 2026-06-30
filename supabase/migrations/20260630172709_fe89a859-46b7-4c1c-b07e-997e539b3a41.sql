
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Storage policies for avatars bucket (private)
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
);
