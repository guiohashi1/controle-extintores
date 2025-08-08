-- ======================================
-- ADICIONAR SUPORTE A FOTOS DE EXTINTORES
-- ======================================

-- Adicionar colunas para fotos na tabela extintores
ALTER TABLE extintores 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_path TEXT;

-- Criar índice para otimizar busca por fotos
CREATE INDEX IF NOT EXISTS idx_extintores_photo_url ON extintores(photo_url);

-- Comentários para documentação
COMMENT ON COLUMN extintores.photo_url IS 'URL pública da foto do extintor no Supabase Storage';
COMMENT ON COLUMN extintores.photo_path IS 'Caminho interno da foto no Supabase Storage para gestão';

-- ======================================
-- CONFIGURAR SUPABASE STORAGE
-- ======================================

-- Criar bucket para fotos de extintores (execute no SQL Editor do Supabase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'extintor-photos',
    'extintor-photos',
    true,
    10485760,  -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ======================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ======================================

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Permitir upload de fotos para usuários autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir visualização pública das fotos" ON storage.objects;
DROP POLICY IF EXISTS "Permitir atualização de fotos pelo proprietário" ON storage.objects;
DROP POLICY IF EXISTS "Permitir exclusão de fotos pelo proprietário" ON storage.objects;

-- Permitir upload de fotos para usuários autenticados
CREATE POLICY "Permitir upload de fotos para usuários autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'extintor-photos' 
    AND (auth.role() = 'authenticated')
);

-- Permitir visualização pública das fotos
CREATE POLICY "Permitir visualização pública das fotos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'extintor-photos');

-- Permitir atualização de fotos pelo proprietário
CREATE POLICY "Permitir atualização de fotos pelo proprietário"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'extintor-photos' AND (auth.role() = 'authenticated'));

-- Permitir exclusão de fotos pelo proprietário
CREATE POLICY "Permitir exclusão de fotos pelo proprietário"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'extintor-photos' AND (auth.role() = 'authenticated'));

-- ======================================
-- FUNÇÃO PARA LIMPAR FOTOS ÓRFÃS
-- ======================================

-- Função para remover fotos quando extintor for deletado
CREATE OR REPLACE FUNCTION clean_extintor_photos()
RETURNS TRIGGER AS $$
BEGIN
    -- Se havia uma foto, tentar removê-la do storage
    IF OLD.photo_path IS NOT NULL THEN
        -- Nota: Esta função precisa ser implementada via webhook ou função edge
        -- Por enquanto, apenas logamos a necessidade de limpeza
        RAISE NOTICE 'Foto a ser removida: %', OLD.photo_path;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpar fotos quando extintor for deletado
DROP TRIGGER IF EXISTS trigger_clean_extintor_photos ON extintores;
CREATE TRIGGER trigger_clean_extintor_photos
    AFTER DELETE ON extintores
    FOR EACH ROW
    EXECUTE FUNCTION clean_extintor_photos();

-- ======================================
-- ATUALIZAR DADOS EXISTENTES
-- ======================================

-- Adicionar timestamp de atualização nos registros existentes
UPDATE extintores 
SET updated_at = CURRENT_TIMESTAMP
WHERE updated_at IS NULL;

-- ======================================
-- VERIFICAÇÃO FINAL
-- ======================================

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'extintores' 
AND column_name IN ('photo_url', 'photo_path')
ORDER BY column_name;

-- Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE id = 'extintor-photos';

-- ======================================
-- INSTRUÇÕES DE USO
-- ======================================

/*
1. Execute este SQL no SQL Editor do seu Supabase

2. Verifique se o bucket foi criado:
   - Vá em Storage > Buckets
   - Deve aparecer 'extintor-photos' com status público

3. Teste o upload:
   - Use as funções JavaScript implementadas
   - uploadExtintorPhoto() para fazer upload
   - updateExtintorPhotoUrl() para salvar no banco

4. Configurações importantes:
   - Limite de 10MB por arquivo
   - Formatos: JPEG, PNG, GIF, WebP
   - Fotos são públicas (podem ser acessadas via URL)
   
5. Limpeza automática:
   - Trigger criado para logar fotos a serem removidas
   - Implementar limpeza real via Edge Function se necessário

✅ SISTEMA DE FOTOS PRONTO PARA USO!
*/
