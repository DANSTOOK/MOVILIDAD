# ⚡ Quick Start - Testing & Deployment

## 🚀 Testing Rápido (5 minutos)

### Paso 1: Instalar Backend

```bash
cd backend
npm install
```

**Esperado**: Se instalarán 7 dependencias:
- express (servidor web)
- sqlite3 (base de datos)
- jsonwebtoken (autenticación)
- bcryptjs (hash de contraseñas)
- cors (control de origen)
- dotenv (variables de entorno)
- axios (cliente HTTP)

### Paso 2: Iniciar Backend

```bash
npm start
```

**Esperado en consola**:
```
✓ Database connected: ./data/oxxo_movilidad.db
✓ Database tables initialized
✓ Demo user created (username: admin, password: admin123)
🚀 API running on http://localhost:3001
📚 Docs: POST /api/auth/login (username: admin, password: admin123)
   GET  /api/equipos (needs token)
   GET  /api/analytics (needs token)
```

### Paso 3: Probar Backend (Terminal Nueva)

```bash
# Autenticarse
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Respuesta esperada**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Paso 4: Guardar Token y Probar Endpoint

```bash
# Reemplaza TOKEN con el valor del paso anterior
TOKEN="tu-token-aqui"

curl -X GET http://localhost:3001/api/equipos \
  -H "Authorization: Bearer $TOKEN"
```

**Respuesta esperada**: Array vacío (no hay equipos aún)
```json
[]
```

### Paso 5: Probar Frontend

1. Abre `index.html` en el navegador
2. Deberías ver el **Login Modal**
3. Ingresa:
   - Usuario: `admin`
   - Contraseña: `admin123`
4. Haz clic en "Conectar"
5. **Resultado**: Dashboard cargado sin datos (es normal, no hay equipos en la BD)

---

## ✅ Testing Checklist

- [ ] Backend instala sin errores
- [ ] Backend inicia correctamente
- [ ] API responde a curl
- [ ] Login funciona en frontend
- [ ] Token se guarda en localStorage
- [ ] No hay errores en consola del navegador
- [ ] User menu muestra "admin"
- [ ] Puedo hacer logout

---

## 📦 Deployment - Guía Completa

### Opción 1: Heroku (Gratis + $7/mes para DB)

#### Paso 1: Instala Heroku CLI
- Windows: https://devcenter.heroku.com/articles/heroku-cli#windows
- Mac: `brew tap heroku/brew && brew install heroku`
- Linux: `snap install --classic heroku`

#### Paso 2: Configura Git y Heroku

```bash
heroku login
heroku create oxxo-movilidad-api
heroku config:set JWT_SECRET="tu-secret-super-seguro"
```

#### Paso 3: Deploy

```bash
git push heroku main
```

#### Resultado:
```
🚀 Deployed to: https://oxxo-movilidad-api.herokuapp.com
API URL: https://oxxo-movilidad-api.herokuapp.com/api
```

#### Paso 4: Actualiza Frontend

En `index.html`, cambia:
```javascript
var API_BASE_URL = 'https://oxxo-movilidad-api.herokuapp.com';
```

---

### Opción 2: Railway.app (Recomendado - Más fácil)

#### Paso 1: Crea cuenta en Railway
https://railway.app

#### Paso 2: Conecta GitHub

- Click "New Project"
- Selecciona "Deploy from GitHub"
- Autoriza y selecciona este repo

#### Paso 3: Configura Variables

En Railway dashboard:
- Railway auto-detecta Node.js
- Agrega variable: `JWT_SECRET=tu-secret`
- Agrega variable: `NODE_ENV=production`

#### Paso 4: Deploy automático

Cada push a GitHub se despliega automáticamente

#### Resultado:
```
✅ Live URL: https://oxxo-movilidad-api-prod.up.railway.app
```

---

### Opción 3: DigitalOcean App Platform

#### Paso 1: Crea cuenta
https://www.digitalocean.com/products/app-platform/

#### Paso 2: Conecta Repo
- Click "Create App"
- Selecciona GitHub
- Selecciona repositorio

#### Paso 3: Configura Buildpack
- Resource Type: **Node.js**
- HTTP Port: **3001**

#### Paso 4: Deploy
```bash
# O desde DigitalOcean UI
doctl apps create --spec app.yaml
```

---

### Opción 4: Docker + Cualquier Servidor

#### Paso 1: Crea Dockerfile

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

#### Paso 2: Build Image

```bash
docker build -t oxxo-movilidad-api .
```

#### Paso 3: Run Container

```bash
docker run -p 3001:3001 \
  -e JWT_SECRET="tu-secret" \
  -e NODE_ENV="production" \
  oxxo-movilidad-api
```

#### Resultado:
```
API running on http://localhost:3001
```

---

## 🔒 Seguridad para Production

### Cambios requeridos:

1. **JWT_SECRET** - Cambia a algo seguro
```bash
# Genera un secret aleatorio
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. **CORS** - Limita orígenes permitidos
```javascript
// En server.js
const cors = require('cors');
app.use(cors({
  origin: 'https://tu-dominio.com',
  credentials: true
}));
```

3. **Base de datos** - Usa PostgreSQL en vez de SQLite
```javascript
// Próxima fase: migrar a PostgreSQL para production
```

4. **HTTPS** - Siempre usa HTTPS
```javascript
// Heroku/Railway/DigitalOcean lo hacen automáticamente
```

5. **Rate limiting** - Agrega límite de requests
```bash
npm install express-rate-limit
```

---

## 📊 Monitoreo Post-Deploy

### Health Check

```bash
curl https://tu-api.com/api/health
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2026-06-08T20:30:45.123Z"
}
```

### Logs

**Heroku**:
```bash
heroku logs --tail
```

**Railway**:
- Dashboard → Deployments → Logs

**DigitalOcean**:
- Dashboard → App → Logs

---

## 🔄 Flujo de Deploy Automático

```
1. Haces push a GitHub
   ↓
2. GitHub Actions/Railway detecta cambio
   ↓
3. Ejecuta npm install
   ↓
4. Ejecuta npm start
   ↓
5. API está live
   ↓
6. Frontend se conecta automáticamente
```

---

## ⚠️ Troubleshooting

### "Cannot find module 'express'"
```bash
npm install
npm start
```

### "EADDRINUSE: Port 3001 already in use"
```bash
# Encontrar proceso usando puerto 3001
lsof -i :3001

# Matar proceso
kill -9 <PID>
```

### "Database locked"
```bash
# Reinicia el backend
npm start
```

### "JWT_SECRET is undefined"
```bash
# Verifica .env existe
cat backend/.env

# O configura variable de entorno
export JWT_SECRET="tu-secret"
npm start
```

---

## 📈 Monitoring & Maintenance

### Daily Checks:
- [ ] API responde
- [ ] Base de datos accesible
- [ ] Logs sin errores
- [ ] Performance OK

### Weekly Tasks:
- [ ] Revisa audit log
- [ ] Backup de datos
- [ ] Verifica token security

### Monthly:
- [ ] Actualiza dependencias: `npm update`
- [ ] Revisa seguridad: `npm audit`
- [ ] Analiza uso de usuarios

---

## 🎯 URLs Finales

Después de deploy, tendrás:

| Componente | URL |
|-----------|-----|
| Frontend | https://tu-dominio.com |
| API | https://api.tu-dominio.com |
| API Docs | https://api.tu-dominio.com/api/health |
| Dashboard | https://tu-dominio.com/index.html |

---

## 📚 Documentación

- API_SETUP.md - Instalación detallada
- backend/README.md - Referencia de endpoints
- DEPLOYMENT.md - Guía completa (próximo)

---

**¿Necesitas ayuda con algo específico del deploy?**
