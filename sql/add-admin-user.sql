/*
=== ADICIONAR USUÁRIO ADMIN ===

Execute este SQL no SQL Editor do Supabase
*/

-- Criar coluna admin na tabela users se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='admin'
    ) THEN
        ALTER TABLE users ADD COLUMN admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Criar um usuário admin de teste
-- Senha: admin123 (hash: YWRtaW4xMjNzYWx0MTIz)
INSERT INTO users (email, password_hash, name, plan, admin) 
VALUES ('admin@teste.com', 'YWRtaW4xMjNzYWx0MTIz', 'Administrador', 'enterprise', TRUE)
ON CONFLICT (email) DO UPDATE SET 
    admin = TRUE,
    plan = 'enterprise';

-- Verificar se foi criado
SELECT email, name, plan, admin FROM users WHERE admin = TRUE;
