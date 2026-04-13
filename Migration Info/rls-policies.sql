-- =============================================
-- POLÍTICAS RLS BÁSICAS - DAMARIÊ COSMÉTICOS
-- =============================================

-- Habilitar RLS em todas as tabelas principais
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE product ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercadoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE presente ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesa_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumo_mercadoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrada_mercadoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_result ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS SIMPLES: USUÁRIOS AUTENTICADOS
-- =============================================

-- CUSTOMER
CREATE POLICY "Authenticated users can manage customer" ON customer
    FOR ALL USING (auth.role() = 'authenticated');

-- PRODUCT  
CREATE POLICY "Authenticated users can manage product" ON product
    FOR ALL USING (auth.role() = 'authenticated');

-- SALE
CREATE POLICY "Authenticated users can manage sale" ON sale
    FOR ALL USING (auth.role() = 'authenticated');

-- VOUCHER
CREATE POLICY "Authenticated users can manage voucher" ON voucher
    FOR ALL USING (auth.role() = 'authenticated');

-- MERCADORIA
CREATE POLICY "Authenticated users can manage mercadoria" ON mercadoria
    FOR ALL USING (auth.role() = 'authenticated');

-- PRESENTE
CREATE POLICY "Authenticated users can manage presente" ON presente
    FOR ALL USING (auth.role() = 'authenticated');

-- DESPESA MENSAL
CREATE POLICY "Authenticated users can manage despesa_mensal" ON despesa_mensal
    FOR ALL USING (auth.role() = 'authenticated');

-- STOCK ENTRY
CREATE POLICY "Authenticated users can manage stock_entry" ON stock_entry
    FOR ALL USING (auth.role() = 'authenticated');

-- CONSUMO MERCADORIA
CREATE POLICY "Authenticated users can manage consumo_mercadoria" ON consumo_mercadoria
    FOR ALL USING (auth.role() = 'authenticated');

-- ENTRADA MERCADORIA
CREATE POLICY "Authenticated users can manage entrada_mercadoria" ON entrada_mercadoria
    FOR ALL USING (auth.role() = 'authenticated');

-- CREDIT PAYMENT
CREATE POLICY "Authenticated users can manage credit_payment" ON credit_payment
    FOR ALL USING (auth.role() = 'authenticated');

-- DRAW RESULT
CREATE POLICY "Authenticated users can manage draw_result" ON draw_result
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- STORAGE POLICIES (se necessário)
-- =============================================

-- Permitir que usuários autenticados façam upload de arquivos
INSERT INTO storage.buckets (id, name, public) VALUES ('damarie-files', 'damarie-files', true);

CREATE POLICY "Authenticated users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can view files" ON storage.objects
    FOR SELECT USING (bucket_id = 'damarie-files');

CREATE POLICY "Authenticated users can update files" ON storage.objects
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete files" ON storage.objects
    FOR DELETE USING (auth.role() = 'authenticated');