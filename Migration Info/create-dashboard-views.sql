-- =============================================
-- CRIAR VIEWS ÚTEIS PARA O DASHBOARD
-- =============================================

-- View para produtos com estoque baixo
CREATE VIEW low_stock_products AS
SELECT 
    id,
    name,
    brand,
    stock_quantity,
    min_stock,
    (min_stock - stock_quantity) as needed_quantity,
    selling_price,
    cost_price
FROM product 
WHERE stock_quantity <= min_stock 
AND status = 'em_estoque';

-- View para clientes com saldo em fiado
CREATE VIEW customers_with_credit AS
SELECT 
    id,
    name,
    phone,
    credit_balance,
    total_purchases,
    created_date
FROM customer 
WHERE credit_balance > 0
ORDER BY credit_balance DESC;

-- View para resumo de vendas por dia
CREATE VIEW sales_summary AS
SELECT 
    DATE(sale_date) as sale_day,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    SUM(profit) as total_profit,
    AVG(total_amount) as avg_sale_value,
    COUNT(CASE WHEN payment_method = 'fiado' THEN 1 END) as credit_sales,
    SUM(CASE WHEN payment_method = 'fiado' THEN total_amount ELSE 0 END) as credit_amount
FROM sale 
WHERE status = 'concluida'
GROUP BY DATE(sale_date)
ORDER BY sale_day DESC;

-- View para produtos mais vendidos (últimos 30 dias)
CREATE VIEW top_selling_products AS
SELECT 
    p.id,
    p.name,
    p.brand,
    p.selling_price,
    COUNT(s.id) as sales_count,
    SUM(CASE WHEN s.items::text LIKE '%"product_id":"' || p.id || '"%' THEN 1 ELSE 0 END) as times_sold
FROM product p
LEFT JOIN sale s ON s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
    AND s.items::text LIKE '%"product_id":"' || p.id || '"%'
WHERE p.status IN ('em_estoque', 'apenas_catalogo')
GROUP BY p.id, p.name, p.brand, p.selling_price
HAVING COUNT(s.id) > 0
ORDER BY times_sold DESC, sales_count DESC
LIMIT 10;

-- View para métricas do dashboard
CREATE VIEW dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM customer) as total_customers,
    (SELECT COUNT(*) FROM product WHERE status = 'em_estoque') as products_in_stock,
    (SELECT COUNT(*) FROM sale WHERE DATE(sale_date) = CURRENT_DATE) as today_sales,
    (SELECT COALESCE(SUM(total_amount), 0) FROM sale WHERE DATE(sale_date) = CURRENT_DATE) as today_revenue,
    (SELECT COUNT(*) FROM sale WHERE sale_date >= CURRENT_DATE - INTERVAL '7 days') as week_sales,
    (SELECT COALESCE(SUM(total_amount), 0) FROM sale WHERE sale_date >= CURRENT_DATE - INTERVAL '7 days') as week_revenue,
    (SELECT COUNT(*) FROM sale WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days') as month_sales,
    (SELECT COALESCE(SUM(total_amount), 0) FROM sale WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days') as month_revenue,
    (SELECT COALESCE(SUM(profit), 0) FROM sale WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days') as month_profit,
    (SELECT COUNT(*) FROM low_stock_products) as low_stock_count,
    (SELECT COALESCE(SUM(credit_balance), 0) FROM customer WHERE credit_balance > 0) as total_credit;