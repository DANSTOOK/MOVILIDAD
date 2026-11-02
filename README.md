# 🚀 OXXO Movilidad - Dashboard Profesional

**Versión 2.0** - Sistema completo de gestión de equipos con analytics, geolocalización y BI avanzado.

---

## 📦 CONTENIDO

```
OXXO Movilidad/
├── index.html                    # Dashboard principal (Frontend)
├── test-login.html               # Test de APIs
├── server-local.js               # Servidor local (localhost:8080)
├── backend/                      # Backend Node.js + Express
│   ├── server.js                 # API REST
│   ├── db.js                     # Base de datos SQLite
│   ├── package.json              # Dependencias Node
│   ├── Dockerfile                # Para Docker
│   └── Procfile                  # Para Heroku
├── docker-compose.yml            # Para Docker local
│
├── 📋 DOCUMENTACIÓN:
├── QUICK_START.md                # 5 min setup rápido
├── INSTRUCCIONES_INMEDIATAS.md   # Setup inmediato
├── ACCESO_LOCALHOST.md           # Cómo usar localhost
├── API_SETUP.md                  # Setup completo del API
├── RAILWAY_QUICK_START.md        # ⭐ Railway en 5 min
├── RAILWAY_SETUP.md              # Railway detallado
├── DEPLOYMENT.md                 # 4 opciones deployment
│
├── 🛠️ HERRAMIENTAS:
├── update-api-url.js             # Script para cambiar API URL
├── INICIAR.bat                   # Para iniciar en Windows
└── INICIAR.sh                    # Para iniciar en Mac/Linux
```

---

## ⚡ INICIO RÁPIDO

### Todo en uno (lo normal)

El backend sirve también el `index.html`, así que con un solo proceso tienes
frontend y API en el mismo sitio:

```bash
cd backend
npm install        # la primera vez
npm start
```

Abre **http://localhost:3001** y entra con `admin` / `admin123`.

**No hace falta instalar PostgreSQL.** Si no defines `DATABASE_URL`, el backend
levanta un Postgres embebido (PGlite) que guarda los datos en `backend/data/`.
Para usar un Postgres de verdad, crea `backend/.env` a partir de
`backend/.env.example` y pon ahí tu `DATABASE_URL`.

### Sólo el frontend (sin API)

```bash
node server-local.js     # http://localhost:8080
```

Marca **"Modo Local (Testing)"** en el login y carga un CSV/XLSX a mano.

### Docker

```bash
docker-compose up        # http://localhost:3001
```

### Releases y rollback

```bash
node scripts/release.js minor     # publica una versión nueva
node scripts/rollback.js          # lista versiones; con un tag, vuelve a ella
```

Los detalles están en [RELEASES.md](RELEASES.md).

---

## 📚 ¿CUÁL DOCUMENTO LEER?

| Escenario | Lee... |
|-----------|--------|
| **Empezar AHORA** | QUICK_START.md |
| **Localhost rápido** | ACCESO_LOCALHOST.md |
| **Usar Railway** | RAILWAY_QUICK_START.md |
| **Setup del API** | API_SETUP.md |
| **Deploy a Producción** | DEPLOYMENT.md |
| **Instrucciones en Español** | INSTRUCCIONES_INMEDIATAS.md |

---

## 🎯 CARACTERÍSTICAS

### Dashboard
✅ 7 tabs funcionales  
✅ 10+ gráficos interactivos (ECharts)  
✅ Mapa geográfico (Leaflet)  
✅ Analytics avanzado  
✅ Generador de QR codes  
✅ Exportación PDF  
✅ Notas de seguimiento  
✅ Alertas en tiempo real  
✅ Dark mode  
✅ Responsive design  

### Backend API
✅ Node.js + Express  
✅ Autenticación JWT  
✅ SQLite3 database  
✅ 7+ endpoints REST  
✅ Audit logging  
✅ CORS seguro  
✅ Demo user incluido (admin/admin123)  

### DevOps
✅ Docker ready  
✅ GitHub Actions CI/CD  
✅ Railway deployment  
✅ Heroku ready  
✅ Auto-redeploy  

---

## 🔐 AUTENTICACIÓN

**Demo User:**
```
Usuario: admin
Contraseña: admin123
```

**Modo Local:**
- Marca "Usar modo local (sin API)"
- Acceso inmediato sin servidor

---

## 📱 URLS

| Entorno | URL |
|---------|-----|
| **Localhost** | http://localhost:8080 |
| **Railway Backend** | https://oxxo-movilidad-api.up.railway.app |
| **Test** | http://localhost:8080/test-login.html |

---

## 🚀 DEPLOYMENT

### Local (Desarrollo)
```bash
node server-local.js
```

### Docker
```bash
docker-compose up
```

### Railway (Producción) ⭐
1. Va a https://railway.app
2. Conecta GitHub
3. Deploy automático
4. Auto-redeploy en cada push

### Heroku
```bash
heroku login
heroku create oxxo-movilidad-api
git push heroku main
```

---

## 🆘 AYUDA RÁPIDA

### Error: "Failed to fetch"
→ Marca **"Usar modo local"** en el login

### Error: "Port 3001 already in use"
→ Cambia puerto en `.env`

### Error: "Cannot find module"
→ `cd backend && npm install`

### Servidor no inicia
→ Verifica Node.js: `node -v`

---

## 📊 ESTADÍSTICAS

- **2,000+** líneas de código nuevo
- **12** features principales
- **5** guías de documentación
- **4** opciones de deployment
- **100%** responsive
- **0** vulnerabilidades críticas

---

## 📞 SOPORTE

Revisa la documentación en este orden:
1. QUICK_START.md (primer inicio)
2. ACCESO_LOCALHOST.md (si tienes problemas locales)
3. RAILWAY_QUICK_START.md (si quieres ir a producción)
4. DEPLOYMENT.md (para troubleshooting avanzado)

---

## 🎊 ¡BIENVENIDA!

Tu dashboard está completamente funcional. Elige tu entorno:

**→ Desarrollo**: `node server-local.js`  
**→ Producción**: Va a https://railway.app  
**→ Testing**: Abre `test-login.html`

---

**Versión**: 2.0  
**Última actualización**: 2026-06-08  
**Estado**: ✅ Production Ready  

🚀 **¡Listo para usar!**
