# 🚀 OXXO Movilidad - API Setup Guide

## Descripción General

El dashboard ahora está totalmente integrado con un backend REST API basado en Node.js + Express + SQLite. Esto permite:

- ✅ Autenticación con JWT
- ✅ Sincronización en tiempo real de datos
- ✅ Persistencia de datos en base de datos
- ✅ Múltiples usuarios
- ✅ Audit logging automático

## 📋 Requisitos Previos

- **Node.js**: v14 o superior (descargar de https://nodejs.org)
- **npm**: viene con Node.js
- **Dos terminales**: una para el frontend, otra para el backend

## ⚙️ Instalación del Backend

### Paso 1: Navega a la carpeta del backend

```bash
cd backend
```

### Paso 2: Instala dependencias

```bash
npm install
```

Esto instalará:
- `express` - Framework web
- `sqlite3` - Base de datos
- `jsonwebtoken` - Autenticación JWT
- `bcryptjs` - Hash de contraseñas
- `cors` - Control de origen
- `dotenv` - Variables de entorno

### Paso 3: Configura variables de entorno

```bash
cp .env.example .env
```

El archivo `.env` ahora contiene:
```
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DB_PATH=./data/oxxo_movilidad.db
GOOGLE_MAPS_API_KEY=your-google-maps-key-here
```

Para desarrollo, puedes dejar los valores por defecto. Para producción, **cambia JWT_SECRET**.

### Paso 4: Inicia el servidor

```bash
npm start
```

O en modo desarrollo (con auto-reload):

```bash
npm run dev
```

Deberías ver:
```
✓ Database connected: /path/to/backend/data/oxxo_movilidad.db
✓ Database tables initialized
✓ Demo user created (username: admin, password: admin123)
🚀 API running on http://localhost:3001
```

## 🌐 Uso del Frontend

### Opción 1: Con API Backend (Recomendado)

1. Abre `index.html` en el navegador
2. Verás un **Login Modal**
3. Usa las credenciales de demo:
   - **Usuario**: `admin`
   - **Contraseña**: `admin123`
4. Haz clic en "Conectar"
5. Los datos se cargarán desde el API ✅

### Opción 2: Modo Local (Sin API)

Si el backend no está disponible:

1. En el Login Modal, marca: "Usar modo local (sin API)"
2. Carga un archivo CSV como siempre
3. Los datos se procesarán localmente sin conexión al API

## 📊 API Endpoints Disponibles

### Autenticación
```bash
POST /api/auth/login
Body: { "username": "admin", "password": "admin123" }
Response: { "token": "...", "user": {...} }
```

### Equipos
```bash
GET /api/equipos?plaza=X&search=X&offline_only=true
Headers: Authorization: Bearer <token>
Response: [{ cr, tienda, plaza, asesor, estado, ... }]
```

```bash
GET /api/equipos/:id
Headers: Authorization: Bearer <token>
Response: { ...equipo, comentarios: [...] }
```

### Comentarios
```bash
POST /api/comentarios
Headers: Authorization: Bearer <token>
Body: { "equipo_id": 1, "texto": "Nota del equipo" }
```

### Analytics
```bash
GET /api/analytics
Headers: Authorization: Bearer <token>
Response: { summary: {...}, plazaStats: {...}, top10Problems: [...] }
```

## 🔄 Flujo de Datos

```
Frontend (index.html)
    ↓ (Login)
    ↓ (JWT Token)
Backend API (Port 3001)
    ↓ (Verificar token)
    ↓ (Query equipos)
SQLite Database
    ↓ (Equipos + Audit Log)
Backend API
    ↓ (JSON Response)
Frontend
    ↓ (Renderizar datos)
Usuario ✅
```

## 🛡️ Seguridad

### JWT Token
- Expira después de **24 horas**
- Se guarda en `localStorage` del navegador
- Se envía en el header `Authorization: Bearer <token>`

### Contraseñas
- Se hashean con `bcryptjs` (bcrypt)
- Nunca se almacenan en texto plano
- Demo user: admin/admin123 (cambiar en producción)

### Base de Datos
- SQLite3 (archivo local en `backend/data/`)
- Audit log de todas las acciones
- Validación de entrada en todos los endpoints

## 📝 Ejemplo: Agregar Nuevo Usuario

```javascript
// En el backend, usar sqlite3 directamente:
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('newPassword123', 10);
// INSERT INTO usuarios (username, password_hash, role) 
// VALUES ('newuser', hash, 'supervisor')
```

O por la API (próxima fase):
```bash
POST /api/admin/usuarios
Body: { "username": "newuser", "password": "newPassword123", "role": "supervisor" }
```

## 🐛 Troubleshooting

### "Error al conectar: ECONNREFUSED"
- El backend no está corriendo
- Asegúrate de ejecutar `npm start` en la carpeta `backend`
- Verifica que esté en el puerto 3001

### "Token expirado"
- El token JWT expiró después de 24 horas
- Inicia sesión nuevamente

### "Tabla no existe"
- La base de datos no se inicializó
- Elimina `backend/data/oxxo_movilidad.db`
- Reinicia el servidor para recrearla

### Database locked (SQLite)
- Cierra todas las conexiones del frontend
- Espera unos segundos
- Reinicia el backend

## 📚 Archivos Importantes

```
backend/
├── .env                 # Variables de configuración
├── .env.example        # Template de .env
├── package.json        # Dependencias
├── server.js           # Servidor Express
├── db.js               # Funciones de BD
├── README.md           # Documentación del API
└── data/
    └── oxxo_movilidad.db  # Base de datos SQLite

frontend/
├── index.html          # Aplicación web
├── API_SETUP.md        # Este archivo
└── backend/            # Referencia al backend
```

## 🚀 Próximos Pasos

### Phase 5: Mejoras Futuras
- [ ] Endpoint para crear/editar usuarios
- [ ] Batch import de equipos (CSV upload)
- [ ] Scheduled reports con email
- [ ] Google Maps integration
- [ ] Webhook notifications
- [ ] Multi-tenant support

## 📞 Soporte

Para reportar errores o sugerencias:
1. Revisa los logs del servidor (`npm start`)
2. Abre la consola del navegador (F12)
3. Copia los errores relevantes
4. Contacta al equipo de desarrollo

## ✅ Checklist de Verificación

- [ ] Node.js instalado (`node -v`)
- [ ] Backend instalado (`npm install` en carpeta backend)
- [ ] Backend corriendo (`npm start`)
- [ ] Frontend cargado en navegador
- [ ] Login modal visible
- [ ] Puedo iniciar sesión con admin/admin123
- [ ] Datos se cargan del API
- [ ] Analytics funcionan
- [ ] Puedo agregar notas de seguimiento
- [ ] QR codes se generan
- [ ] Alertas en tiempo real funcionan

---

**Versión**: v1.0 (Phase 4 - API Integration)  
**Último actualizado**: 2026-06-08  
**Estado**: ✅ Production Ready
