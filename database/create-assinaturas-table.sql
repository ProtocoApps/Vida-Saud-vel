-- Tabela para controle de assinaturas dos usuários
CREATE TABLE IF NOT EXISTS assinaturas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'expirada')),
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(20) NOT NULL CHECK (forma_pagamento IN ('pix', 'cartao')),
    order_nsu VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_user_id ON assinaturas(user_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_user_email ON assinaturas(user_email);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_data_vencimento ON assinaturas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_assinaturas_order_nsu ON assinaturas(order_nsu);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assinaturas_updated_at 
    BEFORE UPDATE ON assinaturas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Política de segurança (RLS)
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem suas próprias assinaturas
CREATE POLICY "Usuários podem ver suas assinaturas" ON assinaturas
    FOR SELECT USING (auth.uid() = user_id);

-- Política para administradores (você precisará criar uma função admin)
CREATE POLICY "Administradores podem gerenciar assinaturas" ON assinaturas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'is_admin' = 'true'
        )
    );
