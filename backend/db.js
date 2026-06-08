const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Crear carpeta data si no existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const DB_PATH = path.join(dataDir, 'oxxo_movilidad.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Error opening database:', err);
  else console.log('✓ Database connected:', DB_PATH);
});

// Promisify database operations
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Inicializar tablas
const initDB = async () => {
  try {
    // Tabla usuarios
    await dbRun(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'supervisor',
        plaza TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla equipos
    await dbRun(`
      CREATE TABLE IF NOT EXISTS equipos (
        id INTEGER PRIMARY KEY,
        cr TEXT UNIQUE NOT NULL,
        friendly_name TEXT,
        tienda TEXT,
        plaza TEXT,
        asesor TEXT,
        estado TEXT DEFAULT 'online',
        days_ago INTEGER,
        last_seen DATETIME,
        equipo_type TEXT,
        serial_number TEXT,
        model TEXT,
        latitude REAL,
        longitude REAL,
        last_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla comentarios
    await dbRun(`
      CREATE TABLE IF NOT EXISTS comentarios (
        id INTEGER PRIMARY KEY,
        equipo_id INTEGER NOT NULL,
        usuario_id INTEGER NOT NULL,
        texto TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(equipo_id) REFERENCES equipos(id),
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
      )
    `);

    // Tabla stock
    await dbRun(`
      CREATE TABLE IF NOT EXISTS stock (
        id INTEGER PRIMARY KEY,
        equipo_id INTEGER NOT NULL,
        plaza TEXT,
        cantidad INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(equipo_id) REFERENCES equipos(id)
      )
    `);

    // Tabla audit_log
    await dbRun(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY,
        usuario_id INTEGER,
        accion TEXT,
        tabla TEXT,
        registro_id INTEGER,
        detalles TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
      )
    `);

    console.log('✓ Database tables initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Crear usuario demo (si no existe)
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
  db,
  dbAll,
  dbRun,
  dbGet,
  initDB,
  initDemoUser
};
