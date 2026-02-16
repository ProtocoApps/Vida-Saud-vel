-- Nova tabela de assinaturas (sem referência a public.users = sem "permission denied")
-- Cole TUDO no SQL Editor do Supabase e clique Run: https://app.supabase.com/project/bqiklofbfiatcdpenpyy/sql

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.assinaturas_registro (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email character varying(255) NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'expirada')),
  data_inicio timestamptz NOT NULL DEFAULT now(),
  data_vencimento timestamptz NOT NULL,
  valor numeric(10,2) NOT NULL,
  forma_pagamento character varying(20) NOT NULL CHECK (forma_pagamento IN ('pix', 'cartao')),
  order_nsu character varying(100) NOT NULL,
  slug character varying(100) NOT NULL,
  receipt_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_registro_user_id ON public.assinaturas_registro(user_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_registro_user_email ON public.assinaturas_registro(user_email);
CREATE INDEX IF NOT EXISTS idx_assinaturas_registro_status ON public.assinaturas_registro(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_registro_data_vencimento ON public.assinaturas_registro(data_vencimento);

DROP TRIGGER IF EXISTS update_assinaturas_registro_updated_at ON public.assinaturas_registro;
CREATE TRIGGER update_assinaturas_registro_updated_at
  BEFORE UPDATE ON public.assinaturas_registro
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.assinaturas_registro ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_own" ON public.assinaturas_registro;
CREATE POLICY "insert_own"
  ON public.assinaturas_registro FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR (user_id IS NULL AND auth.uid() IS NOT NULL));

DROP POLICY IF EXISTS "select_own" ON public.assinaturas_registro;
CREATE POLICY "select_own"
  ON public.assinaturas_registro FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_select_all" ON public.assinaturas_registro;
CREATE POLICY "admin_select_all"
  ON public.assinaturas_registro FOR SELECT TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'is_admin') = 'true');

DROP POLICY IF EXISTS "admin_update" ON public.assinaturas_registro;
CREATE POLICY "admin_update"
  ON public.assinaturas_registro FOR UPDATE TO authenticated
  USING ((auth.jwt()->'user_metadata'->>'is_admin') = 'true');
