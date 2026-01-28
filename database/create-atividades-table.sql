-- Criar tabela para registrar todas as atividades do usuário
CREATE TABLE IF NOT EXISTS atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tipo_atividade TEXT NOT NULL, -- 'audio', 'treino', 'fome_emocional', 'respiracao', 'diario'
  titulo TEXT NOT NULL, -- título da atividade
  descricao TEXT, -- descrição detalhada
  dados_adicionais JSONB, -- dados específicos de cada tipo de atividade
  data_atividade TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duracao INTEGER, -- duração em segundos (opcional)
  concluida BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_atividades_user_id ON atividades(user_id);
CREATE INDEX IF NOT EXISTS idx_atividades_data ON atividades(data_atividade);
CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON atividades(tipo_atividade);

-- Políticas de segurança
ALTER TABLE atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activities" ON atividades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities" ON atividades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON atividades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" ON atividades
  FOR DELETE USING (auth.uid() = user_id);
