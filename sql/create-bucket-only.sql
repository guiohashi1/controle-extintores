-- ======================================
-- CRIAR APENAS O BUCKET (sem políticas)
-- ======================================

-- Criar bucket para fotos de extintores
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'extintor-photos',
    'extintor-photos',
    true,
    10485760,  -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Verificar se o bucket foi criado
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'extintor-photos';
