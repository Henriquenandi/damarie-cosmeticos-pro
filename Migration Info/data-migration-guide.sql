-- =====================================================
-- MIGRAÇÃO DE DADOS - Base44 CSVs → Supabase
-- Execute APÓS criar o schema
-- =====================================================

-- Limpar dados existentes (se necessário)
-- TRUNCATE TABLE customers, products, sales, vouchers, mercadorias, presentes, 
-- stock_entries, entrada_mercadoria, consumo_mercadoria, credit_payments, 
-- despesas_mensais, campaigns, draw_results, installments CASCADE;

-- =====================================================
-- 1. MIGRAÇÃO DE CLIENTES (Customer_export.csv)
-- =====================================================

-- Você precisará fazer upload dos CSVs no Supabase Dashboard
-- Vá em: Database → Tables → customers → Insert → Import data from CSV

-- Mapeamento de campos:
-- name → name
-- phone → phone  
-- email → email
-- birth_date → birth_date
-- accepts_promotions → accepts_promotions
-- notes → notes
-- total_purchases → total_purchases
-- credit_balance → credit_balance
-- id → id (converter para UUID)
-- created_date → created_date
-- updated_date → updated_date

-- OU use este script SQL (ajuste os caminhos conforme necessário):

-- Exemplo de INSERT para clientes (adapte com seus dados):
/*
INSERT INTO customers (id, name, phone, email, birth_date, accepts_promotions, notes, total_purchases, credit_balance, created_date, updated_date)
VALUES 
  (gen_random_uuid(), 'Bruna', '(00) 00000-0000', '', '2026-01-23', true, '', 0, 0, '2026-01-23T11:31:26.642000', '2026-01-23T11:31:26.642000'),
  (gen_random_uuid(), 'Mariele Nandi', '48998506916', '', null, true, '', 0, 0, '2026-01-20T23:49:27.917000', '2026-01-20T23:49:27.917000'),
  (gen_random_uuid(), 'Valeriana', '', '', '1983-12-01', true, '', 56.9, 0, '2026-01-20T18:50:18.641000', '2026-01-20T18:51:10.219000');
*/

-- =====================================================
-- 2. MIGRAÇÃO DE PRODUTOS (Product_export.csv)
-- =====================================================

-- Mapeamento de campos:
-- name → name
-- brand → brand
-- code → code
-- category → category
-- cost_price → cost_price
-- selling_price → selling_price
-- stock_quantity → stock_quantity
-- image_url → image_url
-- status → status
-- min_stock → min_stock
-- last_movement_date → last_movement_date
-- id → id (converter para UUID)
-- created_date → created_date
-- updated_date → updated_date

-- =====================================================
-- 3. MIGRAÇÃO DE VENDAS (Sale_export.csv)
-- =====================================================

-- IMPORTANTE: As vendas têm estrutura JSON para items
-- Você precisará converter o campo items para JSONB

-- =====================================================
-- 4. MIGRAÇÃO DE VOUCHERS (Voucher_export.csv)
-- =====================================================

-- =====================================================
-- 5. MIGRAÇÃO DE MERCADORIAS (Mercadoria_export.csv)
-- =====================================================

-- =====================================================
-- 6. MIGRAÇÃO DE PRESENTES/KITS (Presente_export.csv)
-- =====================================================

-- =====================================================
-- 7. MIGRAÇÃO DE ENTRADAS DE ESTOQUE (StockEntry_export.csv)
-- =====================================================

-- =====================================================
-- 8. MIGRAÇÃO DE ENTRADA DE MERCADORIAS (EntradaMercadoria_export.csv)
-- =====================================================

-- =====================================================
-- 9. MIGRAÇÃO DE CONSUMO DE MERCADORIAS (ConsumoMercadoria_export.csv)
-- =====================================================

-- =====================================================
-- 10. MIGRAÇÃO DE PAGAMENTOS DE CRÉDITO (CreditPayment_export.csv)
-- =====================================================

-- =====================================================
-- 11. MIGRAÇÃO DE DESPESAS MENSAIS (DespesaMensal_export.csv)
-- =====================================================

-- =====================================================
-- 12. MIGRAÇÃO DE CAMPANHAS (Campaign_export.csv)
-- =====================================================

-- =====================================================
-- 13. MIGRAÇÃO DE RESULTADOS DE SORTEIOS (DrawResult_export.csv)
-- =====================================================

-- =====================================================
-- 14. MIGRAÇÃO DE PARCELAS (Installment_export.csv)
-- =====================================================

-- =====================================================
-- VERIFICAÇÃO DOS DADOS MIGRADOS
-- =====================================================

-- Verificar contagem de registros
SELECT 'customers' as tabela, COUNT(*) as total FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'sales', COUNT(*) FROM sales
UNION ALL
SELECT 'vouchers', COUNT(*) FROM vouchers
UNION ALL
SELECT 'mercadorias', COUNT(*) FROM mercadorias
UNION ALL
SELECT 'presentes', COUNT(*) FROM presentes
UNION ALL
SELECT 'stock_entries', COUNT(*) FROM stock_entries
UNION ALL
SELECT 'entrada_mercadoria', COUNT(*) FROM entrada_mercadoria
UNION ALL
SELECT 'consumo_mercadoria', COUNT(*) FROM consumo_mercadoria
UNION ALL
SELECT 'credit_payments', COUNT(*) FROM credit_payments
UNION ALL
SELECT 'despesas_mensais', COUNT(*) FROM despesas_mensais
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'draw_results', COUNT(*) FROM draw_results
UNION ALL
SELECT 'installments', COUNT(*) FROM installments;

-- Verificar alguns registros de exemplo
SELECT 'Primeiros 5 clientes:' as info;
SELECT name, phone, credit_balance FROM customers LIMIT 5;

SELECT 'Primeiros 5 produtos:' as info;
SELECT name, brand, selling_price, stock_quantity FROM products LIMIT 5;

-- =====================================================
-- INSTRUÇÕES DE USO
-- =====================================================

/*
COMO USAR ESTE SCRIPT:

1. MÉTODO RECOMENDADO - Upload via Dashboard:
   - Vá no Supabase Dashboard
   - Database → Tables → [nome_da_tabela]
   - Clique em "Insert" → "Import data from CSV"
   - Faça upload do CSV correspondente
   - Mapeie os campos corretamente

2. MÉTODO ALTERNATIVO - SQL Manual:
   - Copie os dados dos CSVs
   - Converta para formato SQL INSERT
   - Execute no SQL Editor

3. VERIFICAÇÃO:
   - Execute as queries de verificação no final
   - Confirme se os dados foram importados corretamente

ORDEM RECOMENDADA DE IMPORTAÇÃO:
1. customers
2. products  
3. mercadorias
4. vouchers
5. campaigns
6. sales (depende de customers, products, vouchers)
7. installments (depende de sales)
8. presentes
9. stock_entries (depende de products)
10. entrada_mercadoria (depende de mercadorias)
11. consumo_mercadoria (depende de mercadorias, presentes)
12. credit_payments (depende de customers, sales)
13. draw_results (depende de campaigns)
14. despesas_mensais

IMPORTANTE:
- Mantenha backup dos CSVs originais
- Teste com poucos registros primeiro
- Verifique os tipos de dados (especialmente datas e UUIDs)
- Campos JSON precisam ser formatados corretamente
*/