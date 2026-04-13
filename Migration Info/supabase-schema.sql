-- =====================================================
-- DAMARIÊ PRESENTES - SCHEMA SUPABASE
-- Migração completa do Base44 para Supabase
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CUSTOMERS (Clientes)
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    birth_date DATE,
    accepts_promotions BOOLEAN DEFAULT TRUE,
    notes TEXT,
    total_purchases DECIMAL(10,2) DEFAULT 0,
    credit_balance DECIMAL(10,2) DEFAULT 0,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. PRODUCTS (Produtos Cosméticos)
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand TEXT,
    code TEXT,
    category TEXT,
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 2,
    image_url TEXT,
    status TEXT DEFAULT 'em_estoque' CHECK (status IN ('em_estoque', 'sem_estoque', 'apenas_catalogo')),
    last_movement_date TIMESTAMPTZ,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. MERCADORIAS (Materiais/Embalagens)
-- =====================================================
CREATE TABLE mercadorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT DEFAULT 'UN',
    current_stock DECIMAL(10,3) DEFAULT 0,
    unit_cost DECIMAL(10,2),
    min_stock DECIMAL(10,3) DEFAULT 1,
    image_url TEXT,
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. SALES (Vendas)
-- =====================================================
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    items JSONB NOT NULL, -- Array de produtos vendidos
    total_amount DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2),
    profit DECIMAL(10,2),
    sale_type TEXT DEFAULT 'pronta_entrega' CHECK (sale_type IN ('pronta_entrega', 'encomenda')),
    payment_method TEXT CHECK (payment_method IN ('dinheiro', 'pix', 'cartao', 'fiado')),
    status TEXT DEFAULT 'concluida' CHECK (status IN ('concluida', 'pendente', 'cancelada')),
    sale_date TIMESTAMPTZ DEFAULT NOW(),
    voucher_code TEXT,
    voucher_discount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. INSTALLMENTS (Parcelas)
-- =====================================================
CREATE TABLE installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    installment_number INTEGER NOT NULL,
    total_installments INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
    payment_method TEXT,
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. VOUCHERS (Vouchers/Cupons)
-- =====================================================
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    origin TEXT CHECK (origin IN ('birthday', 'raffle', 'manual')),
    discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value DECIMAL(10,2),
    expiry_date DATE,
    minimum_purchase DECIMAL(10,2) DEFAULT 0,
    non_cumulative BOOLEAN DEFAULT TRUE,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'sent', 'used', 'expired', 'cancelled')),
    campaign_id UUID,
    sale_id UUID REFERENCES sales(id),
    sent_date TIMESTAMPTZ,
    used_date TIMESTAMPTZ,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. CAMPAIGNS (Campanhas/Sorteios)
-- =====================================================
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT DEFAULT 'raffle' CHECK (type IN ('raffle', 'promotion')),
    start_date DATE,
    end_date DATE,
    eligibility_type TEXT CHECK (eligibility_type IN ('all', 'with_purchase', 'date_range')),
    eligibility_date_start DATE,
    eligibility_date_end DATE,
    winner_count INTEGER DEFAULT 1,
    prize_discount_type TEXT CHECK (prize_discount_type IN ('fixed', 'percentage')),
    prize_discount_value DECIMAL(10,2),
    prize_validity_days INTEGER DEFAULT 30,
    prize_minimum_purchase DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. DRAW_RESULTS (Resultados de Sorteios)
-- =====================================================
CREATE TABLE draw_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_name TEXT,
    draw_date TIMESTAMPTZ DEFAULT NOW(),
    winners JSONB, -- Array de vencedores
    eligible_count INTEGER,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. PRESENTES (Kits/Presentes)
-- =====================================================
CREATE TABLE presentes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image_url TEXT,
    quantity INTEGER DEFAULT 1,
    cosmetic_items JSONB, -- Array de produtos cosméticos
    mercadoria_items JSONB, -- Array de mercadorias
    additional_costs JSONB, -- {labor: 0, other: 0}
    total_cost DECIMAL(10,2),
    margin_percentage DECIMAL(5,2),
    suggested_price DECIMAL(10,2),
    final_price DECIMAL(10,2),
    estimated_profit DECIMAL(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. STOCK_ENTRIES (Entradas de Estoque)
-- =====================================================
CREATE TABLE stock_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    product_name TEXT,
    quantity INTEGER NOT NULL,
    cost_price DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    entry_type TEXT DEFAULT 'purchase' CHECK (entry_type IN ('purchase', 'adjustment', 'return')),
    supplier TEXT,
    notes TEXT,
    entry_date TIMESTAMPTZ DEFAULT NOW(),
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 11. ENTRADA_MERCADORIA (Compra de Mercadorias)
-- =====================================================
CREATE TABLE entrada_mercadoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mercadoria_id UUID REFERENCES mercadorias(id),
    mercadoria_name TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    total_paid DECIMAL(10,2),
    unit_cost DECIMAL(10,2),
    supplier TEXT,
    entry_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 12. CONSUMO_MERCADORIA (Consumo de Mercadorias)
-- =====================================================
CREATE TABLE consumo_mercadoria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mercadoria_id UUID REFERENCES mercadorias(id),
    mercadoria_name TEXT,
    quantity DECIMAL(10,3) NOT NULL,
    reason TEXT CHECK (reason IN ('Kit', 'Ajuste', 'Perda')),
    cost_consumed DECIMAL(10,2),
    kit_id UUID REFERENCES presentes(id),
    consumption_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 13. CREDIT_PAYMENTS (Pagamentos de Fiado)
-- =====================================================
CREATE TABLE credit_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    sale_id UUID REFERENCES sales(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('dinheiro', 'pix', 'cartao')),
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 14. DESPESAS_MENSAIS (Despesas Mensais)
-- =====================================================
CREATE TABLE despesas_mensais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    category TEXT,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    recurrence TEXT CHECK (recurrence IN ('once', 'monthly', 'yearly')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    notes TEXT,
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES para Performance
-- =====================================================

-- Customers
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_birth_date ON customers(birth_date);
CREATE INDEX idx_customers_credit_balance ON customers(credit_balance) WHERE credit_balance > 0;

-- Products
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_code ON products(code);

-- Sales
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
CREATE INDEX idx_sales_sale_date ON sales(sale_date);
CREATE INDEX idx_sales_payment_method ON sales(payment_method);
CREATE INDEX idx_sales_status ON sales(status);

-- Installments
CREATE INDEX idx_installments_customer_id ON installments(customer_id);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_installments_status ON installments(status);

-- Vouchers
CREATE INDEX idx_vouchers_customer_id ON vouchers(customer_id);
CREATE INDEX idx_vouchers_code ON vouchers(code);
CREATE INDEX idx_vouchers_status ON vouchers(status);
CREATE INDEX idx_vouchers_expiry_date ON vouchers(expiry_date);

-- =====================================================
-- TRIGGERS para Updated_date
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_date_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_customers_updated_date BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_products_updated_date BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_mercadorias_updated_date BEFORE UPDATE ON mercadorias FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_sales_updated_date BEFORE UPDATE ON sales FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_installments_updated_date BEFORE UPDATE ON installments FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_vouchers_updated_date BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_campaigns_updated_date BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_draw_results_updated_date BEFORE UPDATE ON draw_results FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_presentes_updated_date BEFORE UPDATE ON presentes FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_stock_entries_updated_date BEFORE UPDATE ON stock_entries FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_entrada_mercadoria_updated_date BEFORE UPDATE ON entrada_mercadoria FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_consumo_mercadoria_updated_date BEFORE UPDATE ON consumo_mercadoria FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_credit_payments_updated_date BEFORE UPDATE ON credit_payments FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();
CREATE TRIGGER update_despesas_mensais_updated_date BEFORE UPDATE ON despesas_mensais FOR EACH ROW EXECUTE FUNCTION update_updated_date_column();

-- =====================================================
-- RLS (Row Level Security) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrada_mercadoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumo_mercadoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas_mensais ENABLE ROW LEVEL SECURITY;

-- Basic policies (allow all for authenticated users)
-- You can customize these based on your auth requirements

CREATE POLICY "Allow all for authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON mercadorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON sales FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON installments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON vouchers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON draw_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON presentes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON stock_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON entrada_mercadoria FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON consumo_mercadoria FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON credit_payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON despesas_mensais FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS para Lógica de Negócio
-- =====================================================

-- Function to generate voucher codes
CREATE OR REPLACE FUNCTION generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
BEGIN
    code := 'VOUCHER-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
    p_product_id UUID,
    p_quantity INTEGER,
    p_operation TEXT -- 'add' or 'subtract'
)
RETURNS VOID AS $$
BEGIN
    IF p_operation = 'add' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity + p_quantity,
            last_movement_date = NOW()
        WHERE id = p_product_id;
    ELSIF p_operation = 'subtract' THEN
        UPDATE products 
        SET stock_quantity = stock_quantity - p_quantity,
            last_movement_date = NOW()
        WHERE id = p_product_id;
    END IF;
    
    -- Update status based on stock
    UPDATE products 
    SET status = CASE 
        WHEN stock_quantity <= 0 THEN 'sem_estoque'
        ELSE 'em_estoque'
    END
    WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update customer credit balance
CREATE OR REPLACE FUNCTION update_customer_credit(
    p_customer_id UUID,
    p_amount DECIMAL(10,2),
    p_operation TEXT -- 'add' or 'subtract'
)
RETURNS VOID AS $$
BEGIN
    IF p_operation = 'add' THEN
        UPDATE customers 
        SET credit_balance = credit_balance + p_amount
        WHERE id = p_customer_id;
    ELSIF p_operation = 'subtract' THEN
        UPDATE customers 
        SET credit_balance = credit_balance - p_amount
        WHERE id = p_customer_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS para Relatórios
-- =====================================================

-- View for low stock products
CREATE VIEW low_stock_products AS
SELECT 
    id,
    name,
    brand,
    stock_quantity,
    min_stock,
    (min_stock - stock_quantity) as needed_quantity
FROM products 
WHERE stock_quantity <= min_stock 
AND status = 'em_estoque';

-- View for customers with credit balance
CREATE VIEW customers_with_credit AS
SELECT 
    id,
    name,
    phone,
    credit_balance,
    total_purchases
FROM customers 
WHERE credit_balance > 0
ORDER BY credit_balance DESC;

-- View for sales summary
CREATE VIEW sales_summary AS
SELECT 
    DATE(sale_date) as sale_day,
    COUNT(*) as total_sales,
    SUM(total_amount) as total_revenue,
    SUM(profit) as total_profit,
    AVG(total_amount) as avg_sale_value
FROM sales 
WHERE status = 'concluida'
GROUP BY DATE(sale_date)
ORDER BY sale_day DESC;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON DATABASE postgres IS 'Damariê Presentes - Sistema de Gestão de Loja de Cosméticos';
COMMENT ON TABLE customers IS 'Clientes da loja';
COMMENT ON TABLE products IS 'Produtos cosméticos para venda';
COMMENT ON TABLE mercadorias IS 'Materiais e embalagens para kits';
COMMENT ON TABLE sales IS 'Vendas realizadas';
COMMENT ON TABLE vouchers IS 'Vouchers/cupons de desconto';
COMMENT ON TABLE presentes IS 'Kits/presentes personalizados';