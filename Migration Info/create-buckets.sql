-- =====================================================
-- CRIAR BUCKETS ESTRUTURADOS
-- =====================================================
-- Execute isso no SQL Editor do Supabase Dashboard

-- 1. Bucket para Produtos Cosméticos
INSERT INTO storage.buckets (id, name, public)
VALUES ('damarie-products', 'damarie-products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Bucket para Mercadorias/Embalagens
INSERT INTO storage.buckets (id, name, public)
VALUES ('damarie-mercadorias', 'damarie-mercadorias', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Bucket para Presentes/Kits
INSERT INTO storage.buckets (id, name, public)
VALUES ('damarie-presentes', 'damarie-presentes', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Bucket para Documentos/Uploads Futuros
INSERT INTO storage.buckets (id, name, public)
VALUES ('damarie-documents', 'damarie-documents', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- CONFIGURAR POLÍTICAS DE ACESSO
-- =====================================================

-- Política para SELECT (ler arquivos públicos)
CREATE POLICY "Public Access - Products"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'damarie-products');

CREATE POLICY "Public Access - Mercadorias"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'damarie-mercadorias');

CREATE POLICY "Public Access - Presentes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'damarie-presentes');

CREATE POLICY "Public Access - Documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'damarie-documents');

-- Política para INSERT (fazer upload)
CREATE POLICY "Allow Upload - Products"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'damarie-products');

CREATE POLICY "Allow Upload - Mercadorias"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'damarie-mercadorias');

CREATE POLICY "Allow Upload - Presentes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'damarie-presentes');

CREATE POLICY "Allow Upload - Documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'damarie-documents');

-- Política para UPDATE (atualizar metadados)
CREATE POLICY "Allow Update - All"
  ON storage.objects FOR UPDATE
  USING (true);

-- Política para DELETE (deletar arquivos)
CREATE POLICY "Allow Delete - All"
  ON storage.objects FOR DELETE
  USING (true);
