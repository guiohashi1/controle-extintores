/*
=== SETUP COMPLETO + 50 EXTINTORES STARTER ===
Execute este SQL completo no Supabase SQL Editor
*/

-- ================================================
-- PARTE 1: SETUP DA ESTRUTURA (se necessário)  
-- ================================================

-- Remover políticas antigas se existirem
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
-- PARTE 2: LIMPAR E CRIAR DADOS DE TESTE
-- ================================================

-- Limpar dados de teste existentes
DELETE FROM inspecoes WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@test-plans.com'
);
DELETE FROM extintores WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@test-plans.com'  
);
DELETE FROM users WHERE email LIKE '%@test-plans.com';

-- ================================================
-- PARTE 3: CRIAR USUÁRIO STARTER COM 50 EXTINTORES
-- ================================================

-- Criar usuário Starter
INSERT INTO users (id, email, password_hash, name, plan, plan_status, plan_expires_at)
VALUES ('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'starter@test-plans.com', 'MTIzNDU2c2FsdDEyMw==', 'Empresa Starter Teste', 'starter', 'active', (NOW() + INTERVAL '30 days'));

-- Inserir EXATAMENTE 50 extintores (limite do plano Starter)
INSERT INTO extintores (user_id, numero, local, tipo, peso, fabricante, data_fabricacao, data_vencimento, data_ultima_inspecao, observacoes)
VALUES
-- Extintores 1-10: Recepção e áreas comuns
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-001', 'Recepção Principal', 'Pó Químico Seco', 4.0, 'Extintec', '2022-01-15', '2027-01-15', '2024-06-15', 'Em bom estado'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-002', 'Hall de Entrada', 'CO2', 6.0, 'FireMax', '2022-02-01', '2027-02-01', '2024-06-20', 'Verificar pressão'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-003', 'Sala de Espera', 'Espuma Mecânica', 9.0, 'ProFire', '2022-02-15', '2027-02-15', '2024-07-01', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-004', 'Corredor Principal', 'Pó Químico Seco', 4.0, 'Segurfire', '2022-03-01', '2027-03-01', '2024-07-15', 'Limpeza necessária'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-005', 'Portaria', 'CO2', 6.0, 'Extintec', '2022-03-15', '2027-03-15', '2024-08-01', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-006', 'Área de Fumantes', 'Água Pressurizada', 12.0, 'FireMax', '2022-04-01', '2027-04-01', '2024-08-15', 'Extintor novo'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-007', 'Estacionamento Coberto', 'Pó Químico Seco', 4.0, 'ProFire', '2022-04-15', '2027-04-15', '2024-07-30', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-008', 'Guarita', 'CO2', 6.0, 'Segurfire', '2022-05-01', '2027-05-01', '2024-08-10', 'Funcional'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-009', 'Área de Lazer', 'Espuma Mecânica', 9.0, 'Extintec', '2022-05-15', '2027-05-15', '2024-08-05', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-010', 'Jardim Interno', 'Água Pressurizada', 12.0, 'FireMax', '2022-06-01', '2027-06-01', '2024-07-20', 'Área externa'),

-- Extintores 11-20: Escritórios
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-011', 'Sala de Reuniões A', 'Pó Químico Seco', 4.0, 'ProFire', '2022-06-15', '2027-06-15', '2024-08-12', 'Escritório'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-012', 'Sala de Reuniões B', 'CO2', 6.0, 'Segurfire', '2022-07-01', '2027-07-01', '2024-08-18', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-013', 'Sala de Diretoria', 'Espuma Mecânica', 9.0, 'Extintec', '2022-07-15', '2027-07-15', '2024-08-20', 'Área VIP'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-014', 'Sala de Treinamento', 'Pó Químico Seco', 4.0, 'FireMax', '2022-08-01', '2027-08-01', '2024-08-25', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-015', 'Open Space', 'CO2', 6.0, 'ProFire', '2022-08-15', '2027-08-15', '2024-08-30', 'Área coletiva'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-016', 'Sala de RH', 'Água Pressurizada', 12.0, 'Segurfire', '2022-09-01', '2027-09-01', '2024-09-05', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-017', 'Sala Financeiro', 'Pó Químico Seco', 4.0, 'Extintec', '2022-09-15', '2027-09-15', '2024-09-10', 'Confidencial'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-018', 'Sala de TI', 'CO2', 6.0, 'FireMax', '2022-10-01', '2027-10-01', '2024-09-15', 'Equipamentos'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-019', 'Biblioteca', 'Espuma Mecânica', 9.0, 'ProFire', '2022-10-15', '2027-10-15', '2024-09-20', 'Livros e docs'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-020', 'Arquivo Morto', 'Pó Químico Seco', 4.0, 'Segurfire', '2022-11-01', '2027-11-01', '2024-09-25', NULL),

-- Extintores 21-30: Cozinha e área de serviço
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-021', 'Cozinha Industrial', 'Espuma Mecânica', 9.0, 'Extintec', '2022-11-15', '2027-11-15', '2024-10-01', 'Área de risco'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-022', 'Despensa', 'Pó Químico Seco', 4.0, 'FireMax', '2022-12-01', '2027-12-01', '2024-10-05', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-023', 'Refeitório', 'CO2', 6.0, 'ProFire', '2022-12-15', '2027-12-15', '2024-10-10', 'Área social'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-024', 'Copa', 'Água Pressurizada', 12.0, 'Segurfire', '2023-01-01', '2028-01-01', '2024-10-15', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-025', 'Área de Limpeza', 'Pó Químico Seco', 4.0, 'Extintec', '2023-01-15', '2028-01-15', '2024-10-20', 'Produtos químicos'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-026', 'Vestiário Masculino', 'CO2', 6.0, 'FireMax', '2023-02-01', '2028-02-01', '2024-10-25', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-027', 'Vestiário Feminino', 'Espuma Mecânica', 9.0, 'ProFire', '2023-02-15', '2028-02-15', '2024-10-30', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-028', 'Lavanderia', 'Pó Químico Seco', 4.0, 'Segurfire', '2023-03-01', '2028-03-01', '2024-11-05', 'Área úmida'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-029', 'Depósito Geral', 'CO2', 6.0, 'Extintec', '2023-03-15', '2028-03-15', '2024-11-10', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-030', 'Área de Serviço', 'Água Pressurizada', 12.0, 'FireMax', '2023-04-01', '2028-04-01', '2024-11-15', NULL),

-- Extintores 31-40: Corredores e escadas
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-031', 'Corredor Leste', 'Pó Químico Seco', 4.0, 'ProFire', '2023-04-15', '2028-04-15', '2024-11-20', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-032', 'Corredor Oeste', 'CO2', 6.0, 'Segurfire', '2023-05-01', '2028-05-01', '2024-11-25', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-033', 'Escada A - Piso 1', 'Espuma Mecânica', 9.0, 'Extintec', '2023-05-15', '2028-05-15', '2024-12-01', 'Rota de fuga'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-034', 'Escada A - Piso 2', 'Pó Químico Seco', 4.0, 'FireMax', '2023-06-01', '2028-06-01', '2024-12-05', 'Rota de fuga'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-035', 'Escada B - Piso 1', 'CO2', 6.0, 'ProFire', '2023-06-15', '2028-06-15', '2024-12-10', 'Emergência'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-036', 'Escada B - Piso 2', 'Água Pressurizada', 12.0, 'Segurfire', '2023-07-01', '2028-07-01', '2024-12-15', 'Emergência'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-037', 'Hall Elevadores', 'Pó Químico Seco', 4.0, 'Extintec', '2023-07-15', '2028-07-15', '2024-12-20', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-038', 'Saída de Emergência A', 'CO2', 6.0, 'FireMax', '2023-08-01', '2028-08-01', '2024-12-25', 'Saída crítica'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-039', 'Saída de Emergência B', 'Espuma Mecânica', 9.0, 'ProFire', '2023-08-15', '2028-08-15', '2024-12-30', 'Saída crítica'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-040', 'Corredor Central', 'Pó Químico Seco', 4.0, 'Segurfire', '2023-09-01', '2028-09-01', '2025-01-05', NULL),

-- Extintores 41-50: Áreas especiais e complementares
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-041', 'Sala de Máquinas', 'CO2', 6.0, 'Extintec', '2023-09-15', '2028-09-15', '2025-01-10', 'Área técnica'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-042', 'Casa de Força', 'Pó Químico Seco', 4.0, 'FireMax', '2023-10-01', '2028-10-01', '2025-01-15', 'Energia elétrica'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-043', 'Quadro Elétrico', 'CO2', 6.0, 'ProFire', '2023-10-15', '2028-10-15', '2025-01-20', 'Eletricidade'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-044', 'Gerador', 'Espuma Mecânica', 9.0, 'Segurfire', '2023-11-01', '2028-11-01', '2025-01-25', 'Combustível'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-045', 'Ar Condicionado Central', 'Água Pressurizada', 12.0, 'Extintec', '2023-11-15', '2028-11-15', '2025-01-30', NULL),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-046', 'Almoxarifado A', 'Pó Químico Seco', 4.0, 'FireMax', '2023-12-01', '2028-12-01', '2025-02-05', 'Materiais'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-047', 'Almoxarifado B', 'CO2', 6.0, 'ProFire', '2023-12-15', '2028-12-15', '2025-02-10', 'Estoque'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-048', 'Garagem Interna', 'Espuma Mecânica', 9.0, 'Segurfire', '2024-01-01', '2029-01-01', '2025-02-15', 'Veículos'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-049', 'Área de Carga/Descarga', 'Pó Químico Seco', 4.0, 'Extintec', '2024-01-15', '2029-01-15', '2025-02-20', 'Logística'),
('aaaaaaaa-bbbb-cccc-dddd-000000000001', 'EXT-S-050', 'Terraço/Cobertura', 'Água Pressurizada', 12.0, 'FireMax', '2024-02-01', '2029-02-01', '2025-02-25', 'Área externa');

-- ================================================
-- PARTE 4: CRIAR USUÁRIO DEMO PARA COMPATIBILIDADE
-- ================================================

INSERT INTO users (id, email, password_hash, name, plan, plan_status, plan_expires_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'demo@exemplo.com', 'MTIzNDU2c2FsdDEyMw==', 'Usuário Demo', 'professional', 'active', (NOW() + INTERVAL '30 days'))
ON CONFLICT (email) 
DO UPDATE SET 
    plan = 'professional',
    plan_status = 'active',
    plan_expires_at = (NOW() + INTERVAL '30 days');

-- ================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ================================================

-- Verificar se tudo foi criado corretamente
SELECT 
    '🔥 CONFIGURAÇÃO COMPLETA - RESULTADOS:' as status;

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
    END as status_limite
FROM users u
LEFT JOIN extintores e ON u.id = e.user_id
WHERE u.email IN ('starter@test-plans.com', 'demo@exemplo.com')
GROUP BY u.id, u.name, u.plan, u.plan_status
ORDER BY u.plan;

/*
🎯 PRÓXIMOS PASSOS APÓS EXECUTAR ESTE SQL:

1. LOGIN DE TESTE:
   - Email: starter@test-plans.com
   - Senha: 123456
   - Plano: Starter (50/50 extintores)

2. TESTE DE LIMITE:
   - Tente criar o 51º extintor
   - Sistema deve bloquear com modal de upgrade
   
3. INTERFACES DE TESTE:
   - App principal: http://localhost:8000
   - Teste interativo: http://localhost:8000/test-real.html
   - Painel admin: http://localhost:8000/admin/

✅ RESULTADO ESPERADO:
Empresa Starter Teste | starter | active | 50 extintores | ✅ LIMITE EXATO ATINGIDO (50/50)
*/
