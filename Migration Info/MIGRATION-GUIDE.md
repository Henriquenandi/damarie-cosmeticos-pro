# 🚀 Guia de Migração Base44 → Supabase

## Damariê Presentes - Setup Completo

Este guia te ajudará a migrar completamente do Base44 para Supabase, mantendo todas as funcionalidades.

---

## 📋 **PRÉ-REQUISITOS**

- [ ] Conta no Supabase (https://supabase.com)
- [ ] Node.js 18+ instalado
- [ ] Dados exportados do Base44 (CSVs)
- [ ] Acesso ao projeto atual React

---

## 🎯 **PASSO 1: CONFIGURAÇÃO DO SUPABASE**

### 1.1 Criar Projeto Supabase

1. Acesse https://supabase.com e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Configure:
   - **Name**: `damarie-presentes`
   - **Database Password**: (anote esta senha!)
   - **Region**: South America (São Paulo)
5. Clique em "Create new project"
6. Aguarde a criação (2-3 minutos)

### 1.2 Obter Credenciais

1. No dashboard do projeto, vá em **Settings** → **API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (mantenha secreta!)

### 1.3 Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas credenciais:
```env
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

---

## 🗄️ **PASSO 2: CRIAÇÃO DO SCHEMA**

### 2.1 Executar Schema Principal

1. No Supabase Dashboard, vá em **SQL Editor**
2. Clique em "New query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (pode demorar 1-2 minutos)

### 2.2 Verificar Criação das Tabelas

Execute esta query para verificar:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Você deve ver 14 tabelas criadas.

---

## 📊 **PASSO 3: MIGRAÇÃO DOS DADOS**

### 3.1 Executar Script de Migração

1. No SQL Editor, crie uma nova query
2. Copie todo o conteúdo do arquivo `supabase-migration.sql`
3. Execute o script
4. Verifique se não há erros

### 3.2 Verificar Dados Migrados

Execute para verificar:
```sql
-- Verificar contagem de registros
SELECT 'customers' as tabela, COUNT(*) as total FROM customers
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'sales', COUNT(*) FROM sales;
```

---

## 🔧 **PASSO 4: CONFIGURAÇÃO DO STORAGE**

### 4.1 Criar Bucket para Imagens

1. Vá em **Storage** no dashboard
2. Clique em "Create bucket"
3. Configure:
   - **Name**: `damarie-files`
   - **Public**: ✅ Habilitado
4. Clique em "Create bucket"

### 4.2 Configurar Políticas de Storage

Execute no SQL Editor:
```sql
-- Política para permitir upload de imagens
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir acesso público às imagens
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT USING (bucket_id = 'damarie-files');
```

---

## ⚙️ **PASSO 5: ATUALIZAÇÃO DO CÓDIGO**

### 5.1 Verificar Dependências

Certifique-se de que o `package.json` tem:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.90.1",
    "@tanstack/react-query": "^5.84.1"
  }
}
```

### 5.2 Testar Conexão

Execute o projeto:
```bash
npm run dev
```

Acesse http://localhost:5173 e verifique se:
- [ ] Dashboard carrega sem erros
- [ ] Dados aparecem corretamente
- [ ] Não há erros no console

---

## 🔄 **PASSO 6: SUBSTITUIR INTEGRAÇÕES BASE44**

### 6.1 Scanner de Catálogo (IA)

Para substituir `base44.integrations.Core.InvokeLLM`:

1. Crie conta na OpenAI (https://openai.com)
2. Obtenha API key
3. Adicione no `.env`:
```env
VITE_OPENAI_API_KEY=sua-openai-key
```

4. Atualize o código do scanner (arquivo será fornecido separadamente)

### 6.2 Upload de Arquivos

Para substituir `base44.integrations.Core.UploadFile`:

1. Use o Supabase Storage configurado
2. O código já está preparado para isso
3. Teste fazendo upload de uma imagem de produto

### 6.3 Autenticação

Para substituir `base44.auth`:

1. Configure autenticação no Supabase:
   - Vá em **Authentication** → **Settings**
   - Configure providers (Email, Google, etc.)
2. Atualize o `AuthContext.jsx` (código será fornecido)

---

## 📱 **PASSO 7: TESTES FUNCIONAIS**

### 7.1 Testar Funcionalidades Principais

- [ ] **Dashboard**: Métricas e alertas
- [ ] **Produtos**: Listar, criar, editar
- [ ] **Clientes**: Listar, criar, editar
- [ ] **Vendas**: Nova venda, histórico
- [ ] **Estoque**: Entrada, controle
- [ ] **Vouchers**: Gerar, aplicar
- [ ] **Kits**: Criar, calcular preços
- [ ] **Relatórios**: Gráficos e dados

### 7.2 Testar Fluxos Críticos

1. **Fluxo de Venda Completo**:
   - Adicionar produtos
   - Selecionar cliente
   - Aplicar voucher
   - Finalizar venda
   - Verificar estoque atualizado

2. **Fluxo de Fiado**:
   - Venda fiado
   - Verificar crédito do cliente
   - Fazer pagamento
   - Verificar baixa do crédito

3. **Fluxo de Kit**:
   - Criar kit
   - Adicionar produtos e mercadorias
   - Calcular preço
   - Vender kit
   - Verificar baixa de estoque

---

## 🚀 **PASSO 8: DEPLOY EM PRODUÇÃO**

### 8.1 Preparar para Deploy

1. Configure variáveis de produção no `.env.production`:
```env
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-producao
NODE_ENV=production
```

2. Build do projeto:
```bash
npm run build
```

### 8.2 Deploy Options

**Opção 1: Vercel (Recomendado)**
```bash
npm install -g vercel
vercel --prod
```

**Opção 2: Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Opção 3: Supabase Hosting**
- Configure no dashboard do Supabase
- Conecte seu repositório GitHub

---

## 🔍 **PASSO 9: MONITORAMENTO E BACKUP**

### 9.1 Configurar Backup Automático

No Supabase Dashboard:
1. Vá em **Settings** → **Database**
2. Configure backup automático
3. Defina retenção de 7 dias

### 9.2 Monitoramento

1. Configure alertas no Supabase
2. Monitore uso de storage
3. Acompanhe performance das queries

---

## ⚠️ **TROUBLESHOOTING**

### Problemas Comuns

**Erro de Conexão**:
- Verifique URL e chaves no `.env`
- Confirme que o projeto Supabase está ativo

**Erro de RLS (Row Level Security)**:
- Verifique se as policies estão criadas
- Confirme autenticação funcionando

**Imagens não carregam**:
- Verifique configuração do Storage
- Confirme policies de acesso público

**Dados não aparecem**:
- Execute queries de verificação
- Confirme migração completa

### Logs e Debug

Para debug, adicione no `.env`:
```env
VITE_DEBUG=true
```

E monitore o console do navegador.

---

## 📞 **SUPORTE**

Se encontrar problemas:

1. Verifique os logs do Supabase Dashboard
2. Consulte a documentação: https://supabase.com/docs
3. Execute queries de verificação fornecidas
4. Documente erros específicos para análise

---

## ✅ **CHECKLIST FINAL**

- [ ] Supabase projeto criado e configurado
- [ ] Schema executado com sucesso
- [ ] Dados migrados corretamente
- [ ] Storage configurado
- [ ] Aplicação funcionando localmente
- [ ] Testes funcionais passando
- [ ] Deploy em produção realizado
- [ ] Backup configurado
- [ ] Monitoramento ativo

**🎉 Parabéns! Sua migração do Base44 para Supabase está completa!**