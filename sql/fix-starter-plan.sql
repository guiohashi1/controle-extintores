-- SQL para corrigir o plano do usuário Starter de teste
-- Execute este comando no Supabase SQL Editor se necessário

-- Atualizar usuário starter para ter plano ativo
UPDATE users 
SET 
    plan = 'starter',
    plan_status = 'active',
    plan_expires_at = '2025-12-31 23:59:59'
WHERE email = 'starter@test-plans.com';

-- Verificar se o usuário foi atualizado
SELECT id, name, email, plan, plan_status, plan_expires_at 
FROM users 
WHERE email = 'starter@test-plans.com';
