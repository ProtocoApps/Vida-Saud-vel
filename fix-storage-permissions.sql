-- Corrigir permissões do bucket 'media'
-- Execute este SQL se as URLs públicas não estiverem funcionando

-- Primeiro, remover políticas existentes
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own uploads" ON storage.objects;

-- Criar políticas corretas
CREATE POLICY "Allow public uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media'
  );

CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'media'
  );

CREATE POLICY "Allow users to update their own uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'media'
  );

CREATE POLICY "Allow users to delete their own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media'
  );
