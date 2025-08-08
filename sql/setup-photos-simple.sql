-- ======================================
-- VERSÃO SIMPLIFICADA - SUPORTE A FOTOS
-- ======================================
-- Execute este SQL no SQL Editor do Supabase

-- 1. Adicionar colunas para fotos na tabela extintores
ALTER TABLE extintores 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_path TEXT;

-- 2. Criar índice para otimizar busca
CREATE INDEX IF NOT EXISTS idx_extintores_photo_url ON extintores(photo_url);

-- 3. Atualizar registros existentes com timestamp
UPDATE extintores 
SET updated_at = CURRENT_TIMESTAMP
WHERE updated_at IS NULL;

-- ======================================
-- CONFIGURAR STORAGE VIA INTERFACE
-- ======================================
/*
IMPORTANTE: Execute os próximos passos via interface do Supabase:

1. Vá em Storage > Buckets
2. Clique em "New bucket"
3. Configure:
   - Name: extintor-photos
   - Public bucket: ✅ Habilitado
   - File size limit: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp

4. Após criar o bucket, vá em Settings > Policies
5. Para o bucket extintor-photos, habilite:
   - SELECT para public (visualização)
   - INSERT para authenticated (upload)
   - UPDATE para authenticated (atualizar)
   - DELETE para authenticated (deletar)
*/

-- ======================================
-- VERIFICAÇÃO
-- ======================================

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'extintores' 
AND column_name IN ('photo_url', 'photo_path')
ORDER BY column_name;

-- ✅ PRONTO! Agora configure o Storage pela interface do Supabase
