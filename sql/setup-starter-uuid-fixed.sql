/*
=== SETUP COMPLETO + 50 EXTINTORES STARTER (UUID FIXO) ===
Execute este SQL completo no Supabase SQL Editor
*/

-- ================================================
-- PARTE 1: SETUP DA ESTRUTURA (se necessário)  
-- ================================================

-- Verificar e adicionar colunas de plano se não existirem
DO $$
BEGIN
    -- Adicionar coluna plan se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan') THEN
        ALTER TABLE users ADD COLUMN plan VARCHAR(20) DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise'));
    END IF;
    
    -- Adicionar coluna plan_status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan_status') THEN
        ALTER TABLE users ADD COLUMN plan_status VARCHAR(20) DEFAULT 'active' CHECK (plan_status IN ('active', 'expired', 'cancelled'));
    END IF;
    
    -- Adicionar coluna plan_expires_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan_expires_at') THEN
        ALTER TABLE users ADD COLUMN plan_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '30 days');
    END IF;
END $$;

-- ================================================
-- PARTE 2: LIMPAR DADOS DE TESTE EXISTENTES
-- ================================================

-- Limpar dados de teste existentes
DELETE FROM inspecoes WHERE user_id IN (
    SELECT id FROM users WHERE email = 'starter@test-plans.com'
);
DELETE FROM extintores WHERE user_id IN (
    SELECT id FROM users WHERE email = 'starter@test-plans.com'
);
DELETE FROM users WHERE email = 'starter@test-plans.com';

-- ================================================
-- PARTE 3: CRIAR USUÁRIO STARTER
-- ================================================

-- Criar usuário Starter com UUID fixo para facilitar referências
INSERT INTO users (id, email, password_hash, name, plan, plan_status, plan_expires_at)
VALUES ('12345678-1234-1234-1234-123456789012', 'starter@test-plans.com', 'MTIzNDU2c2FsdDEyMw==', 'Empresa Starter Teste', 'starter', 'active', (NOW() + INTERVAL '30 days'));

-- ================================================
-- PARTE 4: INSERIR 50 EXTINTORES (USANDO GENERATE_SERIES)
-- ================================================

-- Inserir EXATAMENTE 50 extintores com dados variados
INSERT INTO extintores (user_id, numero, local, tipo, peso, fabricante, data_fabricacao, data_vencimento, data_ultima_inspecao, observacoes) 
SELECT 
  '12345678-1234-1234-1234-123456789012',
  'EXT-S-' || LPAD(s::text, 3, '0'),
  CASE (s % 12)
    WHEN 0 THEN 'Recepção Principal'
    WHEN 1 THEN 'Sala de Reuniões' 
    WHEN 2 THEN 'Cozinha Industrial'
    WHEN 3 THEN 'Corredor A'
    WHEN 4 THEN 'Corredor B'
    WHEN 5 THEN 'Almoxarifado'
    WHEN 6 THEN 'Garagem'
    WHEN 7 THEN 'Área Externa'
    WHEN 8 THEN 'Escritório'
    WHEN 9 THEN 'Sala de TI'
    WHEN 10 THEN 'Refeitório'
    ELSE 'Depósito'
  END,
  CASE (s % 4)
    WHEN 0 THEN 'Pó Químico Seco'
    WHEN 1 THEN 'CO2'
    WHEN 2 THEN 'Espuma Mecânica'
    ELSE 'Água Pressurizada'  
  END,
  CASE (s % 4)
    WHEN 0 THEN 4.0
    WHEN 1 THEN 6.0
    WHEN 2 THEN 9.0
    ELSE 12.0
  END,
  CASE (s % 4)
    WHEN 0 THEN 'Extintec'
    WHEN 1 THEN 'FireMax'
    WHEN 2 THEN 'ProFire'
    ELSE 'Segurfire'
  END,
  (NOW() - INTERVAL '2 years' + (s * INTERVAL '5 days')),
  (NOW() + INTERVAL '3 years' + (s * INTERVAL '5 days')),
  (NOW() - INTERVAL '6 months' + (s * INTERVAL '3 days')),
  CASE (s % 5)
    WHEN 0 THEN 'Em bom estado'
    WHEN 1 THEN 'Verificar pressão'
    WHEN 2 THEN 'Limpeza necessária'
    WHEN 3 THEN 'Área de risco'
    ELSE NULL
  END
FROM generate_series(1, 50) AS s;

-- ================================================
-- PARTE 5: CRIAR USUÁRIO DEMO PARA COMPATIBILIDADE
-- ================================================

INSERT INTO users (id, email, password_hash, name, plan, plan_status, plan_expires_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'demo@exemplo.com', 'MTIzNDU2c2FsdDEyMw==', 'Usuário Demo', 'professional', 'active', (NOW() + INTERVAL '30 days'))
ON CONFLICT (email) 
DO UPDATE SET 
    plan = 'professional',
    plan_status = 'active',
    plan_expires_at = (NOW() + INTERVAL '30 days');

-- ================================================
-- PARTE 6: VERIFICAÇÃO FINAL
-- ================================================

-- Verificar resultado
SELECT 
    '🔥 CONFIGURAÇÃO COMPLETA!' as status;

SELECT 
    u.name as empresa,
    u.plan as plano,
    u.plan_status as status_plano,
    COUNT(e.id) as total_extintores,
    CASE 
        WHEN u.plan = 'starter' AND COUNT(e.id) = 50 THEN '✅ LIMITE EXATO ATINGIDO (50/50)'
        WHEN u.plan = 'starter' AND COUNT(e.id) < 50 THEN '⚠️ ABAIXO DO LIMITE'
        WHEN u.plan = 'starter' AND COUNT(e.id) > 50 THEN '❌ ACIMA DO LIMITE'
        ELSE '📊 OUTRO PLANO'
    END as status_teste
FROM users u
LEFT JOIN extintores e ON u.id = e.user_id
WHERE u.email IN ('starter@test-plans.com', 'demo@exemplo.com')
GROUP BY u.id, u.name, u.plan, u.plan_status
ORDER BY u.plan;

/*
🎯 TESTE PRONTO!

DADOS CRIADOS:
- ✅ Usuário: starter@test-plans.com / 123456  
- ✅ Plano: Starter (limite 50 extintores)
- ✅ Extintores: Exatamente 50 (dados realistas)

PRÓXIMO PASSO:
1. Execute este SQL no Supabase
2. Faça login como starter@test-plans.com
3. Tente criar o 51º extintor
4. Sistema deve bloquear com modal de upgrade

RESULTADO ESPERADO:
Empresa Starter Teste | starter | active | 50 | ✅ LIMITE EXATO ATINGIDO (50/50)
*/
