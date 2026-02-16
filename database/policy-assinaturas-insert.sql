-- Permite que usuários autenticados insiram sua própria assinatura (necessário para PIX/cartão salvar após pagamento)
-- Execute no SQL Editor do Supabase: https://app.supabase.com/project/bqiklofbfiatcdpenpyy/sql

CREATE POLICY "Usuários podem inserir própria assinatura" ON assinaturas
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR (user_id IS NULL AND auth.uid() IS NOT NULL)
  );
