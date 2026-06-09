#!/usr/bin/env node

/**
 * Script para actualizar API_BASE_URL en index.html
 * Uso: node update-api-url.js <nueva-url>
 * Ejemplo: node update-api-url.js "https://oxxo-movilidad-api-production.up.railway.app"
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n❌ Error: Debes proporcionar la nueva URL del API\n');
  console.log('Uso:');
  console.log('  node update-api-url.js "https://tu-api.com"\n');
  console.log('Ejemplos:');
  console.log('  Localhost:');
  console.log('    node update-api-url.js "http://localhost:3001"\n');
  console.log('  Railway:');
  console.log('    node update-api-url.js "https://oxxo-movilidad-api-production.up.railway.app"\n');
  console.log('  Custom:');
  console.log('    node update-api-url.js "https://api.tu-dominio.com"\n');
  process.exit(1);
}

const newUrl = args[0];
const filePath = path.join(__dirname, 'index.html');

// Validar URL
try {
  new URL(newUrl);
} catch (err) {
  console.log('\n❌ Error: URL inválida\n');
  console.log('La URL debe ser válida, por ejemplo:');
  console.log('  https://oxxo-movilidad-api-production.up.railway.app');
  console.log('  http://localhost:3001\n');
  process.exit(1);
}

// Leer archivo
if (!fs.existsSync(filePath)) {
  console.log('\n❌ Error: No se encontró index.html\n');
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Buscar línea actual
const regex = /var API_BASE_URL = '[^']*';/;
const match = content.match(regex);

if (!match) {
  console.log('\n❌ Error: No se encontró API_BASE_URL en index.html\n');
  process.exit(1);
}

const oldUrl = match[0];
console.log('\n📝 Actualizando API_BASE_URL...\n');
console.log('De: ' + oldUrl);
console.log('A:  var API_BASE_URL = \'' + newUrl + '\';\n');

// Reemplazar
content = content.replace(regex, 'var API_BASE_URL = \'' + newUrl + '\';');

// Escribir archivo
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Actualizado exitosamente\n');
console.log('Próximos pasos:');
console.log('  1. git add index.html');
console.log('  2. git commit -m "Update API URL to ' + newUrl + '"');
console.log('  3. git push origin main\n');
