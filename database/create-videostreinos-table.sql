-- Criar tabela de vídeos de treinos
CREATE TABLE IF NOT EXISTS videostreinos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  nivel TEXT NOT NULL,
  duracao TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_videostreinos_nivel ON videostreinos(nivel);
CREATE INDEX IF NOT EXISTS idx_videostreinos_categoria ON videostreinos(categoria);

-- RLS
ALTER TABLE videostreinos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON videostreinos
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON videostreinos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON videostreinos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON videostreinos
  FOR DELETE USING (auth.role() = 'authenticated');
