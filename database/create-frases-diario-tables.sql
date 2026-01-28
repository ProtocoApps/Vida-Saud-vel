-- Frases de Gratidão (gerenciadas pelo admin)
CREATE TABLE IF NOT EXISTS frases_gratidao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  frase TEXT NOT NULL,
  autor VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_frases_gratidao_active ON frases_gratidao(is_active);

ALTER TABLE frases_gratidao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON frases_gratidao
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON frases_gratidao
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON frases_gratidao
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON frases_gratidao
  FOR DELETE USING (auth.role() = 'authenticated');

-- Frases Alimentares (gerenciadas pelo admin)
CREATE TABLE IF NOT EXISTS frases_alimentar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  frase TEXT NOT NULL,
  autor VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_frases_alimentar_active ON frases_alimentar(is_active);

ALTER TABLE frases_alimentar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON frases_alimentar
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON frases_alimentar
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON frases_alimentar
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON frases_alimentar
  FOR DELETE USING (auth.role() = 'authenticated');

-- Reflexões do Usuário (para Profecias)
CREATE TABLE IF NOT EXISTS reflexoes_usuario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflexao TEXT NOT NULL,
  data_reflexao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, data_reflexao)
);

CREATE INDEX IF NOT EXISTS idx_reflexoes_usuario_user_date ON reflexoes_usuario(user_id, data_reflexao);

ALTER TABLE reflexoes_usuario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections" ON reflexoes_usuario
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON reflexoes_usuario
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON reflexoes_usuario
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON reflexoes_usuario
  FOR DELETE USING (auth.uid() = user_id);
