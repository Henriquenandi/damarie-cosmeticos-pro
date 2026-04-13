-- =====================================================
-- DAMARIÊ PRESENTES - MIGRAÇÃO DE DADOS
-- Scripts para importar dados do Base44 para Supabase
-- =====================================================

-- =====================================================
-- 1. MIGRAÇÃO DE CUSTOMERS
-- =====================================================

-- Primeiro, vamos inserir os clientes do CSV
INSERT INTO customers (name, phone, email, birth_date, accepts_promotions, notes, total_purchases, credit_balance)
VALUES 
    ('Marieli Rodrigues', '(48) 99805-7567', NULL, '1990-04-10', TRUE, NULL, 55, 55),
    ('Angélica Mazzuco', '(48) 99633-4957', NULL, '1994-01-17', TRUE, NULL, 36.7, 0),
    ('Larissa Antunes', '4899198983', NULL, '2002-07-12', TRUE, NULL, 0, 0),
    ('Paula de Faveri', '(48) 98800-4277', NULL, '1991-12-18', TRUE, NULL, 16, 0),
    ('Tami Cunha', '(35) 38302-48366', NULL, '1989-12-07', TRUE, NULL, 895.7, 0),
    ('Tabita', '(48) 99977-7465', NULL, '1989-07-04', TRUE, NULL, 0, 0);

-- =====================================================
-- 2. MIGRAÇÃO DE PRODUCTS
-- =====================================================

-- Inserir produtos do CSV (amostra dos principais)
INSERT INTO products (name, brand, code, category, cost_price, selling_price, stock_quantity, min_stock, image_url, status, last_movement_date)
VALUES 
    ('Esfoliante Blumen', 'Outro', NULL, 'Corpo', 24, 35, 0, 2, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/80127619a_image.jpg', 'sem_estoque', '2026-01-19T20:53:30.425Z'),
    ('Body baby', 'O Boticário', '59132', 'Infantil', 81.52, 95.9, 0, 2, NULL, 'sem_estoque', '2026-01-19T20:18:37.575Z'),
    ('Malbec', 'O Boticário', '84387', 'Masculino', 178.42, 209.9, 0, 2, NULL, 'sem_estoque', '2026-01-19T20:17:31.327Z'),
    ('Lily presente', 'O Boticário', '86167', 'Outro', 254.92, 299.9, 0, 2, NULL, 'sem_estoque', '2026-01-19T20:17:32.242Z'),
    ('Boti baby', 'O Boticário', '51801', 'Infantil', 29.66, 49.9, 0, 2, NULL, 'sem_estoque', '2026-01-19T20:17:32.649Z'),
    ('Esponja coxinha para maquiagem', 'Outro', NULL, 'Maquiagem', 2.49, 5, 4, 2, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/87e4af563_image.jpg', 'em_estoque', NULL),
    ('Tesoura aço mandala', 'Outro', NULL, 'Outro', 5.64, 12, 1, 2, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/47d148ed2_image.jpg', 'em_estoque', NULL),
    ('Gel para sobrancelhas', 'Outro', NULL, 'Outro', 10.99, 22, 1, 2, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/a3be71f19_image.jpg', 'em_estoque', NULL),
    ('Lápis para sobrancelhas', 'Outro', NULL, 'Maquiagem', 7.99, 16, 1, 2, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/7bd680be3_image.jpg', 'em_estoque', '2026-01-19T19:55:41.214Z'),
    ('Serum facial vitamina c bela', 'Outro', NULL, 'Rosto', 7.99, 20, 0, 2, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/fa649f0f1_image.jpg', 'sem_estoque', '2026-01-19T20:53:30.827Z');

-- =====================================================
-- 3. MIGRAÇÃO DE MERCADORIAS
-- =====================================================

INSERT INTO mercadorias (name, category, unit, current_stock, unit_cost, min_stock, image_url, notes)
VALUES 
    ('Caixote', 'Outro', 'UN', 2, 7, 1, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/7ce3a6493_image.jpg', 'Bom preço'),
    ('Toalha lavabo', 'Outro', 'UN', 1, 3.99, 1, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/3d7099da3_image.jpg', 'Bom preço'),
    ('Caneca chopp 385ml', 'Outro', 'UN', 1, 14, 1, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/bca2f287f_image.jpg', 'Bom preço'),
    ('Toalhinha de mão', 'Outro', 'UN', 2, 3.25, 3, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/0138ec7ac_image.jpg', NULL),
    ('Maleta com visor', 'Enfeite', 'UN', 7, 5.84, 3, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/58de6cf63_image.jpg', NULL),
    ('Cestas quadrada "com amor" 15x15x4', 'Outro', 'UN', 4, 7.5, 4, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/307422c47_image.jpg', 'Shopeee'),
    ('Caixa 15x15x4', 'Caixa', 'UN', 15, 2.86, 10, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/1e5d3dfab_image.jpg', 'Shopee'),
    ('Sacola plástica 40x50', 'Outro', 'UN', 12, 1.61, 7, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/466c4f3d5_image.jpg', 'Shopee'),
    ('Etiqueta para presente', 'Outro', 'UN', 100, 0.049, 100, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/ffa68ed49_image.jpg', 'Doci festas'),
    ('Papel de seda 49x69', 'Papel', 'UN', 100, 0.529, 100, 'https://base44.app/api/apps/695c5f50ab63f5b9b84216d1/files/public/695c5f50ab63f5b9b84216d1/6026a50a1_image.jpg', 'Doci festas');

-- =====================================================
-- 4. MIGRAÇÃO DE VOUCHERS
-- =====================================================

-- Primeiro, vamos buscar o ID da cliente Angélica
DO $$
DECLARE
    angelica_id UUID;
BEGIN
    SELECT id INTO angelica_id FROM customers WHERE name = 'Angélica Mazzuco';
    
    INSERT INTO vouchers (code, customer_id, customer_name, origin, discount_type, discount_value, expiry_date, minimum_purchase, non_cumulative, status, sent_date)
    VALUES (
        generate_voucher_code(),
        angelica_id,
        'Angélica Mazzuco',
        'birthday',
        'fixed',
        15,
        '2026-02-18',
        0,
        TRUE,
        'sent',
        '2026-01-20T12:49:21.602Z'
    );
END $$;

-- =====================================================
-- 5. MIGRAÇÃO DE SALES
-- =====================================================

-- Vamos criar as vendas com os IDs corretos dos clientes e produtos
DO $$
DECLARE
    marieli_id UUID;
    angelica_id UUID;
    tami_id UUID;
    paula_id UUID;
    esfoliante_id UUID;
    serum_id UUID;
    refil_shampoo_id UUID;
    body_baby_id UUID;
    malbec_id UUID;
    lily_id UUID;
    boti_baby1_id UUID;
    boti_baby2_id UUID;
    lapiz_id UUID;
BEGIN
    -- Buscar IDs dos clientes
    SELECT id INTO marieli_id FROM customers WHERE name = 'Marieli Rodrigues';
    SELECT id INTO angelica_id FROM customers WHERE name = 'Angélica Mazzuco';
    SELECT id INTO tami_id FROM customers WHERE name = 'Tami Cunha';
    SELECT id INTO paula_id FROM customers WHERE name = 'Paula de Faveri';
    
    -- Buscar IDs dos produtos
    SELECT id INTO esfoliante_id FROM products WHERE name = 'Esfoliante Blumen';
    SELECT id INTO serum_id FROM products WHERE name = 'Serum facial vitamina c bela';
    SELECT id INTO body_baby_id FROM products WHERE name = 'Body baby';
    SELECT id INTO malbec_id FROM products WHERE name = 'Malbec';
    SELECT id INTO lily_id FROM products WHERE name = 'Lily presente';
    SELECT id INTO lapiz_id FROM products WHERE name = 'Lápis para sobrancelhas';
    
    -- Venda 1: Marieli Rodrigues (Fiado)
    INSERT INTO sales (customer_id, customer_name, items, total_amount, total_cost, profit, sale_type, payment_method, status, sale_date)
    VALUES (
        marieli_id,
        'Marieli Rodrigues',
        jsonb_build_array(
            jsonb_build_object('product_id', esfoliante_id, 'product_name', 'Esfoliante Blumen', 'quantity', 1, 'unit_price', 35, 'cost_price', 24, 'subtotal', 35),
            jsonb_build_object('product_id', serum_id, 'product_name', 'Serum facial vitamina c bela', 'quantity', 1, 'unit_price', 20, 'cost_price', 7.99, 'subtotal', 20)
        ),
        55,
        31.99,
        23.01,
        'pronta_entrega',
        'fiado',
        'pendente',
        '2026-01-19T20:53:29.859Z'
    );
    
    -- Venda 2: Angélica Mazzuco (Cartão)
    INSERT INTO sales (customer_id, customer_name, items, total_amount, total_cost, profit, sale_type, payment_method, status, sale_date)
    VALUES (
        angelica_id,
        'Angélica Mazzuco',
        jsonb_build_array(
            jsonb_build_object('product_id', (SELECT id FROM products WHERE name LIKE '%shampoo mmbb%' LIMIT 1), 'product_name', 'Refil shampoo mmbb', 'quantity', 1, 'unit_price', 36.7, 'cost_price', 20.23, 'subtotal', 36.7)
        ),
        36.7,
        20.23,
        16.47,
        'pronta_entrega',
        'cartao',
        'concluida',
        '2026-01-19T20:33:14.097Z'
    );
    
    -- Venda 3: Tami Cunha (PIX) - Body baby
    INSERT INTO sales (customer_id, customer_name, items, total_amount, total_cost, profit, sale_type, payment_method, status, sale_date)
    VALUES (
        tami_id,
        'Tami Cunha',
        jsonb_build_array(
            jsonb_build_object('product_id', body_baby_id, 'product_name', 'Body baby', 'quantity', 1, 'unit_price', 95.9, 'cost_price', 81.52, 'subtotal', 95.9)
        ),
        95.9,
        81.52,
        14.38,
        'pronta_entrega',
        'pix',
        'concluida',
        '2026-01-19T20:18:37.088Z'
    );
    
    -- Venda 4: Tami Cunha (PIX) - Venda grande
    INSERT INTO sales (customer_id, customer_name, items, total_amount, total_cost, profit, sale_type, payment_method, status, sale_date)
    VALUES (
        tami_id,
        'Tami Cunha',
        jsonb_build_array(
            jsonb_build_object('product_id', malbec_id, 'product_name', 'Malbec', 'quantity', 1, 'unit_price', 209.9, 'cost_price', 178.42, 'subtotal', 209.9),
            jsonb_build_object('product_id', lily_id, 'product_name', 'Lily presente', 'quantity', 1, 'unit_price', 299.9, 'cost_price', 254.92, 'subtotal', 299.9),
            jsonb_build_object('product_id', (SELECT id FROM products WHERE name = 'Boti baby' AND cost_price = 29.66 LIMIT 1), 'product_name', 'Boti baby', 'quantity', 1, 'unit_price', 49.9, 'cost_price', 29.66, 'subtotal', 49.9),
            jsonb_build_object('product_id', (SELECT id FROM products WHERE name = 'Boti baby' AND cost_price = 25.42 LIMIT 1), 'product_name', 'Boti baby', 'quantity', 1, 'unit_price', 43.9, 'cost_price', 25.42, 'subtotal', 43.9)
        ),
        603.6,
        488.42,
        115.18,
        'pronta_entrega',
        'pix',
        'concluida',
        '2026-01-19T20:17:30.876Z'
    );
    
    -- Venda 5: Venda avulsa (Dinheiro)
    INSERT INTO sales (customer_id, customer_name, items, total_amount, total_cost, profit, sale_type, payment_method, status, sale_date)
    VALUES (
        NULL,
        NULL,
        jsonb_build_array(
            jsonb_build_object('product_id', (SELECT id FROM products WHERE name LIKE '%Colônia velvet%' LIMIT 1), 'product_name', 'Colônia velvet', 'quantity', 1, 'unit_price', 124.9, 'cost_price', 71.18, 'subtotal', 124.9)
        ),
        124.9,
        71.18,
        53.72,
        'pronta_entrega',
        'dinheiro',
        'concluida',
        '2026-01-19T20:08:12.987Z'
    );
    
    -- Venda 6: Paula de Faveri (PIX)
    INSERT INTO sales (customer_id, customer_name, items, total_amount, total_cost, profit, sale_type, payment_method, status, sale_date)
    VALUES (
        paula_id,
        'Paula de Faveri',
        jsonb_build_array(
            jsonb_build_object('product_id', lapiz_id, 'product_name', 'Lápis para sobrancelhas', 'quantity', 1, 'unit_price', 16, 'cost_price', 7.99, 'subtotal', 16)
        ),
        16,
        7.99,
        8.01,
        'pronta_entrega',
        'pix',
        'concluida',
        '2026-01-19T19:55:40.793Z'
    );
END $$;

-- =====================================================
-- 6. ATUALIZAR ESTATÍSTICAS DOS CLIENTES
-- =====================================================

-- Atualizar total_purchases baseado nas vendas
UPDATE customers 
SET total_purchases = (
    SELECT COALESCE(SUM(total_amount), 0) 
    FROM sales 
    WHERE sales.customer_id = customers.id 
    AND sales.status = 'concluida'
);

-- Atualizar credit_balance para clientes com vendas fiado pendentes
UPDATE customers 
SET credit_balance = (
    SELECT COALESCE(SUM(total_amount), 0) 
    FROM sales 
    WHERE sales.customer_id = customers.id 
    AND sales.payment_method = 'fiado' 
    AND sales.status = 'pendente'
);

-- =====================================================
-- 7. CRIAR ALGUMAS DESPESAS MENSAIS DE EXEMPLO
-- =====================================================

INSERT INTO despesas_mensais (description, category, amount, payment_date, recurrence, status)
VALUES 
    ('Aluguel da loja', 'Fixo', 1200.00, CURRENT_DATE, 'monthly', 'paid'),
    ('Energia elétrica', 'Utilidades', 180.00, CURRENT_DATE - INTERVAL '5 days', 'monthly', 'paid'),
    ('Internet', 'Utilidades', 89.90, CURRENT_DATE - INTERVAL '10 days', 'monthly', 'paid'),
    ('Contador', 'Serviços', 300.00, CURRENT_DATE + INTERVAL '15 days', 'monthly', 'pending'),
    ('Seguro da loja', 'Segurança', 150.00, CURRENT_DATE + INTERVAL '20 days', 'monthly', 'pending');

-- =====================================================
-- 8. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se os dados foram inseridos corretamente
SELECT 'Customers' as tabela, COUNT(*) as total FROM customers
UNION ALL
SELECT 'Products' as tabela, COUNT(*) as total FROM products
UNION ALL
SELECT 'Mercadorias' as tabela, COUNT(*) as total FROM mercadorias
UNION ALL
SELECT 'Sales' as tabela, COUNT(*) as total FROM sales
UNION ALL
SELECT 'Vouchers' as tabela, COUNT(*) as total FROM vouchers
UNION ALL
SELECT 'Despesas' as tabela, COUNT(*) as total FROM despesas_mensais;

-- Verificar produtos com estoque baixo
SELECT name, stock_quantity, min_stock 
FROM products 
WHERE stock_quantity <= min_stock;

-- Verificar clientes com crédito
SELECT name, credit_balance, total_purchases 
FROM customers 
WHERE credit_balance > 0;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este script migra os dados essenciais do Base44 para o Supabase
-- Mantenha os IDs originais se necessário para referências externas
-- Execute este script após criar o schema principal
-- Teste todas as funcionalidades após a migração