# 🚀 OXXO Movilidad API Backend

API REST para el Dashboard OXXO Movilidad con autenticación JWT y SQLite.

## ⚡ Quick Start

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env si es necesario (ports, secrets, API keys)
```

### 3. Ejecutar servidor
```bash
npm start          # Production
npm run dev        # Development (with nodemon)
```

El servidor estará en `http://localhost:3001`

## 🔐 Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

### Usar token en requests
```bash
Authorization: Bearer <token>
```

## 📚 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

### Equipos
- `GET /api/equipos` - List equipos (with filters: ?plaza=X&search=X&offline_only=true)
- `GET /api/equipos/:id` - Get single equipo + comments
- `POST /api/equipos` - Create equipo
- `PUT /api/equipos/:id` - Update equipo status

### Comentarios
- `POST /api/comentarios` - Add comment to equipo

### Analytics
- `GET /api/analytics` - Get analytics summary & top 10

### Health
- `GET /api/health` - Server status

## 📊 Database Schema

### usuarios
- id, username, password_hash, role, plaza, created_at

### equipos
- id, cr, friendly_name, tienda, plaza, asesor, estado, days_ago, last_seen, equipo_type, serial_number, model, latitude, longitude, last_sync

### comentarios
- id, equipo_id, usuario_id, texto, timestamp

### stock
- id, equipo_id, plaza, cantidad, timestamp

### audit_log
- id, usuario_id, accion, tabla, registro_id, detalles, timestamp

## 🔄 Frontend Integration

Replace CSV loading with API calls. Example:

```javascript
// OLD: Load CSV
// NEW: Login + fetch equipos
const loginRes = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});

const { token } = await loginRes.json();
localStorage.setItem('auth_token', token);

// Fetch equipos
const res = await fetch('http://localhost:3001/api/equipos', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const D = await res.json();  // Reemplaza window.D
```

## 🛠️ Development

- **Database**: SQLite (auto-created in `data/oxxo_movilidad.db`)
- **Demo user**: admin / admin123
- **JWT Secret**: Change `JWT_SECRET` in .env for production
- **CORS**: Enabled for frontend
- **Audit logging**: All changes logged in `audit_log` table

## 📝 TODO

- [ ] Implement Google Maps API for store locations
- [ ] Add batch equipment import (CSV)
- [ ] Implement scheduled reports (cron)
- [ ] Add email notifications
- [ ] Implement data export with filters
- [ ] Add user management endpoints
