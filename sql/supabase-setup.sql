/*
=== CONFIGURAÇÃO DO SUPABASE ===

1. Acesse: https://supabase.com
2. Clique em "Start your project" 
3. Faça login com GitHub/Google
4. Clique em "New Project"
5. Preencha:
   - Name: controle-extintores
   - Database Password: (crie uma senha forte)
   - Region: South America (São Paulo)
6. Clique em "Create new project"

Aguarde ~2 minutos para o projeto ser criado.

=== ESTRUTURA DO BANCO DE DADOS ===

Após criar o projeto, vá em "SQL Editor" e execute os comandos abaixo:
*/

-- 1. Tabela de usuários
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  subscription VARCHAR(50) DEFAULT 'basic' CHECK (subscription IN ('basic', 'professional', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de extintores
CREATE TABLE extintores (
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

-- 3. Tabela de inspeções
CREATE TABLE inspecoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  extintor_id UUID REFERENCES extintores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  data_inspecao DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('válido', 'vencido', 'precisa_inspecao')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_extintores_updated_at BEFORE UPDATE ON extintores
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Políticas de segurança (RLS - Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE extintores ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecoes ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver seus próprios dados
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Extintores só podem ser vistos pelo dono
CREATE POLICY "Users can view own extintores" ON extintores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own extintores" ON extintores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own extintores" ON extintores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own extintores" ON extintores FOR DELETE USING (auth.uid() = user_id);

-- Inspeções só podem ser vistas pelo dono
CREATE POLICY "Users can view own inspecoes" ON inspecoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inspecoes" ON inspecoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inspecoes" ON inspecoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inspecoes" ON inspecoes FOR DELETE USING (auth.uid() = user_id);

-- 6. Inserir usuário demo para testes
INSERT INTO users (id, email, password_hash, name, subscription) VALUES
('11111111-1111-1111-1111-111111111111', 'demo@exemplo.com', '$2b$10$K1U7C5zF3mY8QZZ1Q2Z1Q2Z1Q2Z1Q2Z1Q2Z1Q2Z1Q2Z1Q2Z1Q2Z1Q2', 'Usuário Demo', 'professional');

/*
=== APÓS EXECUTAR O SQL ===

1. Vá em "Settings" > "API"
2. Copie:
   - Project URL: https://xxxxxxxxxxx.supabase.co
   - anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
3. Cole essas informações no arquivo supabase-config.js

=== PRÓXIMOS PASSOS ===
1. Executar SQL acima
2. Copiar URL e chave do projeto
3. Atualizar configuração no JavaScript
4. Testar conexão
*/
