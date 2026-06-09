/**
 * Servidor HTTP local simple para OXXO Movilidad
 * Sirve archivos estáticos en localhost:8080
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const HOSTNAME = 'localhost';

// Tipos MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  // Path normalizado
  let filePath = path.join(__dirname, req.url === '/' ? '/index.html' : req.url);

  // Seguridad: prevenir directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  // Extensión del archivo
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'text/plain';

  // Leer y servir archivo
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Archivo no encontrado, servir 404
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><title>404 Not Found</title></head>
            <body>
              <h1>404 - Archivo no encontrado</h1>
              <p>No se pudo encontrar: ${req.url}</p>
              <p><a href="/">Volver al inicio</a></p>
            </body>
          </html>
        `);
      } else {
        // Error del servidor
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Error del servidor: ${err}`);
      }
    } else {
      // Archivo encontrado, servir con CORS headers
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
        'Content-Length': content.length
      });
      res.end(content);
    }
  });
});

server.listen(PORT, HOSTNAME, () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🚀 OXXO Movilidad - Servidor Local Activo           ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║                                                            ║');
  console.log(`║  📱 Dashboard:  http://${HOSTNAME}:${PORT}                    ║`);
  console.log(`║  🧪 Test Login: http://${HOSTNAME}:${PORT}/test-login.html    ║`);
  console.log('║                                                            ║');
  console.log('║  ✅ Modo LOCAL (sin API externo)                          ║');
  console.log('║  ✅ Puedes cargar archivos CSV                            ║');
  console.log('║  ✅ Todos los datos se guardan localmente                 ║');
  console.log('║                                                            ║');
  console.log('║  Para detener: Presiona Ctrl+C                            ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
});

// Manejo de errores
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Puerto ${PORT} ya está en uso`);
    console.error('Soluciones:');
    console.error(`1. Cambia el puerto en server-local.js`);
    console.error(`2. O mata el proceso usando el puerto ${PORT}`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n\n⏹️  Servidor detenido');
  server.close(() => {
    process.exit(0);
  });
});
