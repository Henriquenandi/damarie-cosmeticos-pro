#!/usr/bin/env node

/**
 * SCRIPT DE DIAGNÓSTICO
 * Mostra URLs reais do banco para entender o padrão
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://zmdezvhfkxlzudhguscv.supabase.co';

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

async function supabaseRequest(method, endpoint) {
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
          resolve(JSON.parse(data || '{}'));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🔍 DIAGNÓSTICO DE URLs\n');

  const tables = ['product', 'mercadoria', 'presente'];

  for (const tableName of tables) {
    console.log(`\n📦 ${tableName.toUpperCase()}`);
    console.log(`${'='.repeat(80)}`);

    try {
      const data = await supabaseRequest(
        'GET',
        `/rest/v1/${tableName}?select=name,image_url&image_url=not.is.null&limit=3`
      );
      
      const records = Array.isArray(data) ? data : [];
      
      if (records.length === 0) {
        console.log('   Sem imagens encontradas');
        continue;
      }

      records.forEach((record, idx) => {
        console.log(`\n[${idx + 1}] ${record.name}`);
        console.log(`    URL: ${record.image_url}`);
        
        // Tentar extrair com diferentes regexes
        const url = record.image_url;
        
        // Regex atual (que está falhando)
        const match1 = url.match(/damarie-files\/(.+?)(?:\?|$)/);
        console.log(`    Regex 1 (damarie-files): ${match1 ? match1[1] : '❌ NÃO ENCONTROU'}`);
        
        // Tentar outros padrões
        const match2 = url.match(/\/([^\/]+?)(?:\?|$)/);
        console.log(`    Regex 2 (último /): ${match2 ? match2[1] : '❌ NÃO ENCONTROU'}`);
        
        const match3 = url.match(/\/object\/public\/([^\/]+)\/(.+?)(?:\?|$)/);
        console.log(`    Regex 3 (bucket + file): ${match3 ? `bucket: ${match3[1]}, file: ${match3[2]}` : '❌ NÃO ENCONTROU'}`);
      });

    } catch (error) {
      console.error(`❌ Erro em ${tableName}: ${error.message}`);
    }
  }
}

main().catch(error => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
