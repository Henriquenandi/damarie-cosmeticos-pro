-- =====================================================
-- STORAGE POLICIES - Execute APÓS criar o bucket
-- =====================================================

-- Política para permitir upload de imagens (usuários autenticados)
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir acesso público às imagens
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'damarie-files');

-- Política para permitir update de imagens (usuários autenticados)
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir delete de imagens (usuários autenticados)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (auth.role() = 'authenticated');