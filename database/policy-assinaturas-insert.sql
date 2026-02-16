-- Política de INSERT para a tabela assinaturas (obrigatório para salvar após PIX/cartão)
-- Execute no SQL Editor do Supabase: https://app.supabase.com/project/bqiklofbfiatcdpenpyy/sql
-- O insert só passa se: auth.uid() = user_id (ou user_id null com usuário logado)

DROP POLICY IF EXISTS "Usuários podem inserir própria assinatura" ON public.assinaturas;

CREATE POLICY "Usuários podem inserir própria assinatura"
  ON public.assinaturas
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = user_id)
    OR (user_id IS NULL AND auth.uid() IS NOT NULL)
  );
