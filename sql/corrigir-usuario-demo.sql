-- SQL para corrigir o usuário demo com hash correto
-- Execute este comando no SQL Editor do Supabase

-- Primeiro, vamos verificar o usuário atual
SELECT id, email, name, subscription, password_hash FROM users WHERE email = 'demo@exemplo.com';

-- Agora vamos atualizar com o hash correto para a senha '123456'
-- Hash correto: btoa('123456' + 'salt123') = 'MTIzNDU2c2FsdDEyMw=='
UPDATE users 
SET 
    password_hash = 'MTIzNDU2c2FsdDEyMw==',
    name = 'Usuário Demo',
    subscription = 'professional'
WHERE email = 'demo@exemplo.com';

-- Se o usuário não existir, vamos criá-lo
INSERT INTO users (id, email, password_hash, name, subscription) VALUES
('11111111-1111-1111-1111-111111111111', 'demo@exemplo.com', 'MTIzNDU2c2FsdDEyMw==', 'Usuário Demo', 'professional')
ON CONFLICT (email) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  subscription = EXCLUDED.subscription;

-- Verificar se foi atualizado corretamente
SELECT id, email, name, subscription, password_hash FROM users WHERE email = 'demo@exemplo.com';

-- Informações para debug:
-- Senha: 123456
-- Salt: salt123
-- String concatenada: 123456salt123
-- Base64 da string: MTIzNDU2c2FsdDEyMw==
