-- Criar tabela de áudios
CREATE TABLE IF NOT EXISTS audios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_audios_category ON audios(category);
CREATE INDEX IF NOT EXISTS idx_audios_active ON audios(is_active);

-- Inserir alguns áudios de exemplo
INSERT INTO audios (title, duration, category, image_url, audio_url, description) VALUES
('Equilíbrio Emocional', '15 min', 'EMOÇÕES', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=200', 'https://www.bensound.com/bensound-music/bensound-meditation.mp3', 'Meditação para equilibrar suas emoções'),
('Paz Interior e Silêncio', '12 min', 'EMOÇÕES', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=200', 'https://www.bensound.com/bensound-music/bensound-relaxing.mp3', 'Encontre paz e silêncio interior'),
('Manejo da Ansiedade', '18 min', 'EMOÇÕES', 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?auto=format&fit=crop&q=80&w=200', 'https://www.bensound.com/bensound-music/bensound-slowmotion.mp3', 'Técnicas para manejar a ansiedade'),
('Frequência da Gratidão', '10 min', 'EMOÇÕES', 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=200', 'https://www.bensound.com/bensound-music/bensound-happiness.mp3', 'Pratique a gratidão diária'),
('Acolhendo a Sombra', '25 min', 'EMOÇÕES', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=200', 'https://www.bensound.com/bensound-music/bensound-spiritual.mp3', 'Integração das partes sombrias'),
('Respiração Consciente', '8 min', 'CORPO', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=200', 'https://www.bensound.com/bensound-music/bensound-yoga.mp3', 'Exercícios de respiração consciente'),
('Relaxamento Profundo', '20 min', 'CORPO', 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=200', 'https://www.bensound.com/bensound-music/bensound-wellness.mp3', 'Técnica de relaxamento profundo');

-- Políticas de segurança (ajuste conforme necessário)
ALTER TABLE audios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON audios
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON audios
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON audios
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON audios
  FOR DELETE USING (auth.role() = 'authenticated');

