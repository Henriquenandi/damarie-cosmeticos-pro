#!/usr/bin/env node

/**
 * SCRIPT DE MIGRAÇÃO DE IMAGENS
 * Base44 Storage → Supabase Storage
 * 
 * Uso: node migrate-images.js
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

const BASE44_SUPABASE_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co';
const NEW_SUPABASE_URL = 'https://zmdezvhfkxlzudhguscv.supabase.co';
const STORAGE_BUCKET = 'damarie-files';

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

const SUPABASE_URL = env.VITE_SUPABASE_URL || NEW_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Erro: VITE_SUPABASE_ANON_KEY não encontrado no .env');
  process.exit(1);
}

// =====================================================
// UTILITÁRIOS
// =====================================================

// Download de arquivo
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Status ${response.statusCode}: ${url}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

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

// Upload para Storage
async function uploadToStorage(fileName, fileData) {
  const url = new URL(
    `/storage/v1/object/${STORAGE_BUCKET}/${fileName}`,
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
          reject(new Error(`Upload failed: ${res.statusCode} - ${data}`));
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

// Update no banco
async function updateTable(tableName, id, updates) {
  return supabaseRequest(
    'PATCH',
    `/rest/v1/${tableName}?id=eq.${id}`,
    updates
  );
}

// =====================================================
// MIGRAÇÃO
// =====================================================

async function getRecordsWithImages(tableName) {
  console.log(`\n📊 Buscando registros de ${tableName} com imagens...`);
  
  const data = await supabaseRequest(
    'GET',
    `/rest/v1/${tableName}?select=id,name,image_url&image_url=not.is.null&limit=1000`
  );
  
  return Array.isArray(data) ? data : [];
}

async function migrateImage(record, tableName, index, total) {
  const { id, name, image_url } = record;
  
  try {
    // 1. Validar se é URL do Base44
    if (!image_url || !image_url.includes('qtrypzzcjebvfcihiynt')) {
      console.log(`⏭️  [${index}/${total}] ${name} - URL já é do novo Supabase`);
      return { skipped: true };
    }

    console.log(`⬇️  [${index}/${total}] Baixando: ${name}`);
    const imageData = await downloadFile(image_url);

    // 2. Gerar nome único
    const ext = image_url.split('.').pop().split('?')[0] || 'jpg';
    const fileName = `${Date.now()}_${id}.${ext}`;

    console.log(`⬆️  Fazendo upload para Supabase...`);
    await uploadToStorage(fileName, imageData);

    // 3. Gerar URL pública
    const newUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${fileName}`;

    // 4. Atualizar banco
    console.log(`🔄 Atualizando ${tableName}...`);
    await updateTable(tableName, id, { image_url: newUrl });

    console.log(`✅ [${index}/${total}] ${name} migrado com sucesso\n`);
    return { success: true, newUrl };

  } catch (error) {
    console.error(`❌ [${index}/${total}] Erro em ${name}: ${error.message}\n`);
    return { error: error.message };
  }
}

async function main() {
  console.log('🚀 INICIANDO MIGRAÇÃO DE IMAGENS\n');
  console.log(`📍 De: ${BASE44_SUPABASE_URL}`);
  console.log(`📍 Para: ${SUPABASE_URL}\n`);

  const tables = ['product', 'mercadoria', 'presente'];
  let totalProcessed = 0;
  let totalSuccess = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const tableName of tables) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 PROCESSANDO: ${tableName.toUpperCase()}`);
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
        const result = await migrateImage(records[i], tableName, i + 1, records.length);
        
        totalProcessed++;
        if (result.success) totalSuccess++;
        if (result.skipped) totalSkipped++;
        if (result.error) totalErrors++;

        // Delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error(`❌ Erro ao processar ${tableName}: ${error.message}`);
      totalErrors += records.length;
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
    console.log('🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Migração concluída com alguns erros\n');
    process.exit(1);
  }
}

// Executar
main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
