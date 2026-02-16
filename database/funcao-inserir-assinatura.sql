-- Insere assinatura com SECURITY DEFINER (contorna "permission denied for table users")
-- Execute no SQL Editor do Supabase: https://app.supabase.com/project/bqiklofbfiatcdpenpyy/sql
-- Depois o app usa supabase.rpc('inserir_assinatura', { ... }) em vez de .from('assinaturas').insert()

CREATE OR REPLACE FUNCTION public.inserir_assinatura(
  p_user_id uuid,
  p_user_email text,
  p_status text DEFAULT 'ativa',
  p_data_inicio timestamptz DEFAULT now(),
  p_data_vencimento timestamptz,
  p_valor numeric,
  p_forma_pagamento text,
  p_order_nsu text,
  p_slug text
)
RETURNS SETOF public.assinaturas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Só permite inserir para o próprio usuário logado
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'user_id deve ser o usuário logado';
  END IF;
  IF p_user_id IS NULL AND auth.uid() IS NULL THEN
    RAISE EXCEPTION 'usuário deve estar logado';
  END IF;

  RETURN QUERY
  INSERT INTO public.assinaturas (
    user_id, user_email, status, data_inicio, data_vencimento,
    valor, forma_pagamento, order_nsu, slug
  )
  VALUES (
    p_user_id, p_user_email, p_status, p_data_inicio, p_data_vencimento,
    p_valor, p_forma_pagamento, p_order_nsu, p_slug
  )
  RETURNING *;
END;
$$;

GRANT EXECUTE ON FUNCTION public.inserir_assinatura(uuid, text, text, timestamptz, timestamptz, numeric, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.inserir_assinatura(uuid, text, text, timestamptz, timestamptz, numeric, text, text, text) TO anon;
