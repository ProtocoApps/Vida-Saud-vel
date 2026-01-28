-- Criar bucket para armazenar mídias (áudios e imagens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media', 
  'media', 
  true, 
  52428800, -- 50MB em bytes
  ARRAY[
    'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg',
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Políticas de segurança para o bucket
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
