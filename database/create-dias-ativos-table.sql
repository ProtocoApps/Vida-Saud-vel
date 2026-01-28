-- Criar tabela para registrar dias ativos do usuário
CREATE TABLE IF NOT EXISTS dias_ativos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  data_ativo DATE NOT NULL,
  ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_atividades INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, data_ativo) -- Garante que só tenha um registro por usuário por dia
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_dias_ativos_user_id ON dias_ativos(user_id);
CREATE INDEX IF NOT EXISTS idx_dias_ativos_data ON dias_ativos(data_ativo);

-- Políticas de segurança
ALTER TABLE dias_ativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own active days" ON dias_ativos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own active days" ON dias_ativos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active days" ON dias_ativos
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para contar dias ativos consecutivos (streak)
CREATE OR REPLACE FUNCTION calcular_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER DEFAULT 0;
  current_date DATE := CURRENT_DATE;
  found_date DATE;
BEGIN
  LOOP
    -- Busca se o usuário foi ativo na data atual do loop
    SELECT data_ativo INTO found_date
    FROM dias_ativos
    WHERE user_id = user_uuid AND data_ativo = current_date;
    
    -- Se encontrou, incrementa o streak e vai para o dia anterior
    IF found_date IS NOT NULL THEN
      streak_count := streak_count + 1;
      current_date := current_date - INTERVAL '1 day';
    ELSE
      -- Se não encontrou, para o loop
      EXIT;
    END IF;
    
    -- Limita para não loop infinito (máximo 365 dias)
    IF streak_count >= 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;
