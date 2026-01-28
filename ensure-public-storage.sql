-- Garantir que o bucket 'media' seja público
-- Execute este SQL para corrigir problemas de acesso

-- Atualizar bucket para ser público
UPDATE storage.buckets 
SET public = true 
WHERE name = 'media';

-- Remover e recriar políticas para acesso público
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;

-- Política para downloads públicos (importante para imagens e áudios)
CREATE POLICY "Allow public downloads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'media'
  );

-- Política para uploads (apenas usuários autenticados)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' AND 
    auth.role() = 'authenticated'
  );
