# 🚀 OXXO Movilidad - Complete Deployment Guide

## Pre-Deployment Checklist

- [ ] Código testeado localmente
- [ ] Todos los commits pusheados a GitHub
- [ ] Variables de ambiente configuradas
- [ ] Base de datos lista
- [ ] SSL/HTTPS configurado
- [ ] CORS configurado para tu dominio
- [ ] Backups de datos creados

---

## 1️⃣ Deploy en Heroku (Opción más fácil)

### Requisitos:
- Cuenta Heroku (gratis)
- Heroku CLI instalado
- GitHub conectado a Heroku

### Pasos:

#### 1.1 Crea la aplicación

```bash
heroku login
heroku create oxxo-movilidad-api
```

#### 1.2 Configura variables de ambiente

```bash
heroku config:set JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
heroku config:set NODE_ENV="production"
```

#### 1.3 Agrega buildpack de Node.js

```bash
heroku buildpacks:add heroku/nodejs
```

#### 1.4 Deploy desde Git

```bash
git push heroku main
```

#### 1.5 Verifica el deploy

```bash
heroku logs --tail
heroku open
```

### Resultado:
```
✅ API en: https://oxxo-movilidad-api.herokuapp.com
✅ Auto-deploy en cada push a main
✅ Dominio personalizado: heroku domains:add api.tu-dominio.com
```

---

## 2️⃣ Deploy en Railway (Recomendado)

### Requisitos:
- Cuenta Railway (gratis con $5/mes crédito)
- GitHub conectado

### Pasos:

#### 2.1 Crear proyecto

1. Va a https://railway.app/new
2. Click "GitHub Repo"
3. Autoriza y selecciona tu repo
4. Railway detecta Node.js automáticamente

#### 2.2 Configura variables

En el dashboard de Railway:

```
PORT=3001
JWT_SECRET=tu-secret-seguro
NODE_ENV=production
```

#### 2.3 Deploy automático

Cada push a main se despliega automáticamente

#### 2.4 Conecta dominio personalizado

1. Railway dashboard → Settings
2. Custom Domain
3. Apunta tu DNS a Railway

### Resultado:
```
✅ API en: https://api.tu-dominio.com
✅ Auto-deploy en push
✅ SSL automático
✅ Monitoreo incluido
```

---

## 3️⃣ Deploy en DigitalOcean App Platform

### Requisitos:
- Cuenta DigitalOcean ($5/mes)
- GitHub conectado

### Pasos:

#### 3.1 Conecta repo

1. DigitalOcean → Apps
2. "Create App"
3. GitHub → Selecciona repo

#### 3.2 Configura resources

```yaml
- name: api
  type: service
  github:
    repo: DANSTOOK/MOVILIDAD
    branch: main
  build_command: npm install
  run_command: npm start
  envs:
    - key: PORT
      value: 3001
    - key: JWT_SECRET
      value: ${APP_SECRET}
    - key: NODE_ENV
      value: production
  http_port: 3001
```

#### 3.3 Deploy

Click "Create Resources" y wait 5-10 minutos

#### 3.4 Configurar DNS

Apunta tu dominio a DigitalOcean

### Resultado:
```
✅ API en: https://api.tu-dominio.com
✅ $5/mes
✅ Full control
✅ Load balancing disponible
```

---

## 4️⃣ Deploy con Docker + Own Server

### Requisitos:
- VPS o servidor propio
- Docker instalado
- Nginx o Apache

### Pasos:

#### 4.1 Build imagen Docker

```bash
docker build -t oxxo-movilidad-api ./backend
```

#### 4.2 Run contenedor

```bash
docker run -d \
  -p 3001:3001 \
  -e JWT_SECRET="tu-secret" \
  -e NODE_ENV="production" \
  -v /data/oxxo:/app/data \
  --restart always \
  --name oxxo-api \
  oxxo-movilidad-api
```

#### 4.3 Configura Nginx como reverse proxy

```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 4.4 SSL con Let's Encrypt

```bash
sudo certbot --nginx -d api.tu-dominio.com
```

#### 4.5 Monitoreo con PM2

```bash
npm install -g pm2
pm2 start npm --name "oxxo-api" -- start
pm2 startup
pm2 save
```

### Resultado:
```
✅ Total control
✅ Más barato a largo plazo
✅ Máxima escalabilidad
✅ Pero requiere mantenimiento
```

---

## 🔒 Post-Deployment Security

### 1. Actualiza configuración CORS

En `backend/server.js`:

```javascript
const cors = require('cors');

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'https://tu-dominio.com',
  'https://app.tu-dominio.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 2. Rate limiting

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Demasiadas solicitudes'
});

app.use('/api/', limiter);
```

### 3. Helmet para headers de seguridad

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Validación de entrada

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/comentarios', [
  body('texto').trim().isLength({ min: 1, max: 500 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // ... resto del código
});
```

---

## 📊 Monitoreo Post-Deploy

### Health Check Endpoint

```bash
curl https://api.tu-dominio.com/api/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2026-06-08T20:30:45.123Z"
}
```

### Logs

**Heroku**:
```bash
heroku logs --tail --app oxxo-movilidad-api
```

**Railway**:
- Dashboard → Logs

**DigitalOcean**:
- Dashboard → Component → Logs

**Docker/Own Server**:
```bash
docker logs -f oxxo-api
pm2 logs oxxo-api
```

### Métricas Importantes

- Response time: < 200ms
- Error rate: < 0.5%
- Uptime: > 99.9%
- CPU: < 50%
- Memory: < 200MB

### Alertas recomendadas

```bash
# Heroku
heroku addons:create papertrail:choklad

# DigitalOcean
# Agregar Email Alert en Settings

# Own Server
# Usar Grafana + Prometheus
```

---

## 🔄 Actualizaciones y Rollback

### Deploy de Actualización

```bash
# Heroku
git push heroku main

# Railway
# Auto-deploy en push a main

# DigitalOcean
# Auto-deploy en push (si está configurado)

# Docker
git pull
docker build -t oxxo-movilidad-api ./backend
docker stop oxxo-api
docker run -d ... oxxo-movilidad-api
```

### Rollback en caso de error

```bash
# Heroku
heroku releases
heroku rollback v12

# Railway
Dashboard → Deployments → Redeploy Previous

# DigitalOcean
Dashboard → Deployments → Redeploy

# Docker
docker run -d ... --name oxxo-api-old image:previous-version
```

---

## 📦 Actualizar dependencias

### Verificar vulnerabilidades

```bash
npm audit
```

### Actualizar dependencias

```bash
npm update
npm outdated
```

### Actualizar major versions

```bash
npm install express@latest
npm test
git commit -m "Update dependencies"
git push heroku main
```

---

## 🗄️ Backup & Recovery

### Backup automático (importante!)

**SQLite → PostgreSQL** (próxima fase):

```bash
# Exportar datos actuales
sqlite3 data/oxxo_movilidad.db ".dump" > backup.sql

# Importar a PostgreSQL
psql -U postgres < backup.sql
```

**En Cloud**:
- **Heroku**: Usa Heroku Postgres Backup
- **Railway**: Auto-backup incluido
- **DigitalOcean**: Usa DOKS Backups
- **Docker**: Volúmenes con backup externo

### Recuperación de desastre

```bash
# Restaurar desde backup
sqlite3 data/oxxo_movilidad.db < backup.sql

# Verificar integridad
sqlite3 data/oxxo_movilidad.db "SELECT COUNT(*) FROM equipos"
```

---

## 💰 Costos Estimados

| Opción | Costo | Escalabilidad |
|--------|-------|---------------|
| **Heroku** | $25-50/mes | Media |
| **Railway** | $5-20/mes | Media |
| **DigitalOcean** | $6-30/mes | Alta |
| **AWS** | $0-100+/mes | Muy Alta |
| **Own Server** | $5-50/mes | Máxima |

---

## ✅ Deployment Checklist Final

- [ ] Backend deployado
- [ ] API responde desde URL pública
- [ ] SSL/HTTPS funciona
- [ ] JWT_SECRET cambiado
- [ ] CORS configurado
- [ ] Logs monitoreados
- [ ] Backups automáticos configurados
- [ ] Health check funcionando
- [ ] Frontend apunta a API correcta
- [ ] Usuarios pueden login
- [ ] Datos se sincronizan
- [ ] Alertas configuradas
- [ ] Documentación actualizada

---

## 🎯 Next Steps

1. **Monitoreo 24/7**: Configura alertas
2. **Documentación**: Actualiza README
3. **Training**: Entrena al equipo
4. **Metrics**: Configura dashboard
5. **Feedback**: Recopila sugerencias

---

**¿Necesitas ayuda con algún paso del deployment?**
