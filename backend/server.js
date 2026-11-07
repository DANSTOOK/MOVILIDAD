require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const { dbAll, dbRun, dbGet, initDB, initDemoUser } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// JWT_SECRET es obligatorio en producción: un fallback conocido permitiría
// a cualquiera forjar tokens de admin.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET no está configurado. Abortando.');
    process.exit(1);
  }
  console.warn('⚠ JWT_SECRET no configurado — usando valor de desarrollo (NO usar en producción)');
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || 'dev-only-secret';

// CORS restringido: el frontend se sirve desde este mismo servicio (same-origin),
// solo se permite cross-origin para desarrollo local.
const ALLOWED_ORIGINS = [
  'https://movilidad-production.up.railway.app',
  'http://localhost:8777',
  'http://127.0.0.1:8777',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3001',
  'http://127.0.0.1:3001'
];
app.use(cors({
  origin: function (origin, cb) {
    // Sin header Origin (curl, same-origin) → permitir
    if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) return cb(null, true);
    return cb(null, false);
  }
}));
app.use(express.json());

// Rate limit en memoria para /api/auth/login: 10 intentos por IP por 15 min.
// Suficiente para una sola instancia; evita fuerza bruta sobre credenciales.
const _loginAttempts = new Map();
function loginRateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  const now = Date.now();
  const win = 15 * 60 * 1000;
  let rec = _loginAttempts.get(ip);
  if (!rec || now - rec.start > win) {
    rec = { start: now, count: 0 };
    _loginAttempts.set(ip, rec);
  }
  rec.count++;
  if (_loginAttempts.size > 10000) _loginAttempts.clear(); // evitar crecimiento sin límite
  if (rec.count > 10) {
    return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' });
  }
  next();
}

// Servir el frontend estático (index.html y demás archivos del repo raíz)
const STATIC_DIR = path.join(__dirname, '..');
app.use(express.static(STATIC_DIR));

// Verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, EFFECTIVE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ════════════════════════════════════════════════════════════════
app.post('/api/auth/login', loginRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await dbGet('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const validPassword = await bcryptjs.compare(password, user.password_hash);
    if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, EFFECTIVE_JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ════════════════════════════════════════════════════════════════
// EQUIPOS ENDPOINTS
// ════════════════════════════════════════════════════════════════
app.get('/api/equipos', verifyToken, async (req, res) => {
  try {
    const { plaza, search, offline_only } = req.query;
    let sql = 'SELECT * FROM equipos WHERE 1=1';
    let params = [];

    if (plaza) {
      sql += ' AND plaza = ?';
      params.push(plaza);
    }
    if (search) {
      sql += ' AND (cr LIKE ? OR tienda LIKE ? OR friendly_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    if (offline_only === 'true') {
      sql += ' AND days_ago >= 4';
    }

    sql += ' ORDER BY days_ago DESC';
    const equipos = await dbAll(sql, params);
    res.json(equipos);
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/equipos/:id', verifyToken, async (req, res) => {
  try {
    const equipo = await dbGet('SELECT * FROM equipos WHERE id = ?', [req.params.id]);
    if (!equipo) return res.status(404).json({ error: 'Equipment not found' });

    const comentarios = await dbAll('SELECT * FROM comentarios WHERE equipo_id = ? ORDER BY timestamp DESC', [req.params.id]);
    res.json({ ...equipo, comentarios });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/equipos', verifyToken, async (req, res) => {
  try {
    const { cr, friendly_name, tienda, plaza, asesor, serial_number, model, latitude, longitude } = req.body;
    // RETURNING id es necesario en PostgreSQL para que lastID tenga valor
    const result = await dbRun(
      `INSERT INTO equipos (cr, friendly_name, tienda, plaza, asesor, serial_number, model, latitude, longitude, last_sync)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) RETURNING id`,
      [cr, friendly_name, tienda, plaza, asesor, serial_number, model, latitude, longitude]
    );

    // Audit log
    await dbRun(
      'INSERT INTO audit_log (usuario_id, accion, tabla, registro_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'equipos', result.lastID]
    );

    res.json({ id: result.lastID });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/equipos/:id', verifyToken, async (req, res) => {
  try {
    const { estado, days_ago, last_seen } = req.body;
    await dbRun(
      'UPDATE equipos SET estado = ?, days_ago = ?, last_seen = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [estado, days_ago, last_seen, req.params.id]
    );

    // Audit log
    await dbRun(
      'INSERT INTO audit_log (usuario_id, accion, tabla, registro_id, detalles) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'UPDATE', 'equipos', req.params.id, JSON.stringify(req.body)]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

// ════════════════════════════════════════════════════════════════
// COMENTARIOS ENDPOINTS
// ════════════════════════════════════════════════════════════════
app.post('/api/comentarios', verifyToken, async (req, res) => {
  try {
    const { equipo_id, texto } = req.body;
    const result = await dbRun(
      'INSERT INTO comentarios (equipo_id, usuario_id, texto) VALUES (?, ?, ?) RETURNING id',
      [equipo_id, req.user.id, texto]
    );

    // Audit log
    await dbRun(
      'INSERT INTO audit_log (usuario_id, accion, tabla, registro_id) VALUES (?, ?, ?, ?)',
      [req.user.id, 'CREATE', 'comentarios', result.lastID]
    );

    res.json({ id: result.lastID });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

// ════════════════════════════════════════════════════════════════
// ANALYTICS ENDPOINTS
// ════════════════════════════════════════════════════════════════
app.get('/api/analytics', verifyToken, async (req, res) => {
  try {
    const equipos = await dbAll('SELECT * FROM equipos');

    const total = equipos.length;
    const online = equipos.filter(e => e.days_ago < 1).length;
    const critical = equipos.filter(e => e.days_ago >= 15).length;
    const recent = equipos.filter(e => e.days_ago >= 1 && e.days_ago < 4).length;

    const plazaStats = {};
    equipos.forEach(e => {
      const plaza = e.plaza || 'Sin Plaza';
      if (!plazaStats[plaza]) plazaStats[plaza] = { total: 0, offline: 0 };
      plazaStats[plaza].total++;
      if (e.days_ago >= 4) plazaStats[plaza].offline++;
    });

    const top10 = equipos.filter(e => e.days_ago >= 4).sort((a, b) => b.days_ago - a.days_ago).slice(0, 10);

    res.json({
      summary: { total, online, critical, recent, availabilityPercent: ((online / total) * 100).toFixed(1) },
      plazaStats,
      top10Problems: top10
    });
  } catch (err) {
    console.error(err); res.status(500).json({ error: 'Internal server error' });
  }
});

// ════════════════════════════════════════════════════════════════
// GEOCODIFICACIÓN DE TIENDAS
//
// El mapa sitúa cada tienda llamando a Nominatim (OpenStreetMap). Desde el
// navegador eso no funciona: Nominatim no manda cabecera de CORS, así que el
// navegador descarta todas las respuestas. La consola se llenaba de cientos
// de "blocked by CORS policy" y ninguna tienda llegaba a dibujarse.
//
// La llamada se hace desde aquí, donde no hay CORS que valga. Tres cuidados
// que Nominatim pide por escrito en su política de uso:
//
//   · como máximo una petición por segundo — y aquí se cumple para TODOS los
//     navegadores a la vez, no solo para cada uno por su cuenta, que es lo
//     que hacía el cliente con su cola de 1,1 s;
//   · identificarse con un User-Agent de verdad;
//   · no repetir lo ya preguntado. Una tienda no se mueve de sitio, así que
//     la respuesta se guarda y no se vuelve a preguntar.
//
// El cliente manda SOLO el nombre de la tienda, no una consulta libre: la
// consulta la arma este servidor. Si no, esto sería un proxy abierto a
// Nominatim con el que cualquiera podría hacer que nos baneen la IP.
// ════════════════════════════════════════════════════════════════
const _geoCache = new Map();
let _geoUltima = 0;          // cuándo salió la última petición de aquí
let _geoCola = Promise.resolve();

const GEO_ESPERA_MS = 1100;  // la política dice 1/s; 1,1 da margen
const GEO_TIMEOUT_MS = 8000;
const GEO_CACHE_MAX = 5000;
const GEO_AGENTE = 'OXXO-Movilidad/1.0 (tablero interno de operaciones)';

function geocodificar(nombre) {
  // Las peticiones salen de una en una y espaciadas, encadenándolas.
  _geoCola = _geoCola.then(async () => {
    const espera = GEO_ESPERA_MS - (Date.now() - _geoUltima);
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    _geoUltima = Date.now();

    const url = 'https://nominatim.openstreetmap.org/search'
      + '?q=' + encodeURIComponent('Oxxo ' + nombre + ' Mexico')
      + '&format=json&limit=1&countrycodes=mx';

    const r = await fetch(url, {
      headers: { 'User-Agent': GEO_AGENTE, 'Accept-Language': 'es' },
      signal: AbortSignal.timeout(GEO_TIMEOUT_MS),
    });
    if (!r.ok) throw new Error('Nominatim respondió ' + r.status);
    const datos = await r.json();
    if (!Array.isArray(datos) || datos.length === 0) return null;
    return { lat: parseFloat(datos[0].lat), lon: parseFloat(datos[0].lon) };
  });
  return _geoCola;
}

app.get('/api/geocode/tienda', async (req, res) => {
  const nombre = String(req.query.nombre || '').trim();
  if (!nombre || nombre.length > 120) {
    return res.status(400).json({ error: 'Falta el nombre de la tienda, o es demasiado largo.' });
  }

  const clave = nombre.toLowerCase();
  if (_geoCache.has(clave)) {
    const guardado = _geoCache.get(clave);
    return res.json(guardado ? { ...guardado, cache: true } : { encontrada: false, cache: true });
  }

  try {
    const coords = await geocodificar(nombre);
    if (_geoCache.size >= GEO_CACHE_MAX) _geoCache.clear();
    _geoCache.set(clave, coords);
    // Un "no la encuentro" también se guarda: preguntarlo otra vez daría lo
    // mismo y gastaría el cupo de peticiones.
    return res.json(coords ? { ...coords, cache: false } : { encontrada: false, cache: false });
  } catch (err) {
    // No se guarda en caché: un fallo de red sí puede ir distinto la próxima.
    console.warn('Geocodificación de "' + nombre + '" falló:', err.message);
    return res.status(502).json({ error: 'No se pudo consultar el geocodificador.' });
  }
});

// ════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ════════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback: cualquier ruta que no sea /api sirve el frontend (index.html)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

// Inicializar BD y arrancar servidor
const startServer = async () => {
  await initDB();
  await initDemoUser();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 API running on http://localhost:${PORT}`);
    console.log(`📚 Docs: POST /api/auth/login (username: admin, password: admin123)`);
    console.log(`   GET  /api/equipos (needs token)`);
    console.log(`   GET  /api/analytics (needs token)\n`);
  });
};

startServer().catch((err) => {
  // Si la BD no se pudo inicializar, abortar: Railway conserva el deploy
  // anterior cuando el healthcheck no pasa.
  console.error('FATAL: no se pudo iniciar el servidor:', err);
  process.exit(1);
});
