-- Criar tabela de cards da Home
CREATE TABLE IF NOT EXISTS home_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  icon TEXT NOT NULL,
  screen TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_cards_active ON home_cards(is_active);
CREATE INDEX IF NOT EXISTS idx_home_cards_sort ON home_cards(sort_order);

ALTER TABLE home_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON home_cards
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON home_cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON home_cards
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON home_cards
  FOR DELETE USING (auth.role() = 'authenticated');
