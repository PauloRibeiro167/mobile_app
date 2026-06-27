#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BASE_DIR = path.resolve(__dirname, '..');
const CONFIG_JSON = path.join(BASE_DIR, 'capacitor.config.json');
const TS_CONFIG = path.join(BASE_DIR, 'capacitor.config.ts');
const BACKUP = CONFIG_JSON + '.bak';

function showUsage() {
  // Removed unnecessary log
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

if (args.includes('--unset')) {
  try {
    if (fs.existsSync(CONFIG_JSON)) {
      fs.copyFileSync(CONFIG_JSON, BACKUP);
    }
    const content = {
      appId: 'io.ionic.starter',
      appName: 'ionic-base',
      webDir: 'www'
    };
    fs.writeFileSync(CONFIG_JSON, JSON.stringify(content, null, 2));
  } catch (error) {
    console.error('[ERRO] Falha ao atualizar o arquivo de configuração:', (error as Error).message);
    process.exit(1);
  }
  process.exit(0);
}

const HOST = process.env['DEV_HOST_IP'] || process.env['LIVERELOAD_HOST'] || '';
const PORT = process.env['DEV_LIVERELOAD_PORT'] || process.env['LIVERELOAD_PORT'] || '8100';
let URL = process.env['LIVERELOAD_URL'] || '';
if (!URL && HOST) {
  URL = `http://${HOST}:${PORT}`;
}

if (!URL) {
  console.error('[ERRO] Nenhuma URL de live-reload fornecida. Defina LIVERELOAD_URL ou DEV_HOST_IP.');
  showUsage();
  process.exit(2);
}

if (fs.existsSync(CONFIG_JSON)) {
  try {
    fs.copyFileSync(CONFIG_JSON, BACKUP);
  } catch (error) {
    console.error('[ERRO] Falha ao criar backup do arquivo de configuração:', (error as Error).message);
    process.exit(1);
  }
}

const config = {
  appId: 'io.ionic.starter',
  appName: 'ionic-base',
  webDir: 'www',
  server: {
    url: URL,
    cleartext: true
  }
};

try {
  fs.writeFileSync(CONFIG_JSON, JSON.stringify(config, null, 2));
} catch (error) {
  console.error('[ERRO] Falha ao escrever o arquivo de configuração:', (error as Error).message);
  process.exit(1);
}
if (fs.existsSync(TS_CONFIG)) {
  // Removed unnecessary log
}

process.exit(0);
