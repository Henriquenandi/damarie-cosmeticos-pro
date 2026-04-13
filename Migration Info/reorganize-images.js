#!/usr/bin/env node

/**
 * SCRIPT DE REORGANIZAÇÃO DE IMAGENS
 * Mover imagens para buckets estruturados
 * damarie-files → damarie-products, damarie-mercadorias, damarie-presentes
 * 
 * Uso: node reorganize-images.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// =====================================================
// CONFIGURAÇÕES
// =====================================================

const SUPABASE_URL = 'https://zmdezvhfkxlzudhguscv.supabase.co';
const STORAGE_BUCKET_OLD = 'damarie-files';
const STORAGE_BUCKETS = {
  product: 'damarie-products',
  mercadoria: 'damarie-mercadorias',
  presente: 'damarie-presentes'
};

// Lê do .env
const envPath = path.join(__dirname, '../.env');
const env = {};

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .forEach(line => {
      const [key, value] = line.split('=');
      env[key.trim()] = value.trim();
    });
}

const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Erro: VITE_SUPABASE_ANON_KEY não encontrado no .env');
  process.exit(1);
}

// =====================================================
// UTILITÁRIOS
// =====================================================

// API REST do Supabase
async function supabaseRequest(method, endpoint, body = null) {
  const url = new URL(endpoint, SUPABASE_URL);
  
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        } else {
          resolve(res.statusCode === 204 ? null : JSON.parse(data || '{}'));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Download de arquivo com seguimento de redirects (302/301)
function downloadFile(url, redirectCount = 0) {
  const MAX_REDIRECTS = 5;

  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(url);

      // Usa http ou https conforme o protocolo — sem require()
      const lib = parsed.protocol === 'http:' ? http : https;

      const req = lib.get(parsed, (response) => {
        // Seguir redirects
        if (
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          if (redirectCount >= MAX_REDIRECTS) {
            reject(new Error('Too many redirects'));
            return;
          }

          const location = response.headers.location.startsWith('http')
            ? response.headers.location
            : new URL(response.headers.location, parsed).toString();

          response.resume(); // descarta o stream atual
          return resolve(downloadFile(location, redirectCount + 1));
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Status ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });

      req.on('error', reject);

      // timeout para evitar travamento
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

    } catch (err) {
      reject(err);
    }
  });
}

// Upload para Storage
async function uploadToStorage(bucketName, fileName, fileData) {
  const url = new URL(
    `/storage/v1/object/${bucketName}/${fileName}`,
    SUPABASE_URL
  );

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileData.length
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`Upload failed: ${res.statusCode}`));
        } else {
          resolve(JSON.parse(data || '{}'));
        }
      });
    });

    req.on('error', reject);
    req.write(fileData);
    req.end();
  });
}

// Delete do Storage
async function deleteFromStorage(bucketName, fileName) {
  return supabaseRequest(
    'DELETE',
    `/storage/v1/object/${bucketName}/${fileName}`
  );
}

// Update no banco
async function updateTable(tableName, id, updates) {
  return supabaseRequest(
    'PATCH',
    `/rest/v1/${tableName}?id=eq.${id}`,
    updates
  );
}

// =====================================================
// REORGANIZAÇÃO
// =====================================================

async function getRecordsWithImages(tableName) {
  console.log(`\n📊 Buscando registros de ${tableName} com imagens...`);
  
  const data = await supabaseRequest(
    'GET',
    `/rest/v1/${tableName}?select=id,name,image_url&image_url=not.is.null&limit=1000`
  );
  
  return Array.isArray(data) ? data : [];
}

async function reorganizeImage(record, tableName, index, total) {
  const { id, name, image_url } = record;
  
  try {
    // Se já está no novo bucket, pular
    const newBucket = STORAGE_BUCKETS[tableName];
    if (image_url && image_url.includes(newBucket)) {
      console.log(`⏭️  [${index}/${total}] ${name} - Já está no bucket correto`);
      return { skipped: true };
    }

    // Extrair nome do arquivo a partir de vários padrões possíveis
    let oldFileName = null;
    if (image_url) {
      // Padrão Supabase public object: /object/public/{bucket}/{file}
      let m = image_url.match(/\/object\/public\/[^\/]+\/([^\/\?#]+)(?:[\?#]|$)/);
      // Padrão Base44: /files/public/{hash}/{file}
      if (!m) m = image_url.match(/\/files\/public\/[^\/]+\/([^\/\?#]+)(?:[\?#]|$)/);
      // Fallback: pegar último segmento após '/'
      if (!m) m = image_url.match(/\/([^\/\?#]+)(?:[\?#]|$)/);
      if (m) oldFileName = m[1];
    }

    if (!oldFileName) {
      console.log(`⚠️  [${index}/${total}] ${name} - Não conseguiu extrair nome do arquivo`);
      console.log(`    URL: ${image_url}`);
      return { error: 'Could not extract filename' };
    }
    console.log(`⬇️  [${index}/${total}] Baixando: ${name}`);
    
    // Baixar do bucket antigo
    const imageData = await downloadFile(image_url);

    // Upload pro novo bucket
    console.log(`⬆️  Enviando para ${newBucket}...`);
    await uploadToStorage(newBucket, oldFileName, imageData);

    // Gerar nova URL pública
    const newUrl = `${SUPABASE_URL}/storage/v1/object/public/${newBucket}/${oldFileName}`;

    // Atualizar banco
    console.log(`🔄 Atualizando ${tableName}...`);
    await updateTable(tableName, id, { image_url: newUrl });

    // Deletar arquivo antigo apenas se for do bucket antigo no mesmo projeto Supabase
    const oldStoragePrefix = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET_OLD}/`;
    if (image_url && image_url.startsWith(oldStoragePrefix)) {
      console.log(`🗑️  Deletando arquivo antigo do bucket ${STORAGE_BUCKET_OLD}...`);
      try {
        await deleteFromStorage(STORAGE_BUCKET_OLD, oldFileName);
      } catch (err) {
        console.log(`⚠️  Não conseguiu deletar arquivo antigo (ok)`);
      }
    } else {
      console.log(`ℹ️  Arquivo antigo não está no bucket ${STORAGE_BUCKET_OLD}, não será deletado.`);
    }

    console.log(`✅ [${index}/${total}] ${name} reorganizado\n`);
    return { success: true, newUrl };

  } catch (error) {
    console.error(`❌ [${index}/${total}] Erro em ${name}: ${error.message}\n`);
    return { error: error.message };
  }
}

async function main() {
  console.log('🚀 INICIANDO REORGANIZAÇÃO DE IMAGENS\n');
  console.log(`📍 De: ${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET_OLD}`);
  console.log(`📍 Para: Buckets estruturados (products, mercadorias, presentes)\n`);

  const tables = ['product', 'mercadoria', 'presente'];
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const tableName of tables) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 PROCESSANDO: ${tableName.toUpperCase()}`);
    console.log(`🗂️  Bucket destino: ${STORAGE_BUCKETS[tableName]}`);
    console.log(`${'='.repeat(60)}`);

    try {
      const records = await getRecordsWithImages(tableName);
      
      if (records.length === 0) {
        console.log(`   ℹ️  Nenhum registro com imagem encontrado`);
        continue;
      }

      console.log(`   📋 Total: ${records.length} registros\n`);

      // Processar cada registro
      for (let i = 0; i < records.length; i++) {
        const result = await reorganizeImage(records[i], tableName, i + 1, records.length);
        
        totalProcessed++;
        if (result.success) totalSuccess++;
        if (result.skipped) totalSkipped++;
        if (result.error) totalErrors++;

        // Delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error(`❌ Erro ao processar ${tableName}: ${error.message}`);
      totalErrors++;
    }
  }

  // =====================================================
  // RESUMO
  // =====================================================

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESUMO FINAL`);
  console.log(`${'='.repeat(60)}`);
  console.log(`✅ Sucesso: ${totalSuccess}`);
  console.log(`⏭️  Pulados: ${totalSkipped}`);
  console.log(`❌ Erros: ${totalErrors}`);
  console.log(`📈 Total processado: ${totalProcessed}`);
  console.log(`${'='.repeat(60)}\n`);

  if (totalErrors === 0) {
    console.log('🎉 REORGANIZAÇÃO CONCLUÍDA COM SUCESSO!\n');
    console.log('📊 Estrutura final:');
    console.log('   ✅ damarie-products (cosméticos)');
    console.log('   ✅ damarie-mercadorias (embalagens)');
    console.log('   ✅ damarie-presentes (kits)');
    console.log('   ✅ damarie-documents (futuros uploads)\n');
    process.exit(0);
  } else {
    console.log('⚠️  Reorganização concluída com alguns erros\n');
    process.exit(1);
  }
}

// Executar
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
