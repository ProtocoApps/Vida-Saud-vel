-- Programação de treinos por dia da semana (1=Segunda ... 7=Domingo)
CREATE TABLE IF NOT EXISTS treinos_programacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  treino_id UUID NOT NULL REFERENCES videostreinos(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (dia_semana)
);

CREATE INDEX IF NOT EXISTS idx_treinos_programacao_active ON treinos_programacao(is_active);

ALTER TABLE treinos_programacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON treinos_programacao
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON treinos_programacao
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON treinos_programacao
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON treinos_programacao
  FOR DELETE USING (auth.role() = 'authenticated');
