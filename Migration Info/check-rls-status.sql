-- =============================================
-- VERIFICAR STATUS DAS POLÍTICAS RLS
-- =============================================

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasrls as has_rls_policies
FROM pg_tables 
LEFT JOIN pg_class ON pg_class.relname = pg_tables.tablename
WHERE schemaname = 'public' 
AND tablename IN (
    'customers', 'products', 'sales', 'vouchers', 
    'mercadorias', 'presentes', 'campaigns', 
    'installments', 'despesas_mensais', 'stock_entries',
    'consumo_mercadoria', 'entrada_mercadoria', 
    'credit_payments', 'draw_results'
)
ORDER BY tablename;

-- Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;