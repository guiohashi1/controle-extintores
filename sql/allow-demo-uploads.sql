-- Política alternativa para permitir uploads de usuários demo (anônimos)
-- Execute este SQL no Supabase Dashboard

-- Criar política que permite upload tanto para autenticados quanto anônimos
-- mas apenas para o bucket extintor-photos
DROP POLICY IF EXISTS "Allow demo users to upload photos" ON storage.objects;

CREATE POLICY "Allow demo users to upload photos"
ON storage.objects FOR INSERT 
TO public
WITH CHECK (bucket_id = 'extintor-photos'::text);

-- Verificar se a política foi criada
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname = 'Allow demo users to upload photos';
