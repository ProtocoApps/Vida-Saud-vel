-- Corrige "permission denied for table users" (42501)
-- O papel "authenticated" (usuário logado) precisa de permissão na tabela public.users.
-- Execute no SQL Editor do Supabase: https://app.supabase.com/project/bqiklofbfiatcdpenpyy/sql

GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
