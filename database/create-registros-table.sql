-- Criar tabela para registros emocionais e físicos
CREATE TABLE IF NOT EXISTS registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  tipo_registro TEXT NOT NULL, -- 'fome_emocional', 'forma_fisica_emocional'
  sintomas TEXT[], -- Array de sintomas selecionados
  detalhes JSONB, -- Detalhes de cada sintoma { "sintoma": "descrição" }
  data_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_registros_user_id ON registros(user_id);
CREATE INDEX IF NOT EXISTS idx_registros_data ON registros(data_registro);
CREATE INDEX IF NOT EXISTS idx_registros_tipo ON registros(tipo_registro);

-- Políticas de segurança
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records" ON registros
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own records" ON registros
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own records" ON registros
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own records" ON registros
  FOR DELETE USING (auth.uid() = user_id);
