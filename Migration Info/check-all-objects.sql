-- =============================================
-- VERIFICAR VIEWS E TABELAS EXISTENTES
-- =============================================

-- Ver todas as tabelas
SELECT 'TABELAS' as tipo, table_name as nome
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'

UNION ALL

-- Ver todas as views
SELECT 'VIEWS' as tipo, table_name as nome
FROM information_schema.views 
WHERE table_schema = 'public'

ORDER BY tipo, nome;