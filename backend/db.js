const { Pool } = require('pg');

// PostgreSQL connection pool
if (!process.env.DATABASE_URL) {
  console.warn('⚠ DATABASE_URL no configurado — usando localhost (solo desarrollo)');
}
// SSL se decide por la URL de conexión (host remoto la requiere), no por
// NODE_ENV, que puede no estar seteado. Solo localhost va sin SSL.
const _dbUrl = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/oxxo_movilidad';
const _needsSsl = !/@(localhost|127\.0\.0\.1)[:/]/.test(_dbUrl);
const pool = new Pool({
  connectionString: _dbUrl,
  ssl: _needsSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 2s era muy poco para una BD gestionada fría
});

pool.on('connect', () => {
  console.log('✓ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('✗ PostgreSQL pool error:', err);
});

// Database query wrappers
const dbAll = async (sql, params = []) => {
  try {
    // Convert SQLite style parameters (?) to PostgreSQL style ($1, $2, etc)
    const { query, values } = convertSqliteToPostgres(sql, params);
    const result = await pool.query(query, values);
    return result.rows;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

const dbRun = async (sql, params = []) => {
  try {
    const { query, values } = convertSqliteToPostgres(sql, params);
    const result = await pool.query(query, values);
    return {
      lastID: result.rows[0]?.id,
      changes: result.rowCount
    };
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

const dbGet = async (sql, params = []) => {
  try {
    const { query, values } = convertSqliteToPostgres(sql, params);
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
};

// Convert SQLite style parameter placeholders (?) to PostgreSQL style ($1, $2, etc)
// Recorre el SQL carácter por carácter para NO convertir un `?` literal que
// esté dentro de un string entre comillas simples (p. ej. LIKE '%?%' o un
// operador JSON de Postgres escrito en un literal).
const convertSqliteToPostgres = (sql, params) => {
  let paramIndex = 1;
  let out = '';
  let inString = false;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (ch === "'") {
      // '' dentro de un string es una comilla escapada, no cierra el string
      if (inString && sql[i + 1] === "'") { out += "''"; i++; continue; }
      inString = !inString;
      out += ch;
    } else if (ch === '?' && !inString) {
      out += `$${paramIndex++}`;
    } else {
      out += ch;
    }
  }
  return { query: out, values: params };
};

// Inicializar tablas
const initDB = async () => {
  try {
    // Tabla usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'supervisor',
        plaza TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla equipos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipos (
        id SERIAL PRIMARY KEY,
        cr TEXT UNIQUE NOT NULL,
        friendly_name TEXT,
        tienda TEXT,
        plaza TEXT,
        asesor TEXT,
        estado TEXT DEFAULT 'online',
        days_ago INTEGER,
        last_seen TIMESTAMP,
        equipo_type TEXT,
        serial_number TEXT,
        model TEXT,
        latitude DECIMAL(10, 6),
        longitude DECIMAL(10, 6),
        last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla comentarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id SERIAL PRIMARY KEY,
        equipo_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        texto TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(equipo_id) REFERENCES equipos(id),
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
      )
    `);

    // Tabla stock
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock (
        id SERIAL PRIMARY KEY,
        equipo_id INTEGER NOT NULL,
        plaza TEXT,
        cantidad INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(equipo_id) REFERENCES equipos(id)
      )
    `);

    // Tabla audit_log
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER,
        accion TEXT,
        tabla TEXT,
        registro_id INTEGER,
        detalles TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
      )
    `);

    console.log('✓ Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
    // Relanzar: si el esquema no se pudo crear, el servidor NO debe arrancar
    // (antes se tragaba el error y los endpoints fallaban en runtime).
    throw err;
  }
};

// Create demo user if not exists
const initDemoUser = async () => {
  try {
    const bcrypt = require('bcryptjs');
    const existing = await dbGet('SELECT * FROM usuarios WHERE username = ?', ['admin']);

    if (!existing) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await dbRun(
        'INSERT INTO usuarios (username, password_hash, role) VALUES (?, ?, ?)',
        ['admin', passwordHash, 'admin']
      );
      console.log('✓ Demo user created (username: admin, password: admin123)');
    }
  } catch (err) {
    console.error('Error creating demo user:', err);
  }
};

module.exports = {
  pool,
  dbAll,
  dbRun,
  dbGet,
  initDB,
  initDemoUser
};
