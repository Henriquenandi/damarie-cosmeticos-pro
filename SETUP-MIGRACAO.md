# 🚀 MIGRAÇÃO DAMARIÊ COSMÉTICOS - Base44 → Supabase

## ✅ **PASSO 1: CONFIGURAR SUPABASE**

### 1.1 Criar Projeto Supabase
1. Acesse https://supabase.com
2. Crie novo projeto: `damarie-cosmeticos`
3. Região: South America (São Paulo)
4. Anote a senha do banco

### 1.2 Executar Schema
1. Vá em **SQL Editor** no Supabase
2. Execute o arquivo `Migration Info/supabase-schema.sql`
3. Aguarde criação das 14 tabelas

### 1.3 Configurar Storage
1. Vá em **Storage** → Create bucket
2. Nome: `damarie-files`
3. Public: ✅ Habilitado
4. Execute `Migration Info/storage-policies.sql` no SQL Editor

## ✅ **PASSO 2: CONFIGURAR PROJETO**

### 2.1 Instalar Dependências
```bash
npm install @supabase/supabase-js@^2.90.1
```

### 2.2 Configurar Variáveis
1. Copie `.env.example` para `.env`
2. Preencha com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 2.3 Migrar Dados
1. Use o Supabase Dashboard para importar CSVs:
   - Database → Tables → [tabela] → Insert → Import CSV
2. Siga a ordem em `Migration Info/data-migration-guide.sql`
3. Verifique se os dados foram importados

## ✅ **PASSO 3: ATUALIZAR CÓDIGO**

### 3.1 Substituir Imports Base44
Substitua em todos os arquivos:
```javascript
// DE:
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

// PARA:
import { useProducts, useCustomers, useSales } from '@/hooks/useSupabase';
```

### 3.2 Atualizar App.jsx
```javascript
// Substitua:
import { AuthProvider } from '@/lib/AuthContext';

// Por:
import { AuthProvider } from '@/lib/SupabaseAuthContext';
```

### 3.3 Atualizar Queries
```javascript
// DE:
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: () => base44.entities.Product.list(),
});

// PARA:
const { data: products } = useProducts();
```

## ✅ **PASSO 4: TESTAR FUNCIONALIDADES**

### 4.1 Executar Projeto
```bash
npm run dev
```

### 4.2 Verificar Páginas
- [ ] Dashboard carrega
- [ ] Produtos listam
- [ ] Clientes listam  
- [ ] Vendas funcionam
- [ ] Sem erros no console

## ✅ **PASSO 5: FUNCIONALIDADES ESPECÍFICAS**

### 5.1 Upload de Imagens
- Usar `supabaseHelpers.uploadFile('damarie-files', path, file)`
- Substituir `base44.integrations.Core.UploadFile`

### 5.2 Scanner de Catálogo (IA)
- Configurar OpenAI API key no `.env`
- Substituir `base44.integrations.Core.InvokeLLM`

### 5.3 Autenticação
- Implementar login/signup com Supabase Auth
- Configurar RLS policies conforme necessário

## ✅ **ARQUIVOS CRIADOS**

- ✅ `src/api/supabaseClient.js` - Cliente Supabase
- ✅ `src/hooks/useSupabase.js` - Hooks personalizados
- ✅ `src/lib/SupabaseAuthContext.jsx` - Contexto de auth
- ✅ `src/pages/DashboardSupabase.jsx` - Dashboard migrado
- ✅ `.env.example` - Template de variáveis
- ✅ `Migration Info/storage-policies.sql` - Políticas de storage
- ✅ `Migration Info/data-migration-guide.sql` - Guia de migração de dados

## 📋 **PRÓXIMOS PASSOS**

1. **Migrar componentes restantes** (Products, Sales, Customers, etc.)
2. **Implementar autenticação** completa
3. **Configurar upload** de imagens
4. **Testar todos os fluxos** críticos
5. **Deploy em produção**

## ⚠️ **IMPORTANTE**

- Mantenha o projeto Base44 funcionando até migração completa
- Teste cada funcionalidade após migração
- Faça backup dos dados antes de qualquer alteração
- Use o arquivo `Migration Info/MIGRATION-GUIDE.md` como referência detalhada

## 🆘 **SUPORTE**

Se encontrar problemas:
1. Verifique logs do Supabase Dashboard
2. Confirme variáveis de ambiente
3. Execute queries de verificação no SQL Editor
4. Consulte documentação do Supabase

**Status: ✅ Setup inicial completo - Pronto para migração dos componentes**