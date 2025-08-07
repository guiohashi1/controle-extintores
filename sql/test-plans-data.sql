/*
=== DADOS DE TESTE PARA VALIDAÇÃO DE PLANOS ===
Execute este SQL após o supabase-setup-fixed.sql
*/

-- Limpar dados de teste existentes
DELETE FROM inspecoes WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test-plans.com'
);
DELETE FROM extintores WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test-plans.com'  
);
DELETE FROM users WHERE email LIKE '%@test-plans.com';

-- Criar usuários de teste para cada plano
INSERT INTO users (id, email, password_hash, name, plan, plan_status, plan_expires_at) VALUES
-- Usuário Starter - 45 extintores (próximo do limite de 50)
('test-starter-001', 'starter@test-plans.com', 'MTIzNDU2c2FsdDEyMw==', 'Empresa Starter Teste', 'starter', 'active', (NOW() + INTERVAL '30 days')),

-- Usuário Professional - 150 extintores (75% do limite de 200)
('test-professional-001', 'professional@test-plans.com', 'MTIzNDU2c2FsdDEyMw==', 'Empresa Professional Teste', 'professional', 'active', (NOW() + INTERVAL '30 days')),

-- Usuário Enterprise - 300 extintores (ilimitado)
('test-enterprise-001', 'enterprise@test-plans.com', 'MTIzNDU2c2FsdDEyMw==', 'Empresa Enterprise Teste', 'enterprise', 'active', (NOW() + INTERVAL '30 days')),

-- Usuário com plano vencido
('test-expired-001', 'expired@test-plans.com', 'MTIzNDU2c2FsdDEyMw==', 'Empresa Vencida Teste', 'professional', 'expired', (NOW() - INTERVAL '7 days'));

-- Criar extintores para usuário STARTER (50 extintores - LIMITE EXATO)
DELETE FROM extintores WHERE user_id = 'test-starter-001';

INSERT INTO extintores (user_id, numero, local, tipo, peso, fabricante, data_fabricacao, data_vencimento, data_ultima_inspecao) 
SELECT 
  'test-starter-001',
  'EXT-S-' || LPAD(generate_series(1, 50)::text, 3, '0'),
  CASE (generate_series(1, 50) % 8)
    WHEN 0 THEN 'Recepção'
    WHEN 1 THEN 'Sala Reuniões'  
    WHEN 2 THEN 'Cozinha'
    WHEN 3 THEN 'Corredor A'
    WHEN 4 THEN 'Corredor B'
    WHEN 5 THEN 'Almoxarifado'
    WHEN 6 THEN 'Garagem'
    ELSE 'Área Externa'
  END,
  CASE (generate_series(1, 50) % 4)
    WHEN 0 THEN 'Pó Químico Seco'
    WHEN 1 THEN 'CO2'
    WHEN 2 THEN 'Espuma Mecânica'
    ELSE 'Água Pressurizada'  
  END,
  CASE (generate_series(1, 50) % 4)
    WHEN 0 THEN 4.0
    WHEN 1 THEN 6.0
    WHEN 2 THEN 9.0
    ELSE 12.0
  END,
  CASE (generate_series(1, 50) % 4)
    WHEN 0 THEN 'Extintec'
    WHEN 1 THEN 'FireMax'
    WHEN 2 THEN 'ProFire'
    ELSE 'Segurfire'
  END,
  (NOW() - INTERVAL '2 years' + (generate_series(1, 50) * INTERVAL '5 days')),
  (NOW() + INTERVAL '3 years' + (generate_series(1, 50) * INTERVAL '5 days')),
  (NOW() - INTERVAL '6 months' + (generate_series(1, 50) * INTERVAL '5 days'));

-- Criar extintores para usuário PROFESSIONAL (150 extintores - 75% do limite) 
INSERT INTO extintores (user_id, numero, local, tipo, peso, fabricante, data_fabricacao, data_vencimento, data_ultima_inspecao)
SELECT 
  'test-professional-001',
  'EXT-P-' || LPAD(generate_series(1, 150)::text, 3, '0'),
  CASE (generate_series(1, 150) % 8)
    WHEN 0 THEN 'Setor A'
    WHEN 1 THEN 'Setor B'
    WHEN 2 THEN 'Setor C'  
    WHEN 3 THEN 'Escritório'
    WHEN 4 THEN 'Produção'
    WHEN 5 THEN 'Estoque'
    WHEN 6 THEN 'Laboratório'
    ELSE 'Pátio Externo'
  END,
  CASE (generate_series(1, 150) % 4)
    WHEN 0 THEN 'Pó Químico Seco'
    WHEN 1 THEN 'CO2'
    WHEN 2 THEN 'Espuma Mecânica'
    ELSE 'Água Pressurizada'
  END,
  CASE (generate_series(1, 150) % 4)
    WHEN 0 THEN 4.0
    WHEN 1 THEN 6.0  
    WHEN 2 THEN 9.0
    ELSE 12.0
  END,
  CASE (generate_series(1, 150) % 4)
    WHEN 0 THEN 'Extintec'
    WHEN 1 THEN 'FireMax'
    WHEN 2 THEN 'ProFire'
    ELSE 'Segurfire'
  END,
  (NOW() - INTERVAL '1 year' + (generate_series(1, 150) * INTERVAL '2 days')),
  (NOW() + INTERVAL '4 years' + (generate_series(1, 150) * INTERVAL '2 days')),
  (NOW() - INTERVAL '3 months' + (generate_series(1, 150) * INTERVAL '2 days'));

-- Criar extintores para usuário ENTERPRISE (300 extintores - ilimitado)
INSERT INTO extintores (user_id, numero, local, tipo, peso, fabricante, data_fabricacao, data_vencimento, data_ultima_inspecao)
SELECT 
  'test-enterprise-001',
  'EXT-E-' || LPAD(generate_series(1, 300)::text, 3, '0'),
  CASE (generate_series(1, 300) % 12)
    WHEN 0 THEN 'Torre A - Piso 1'
    WHEN 1 THEN 'Torre A - Piso 2'
    WHEN 2 THEN 'Torre A - Piso 3'
    WHEN 3 THEN 'Torre B - Piso 1'
    WHEN 4 THEN 'Torre B - Piso 2'
    WHEN 5 THEN 'Torre B - Piso 3'
    WHEN 6 THEN 'Subsolo'
    WHEN 7 THEN 'Cobertura'
    WHEN 8 THEN 'Data Center'
    WHEN 9 THEN 'Auditório'
    WHEN 10 THEN 'Refeitório'
    ELSE 'Estacionamento'
  END,
  CASE (generate_series(1, 300) % 5)
    WHEN 0 THEN 'Pó Químico Seco'
    WHEN 1 THEN 'CO2'  
    WHEN 2 THEN 'Espuma Mecânica'
    WHEN 3 THEN 'Água Pressurizada'
    ELSE 'Pó Químico Especial'
  END,
  CASE (generate_series(1, 300) % 5)
    WHEN 0 THEN 4.0
    WHEN 1 THEN 6.0
    WHEN 2 THEN 9.0
    WHEN 3 THEN 12.0
    ELSE 25.0
  END,
  CASE (generate_series(1, 300) % 5)
    WHEN 0 THEN 'Extintec'
    WHEN 1 THEN 'FireMax' 
    WHEN 2 THEN 'ProFire'
    WHEN 3 THEN 'Segurfire'
    ELSE 'MegaFire'
  END,
  (NOW() - INTERVAL '6 months' + (generate_series(1, 300) * INTERVAL '1 day')),
  (NOW() + INTERVAL '5 years' + (generate_series(1, 300) * INTERVAL '1 day')),
  (NOW() - INTERVAL '2 months' + (generate_series(1, 300) * INTERVAL '1 day'));

-- Criar alguns extintores vencidos para testes de relatórios
UPDATE extintores SET data_vencimento = (NOW() - INTERVAL '30 days') 
WHERE user_id = 'test-starter-001' AND numero IN ('EXT-S-001', 'EXT-S-002', 'EXT-S-003');

UPDATE extintores SET data_vencimento = (NOW() - INTERVAL '15 days')
WHERE user_id = 'test-professional-001' AND numero IN ('EXT-P-001', 'EXT-P-002', 'EXT-P-003', 'EXT-P-004', 'EXT-P-005');

-- Adicionar inspeções de teste
INSERT INTO inspecoes (extintor_id, user_id, data_inspecao, status, observacoes)
SELECT 
  e.id,
  e.user_id,
  (NOW() - INTERVAL '1 month' + (random() * INTERVAL '30 days')),
  CASE (random() * 3)::int
    WHEN 0 THEN 'válido'
    WHEN 1 THEN 'vencido' 
    ELSE 'precisa_inspecao'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Extintor em bom estado'
    WHEN 1 THEN 'Necessita limpeza'
    WHEN 2 THEN 'Verificar pressão'
    ELSE NULL
  END
FROM extintores e
WHERE e.user_id IN ('test-starter-001', 'test-professional-001', 'test-enterprise-001')
AND random() < 0.3; -- 30% dos extintores terão inspeções

-- Verificar dados criados
SELECT 
  u.name as empresa,
  u.plan as plano,
  u.plan_status as status,
  u.plan_expires_at as vencimento,
  COUNT(e.id) as total_extintores
FROM users u
LEFT JOIN extintores e ON u.id = e.user_id
WHERE u.email LIKE '%@test-plans.com'
GROUP BY u.id, u.name, u.plan, u.plan_status, u.plan_expires_at
ORDER BY u.plan;

/*
RESULTADOS ESPERADOS:
- Empresa Starter Teste | starter | active | 45 extintores
- Empresa Professional Teste | professional | active | 150 extintores  
- Empresa Enterprise Teste | enterprise | active | 300 extintores
- Empresa Vencida Teste | professional | expired | 0 extintores
*/
