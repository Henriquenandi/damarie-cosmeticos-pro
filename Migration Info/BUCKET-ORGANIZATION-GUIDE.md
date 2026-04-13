# 🚀 PRÓXIMAS ETAPAS - ORGANIZAÇÃO DE STORAGE

## Fase 1: Criar os Buckets ✅ (PRIMEIRO)

1. **Acesse o Supabase Console**
   - URL: https://app.supabase.com
   - Seu projeto: `zmdezvhfkxlzudhguscv`

2. **Vá para Storage → SQL Editor**
   - Copie TODO o conteúdo de `Migration Info/create-buckets.sql`
   - Cole no SQL Editor
   - Clique em "Execute" (⚡)
   - ✅ Aguarde "Success" message

3. **Verifique a criação**
   - Vá para Storage → Buckets
   - Você deve ver 4 buckets novos:
     - `damarie-products` 
     - `damarie-mercadorias`
     - `damarie-presentes`
     - `damarie-documents`

---

## Fase 2: Reorganizar Imagens ✅ (DEPOIS)

Uma vez que os 4 buckets foram criados no Supabase:

```bash
# No terminal, na raiz do projeto
node "Migration Info/reorganize-images.js"
```

**O script fará:**
- 📊 Buscar todas as imagens no banco (product, mercadoria, presente)
- ⬇️ Baixar de `damarie-files`
- ⬆️ Subir pro bucket correto
- 🔄 Atualizar URLs no banco
- 🗑️ Deletar arquivos antigos

**Resultado esperado:**
```
========================================
📊 RESUMO FINAL
========================================
✅ Sucesso: 253
⏭️  Pulados: 0
❌ Erros: 0
📈 Total processado: 253
========================================

🎉 REORGANIZAÇÃO CONCLUÍDA COM SUCESSO!
```

---

## Fase 3: Atualizar Upload Function 🔄 (DEPOIS)

Modificar `src/api/supabaseClient.js` para fazer upload no bucket correto:

```javascript
// Antes de: export const base44 = { entities: ...

const getBucketForEntity = (entityType) => {
  const bucketMap = {
    'product': 'damarie-products',
    'mercadoria': 'damarie-mercadorias',
    'presente': 'damarie-presentes'
  };
  return bucketMap[entityType] || 'damarie-documents';
};

export const base44 = {
  entities: {
    // ... existing code ...
  },
  integrations: {
    Core: {
      async UploadFile({ file, entityType = 'product' }) {
        // Determinar bucket baseado no tipo de entidade
        const bucket = getBucketForEntity(entityType);
        
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${
          file.name.split('.').pop()
        }`;

        const { data, error } = await supabase
          .storage
          .from(bucket)
          .upload(fileName, file);

        if (error) throw error;

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
        
        return {
          name: file.name,
          size: file.size,
          url: publicUrl,
          path: data.path,
          bucket: bucket
        };
      }
    }
  }
};
```

---

## Resumo da Estrutura Final

```
Supabase Storage (zmdezvhfkxlzudhguscv)
├── damarie-products/          ← Imagens de cosméticos (219 arquivos)
├── damarie-mercadorias/       ← Imagens de embalagens (32 arquivos)
├── damarie-presentes/         ← Imagens de kits (2 arquivos)
└── damarie-documents/         ← Futuros uploads (documentos, etc)
```

---

## ⏱️ Tempo Estimado

- **Fase 1 (Criar buckets):** 1-2 minutos
- **Fase 2 (Reorganizar imagens):** 10-15 minutos (253 downloads + uploads)
- **Fase 3 (Atualizar código):** 3-5 minutos

---

## ✅ Checklist

- [ ] Acessou Supabase SQL Editor
- [ ] Executou create-buckets.sql
- [ ] Verificou os 4 buckets na Storage
- [ ] Rodou node reorganize-images.js
- [ ] Confirmou sucesso (253/253)
- [ ] Atualizou supabaseClient.js
- [ ] Testou upload de nova imagem

---

## 🔗 Referências

- **Arquivo de criação de buckets:** `Migration Info/create-buckets.sql`
- **Script de reorganização:** `Migration Info/reorganize-images.js`
- **Código do adapter:** `src/api/supabaseClient.js`

---

## ❓ Dúvidas?

- **Se um bucket já existe:** create-buckets.sql usa `ON CONFLICT DO NOTHING`
- **Se uma imagem falhar:** Script continua e mostra os erros ao final
- **Para reverter:** Restaurar backup antigo ou re-migrar do Base44

---

**Status Atual:** ⏳ Aguardando execução da Fase 1

