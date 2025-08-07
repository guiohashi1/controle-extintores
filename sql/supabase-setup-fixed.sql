/*
=== CONFIGURAÇÃO DO SUPABASE - VERSÃO CORRIGIDA ===

Execute este SQL no SQL Editor do Supabase
*/

-- 1. Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own extintores" ON extintores;
DROP POLICY IF EXISTS "Users can insert own extintores" ON extintores;
DROP POLICY IF EXISTS "Users can update own extintores" ON extintores;
DROP POLICY IF EXISTS "Users can delete own extintores" ON extintores;
DROP POLICY IF EXISTS "Users can view own inspecoes" ON inspecoes;
DROP POLICY IF EXISTS "Users can insert own inspecoes" ON inspecoes;
DROP POLICY IF EXISTS "Users can update own inspecoes" ON inspecoes;
DROP POLICY IF EXISTS "Users can delete own inspecoes" ON inspecoes;

-- 2. Criar tabelas se não existirem
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
  plan_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days'),
  plan_status VARCHAR(20) DEFAULT 'active' CHECK (plan_status IN ('active', 'expired', 'cancelled')),
  subscription VARCHAR(50) DEFAULT 'basic' CHECK (subscription IN ('basic', 'professional', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS extintores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  numero VARCHAR(100) NOT NULL,
  local VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  peso DECIMAL(5,2) NOT NULL,
  fabricante VARCHAR(255),
  data_fabricacao DATE,
  data_vencimento DATE,
  data_ultima_inspecao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, numero)
);

CREATE TABLE IF NOT EXISTS inspecoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  extintor_id UUID REFERENCES extintores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_inspecao DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('válido', 'vencido', 'precisa_inspecao')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_extintores_updated_at ON extintores;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_extintores_updated_at BEFORE UPDATE ON extintores
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. DESABILITAR RLS temporariamente para permitir nossa autenticação customizada
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE extintores DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspecoes DISABLE ROW LEVEL SECURITY;

-- 5. Inserir usuário demo para testes (com hash correto para '123456')
INSERT INTO users (id, email, password_hash, name, plan, plan_status, subscription) VALUES
('11111111-1111-1111-1111-111111111111', 'demo@exemplo.com', 'MTIzNDU2c2FsdDEyMw==', 'Usuário Demo', 'professional', 'active', 'professional')
ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  plan = EXCLUDED.plan,
  plan_status = EXCLUDED.plan_status,
  subscription = EXCLUDED.subscription;

-- 6. Inserir alguns extintores demo
INSERT INTO extintores (user_id, numero, local, tipo, peso, fabricante, data_fabricacao, data_vencimento, data_ultima_inspecao, observacoes) VALUES
('11111111-1111-1111-1111-111111111111', 'EXT-001', 'Recepção', 'Pó Químico Seco', 4.00, 'Extintec', '2023-01-15', '2025-01-15', '2024-06-15', 'Extintor em bom estado'),
('11111111-1111-1111-1111-111111111111', 'EXT-002', 'Sala de Reuniões', 'CO2', 6.00, 'FireMax', '2023-03-20', '2028-03-20', '2024-07-10', 'Verificar pressão mensalmente'),
('11111111-1111-1111-1111-111111111111', 'EXT-003', 'Cozinha', 'Espuma Mecânica', 9.00, 'ProFire', '2022-11-10', '2024-11-10', '2024-05-05', 'ATENÇÃO: Vencimento próximo!')
ON CONFLICT (user_id, numero) DO NOTHING;

/*
=== INSTRUÇÕES ===

1. Execute este SQL completo no SQL Editor do Supabase
2. Teste o app - agora deve funcionar!
3. Login demo: demo@exemplo.com / 123456

Nota: RLS foi desabilitado para simplificar. Em produção,
implemente RLS adequado ou use autenticação nativa do Supabase.
*/
