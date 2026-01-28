-- Políticas de segurança para o bucket 'media'
-- Execute este SQL após criar o bucket manualmente

CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'media'
  );

CREATE POLICY "Allow users to update their own uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to delete their own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' AND 
    auth.role() = 'authenticated'
  );
