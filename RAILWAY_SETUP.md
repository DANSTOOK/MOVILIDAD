# 🚀 RAILWAY DEPLOYMENT - GUÍA RÁPIDA

## ✅ PRE-REQUISITOS

1. **Cuenta en Railway** (gratis con $5 de crédito)
   - Va a https://railway.app
   - Haz click "Start Project"
   - Usa GitHub para login (recomendado)

2. **Repositorio en GitHub** (ya lo tienes: DANSTOOK/MOVILIDAD)

---

## 🎯 PASO 1: CREAR PROYECTO EN RAILWAY

1. Va a https://railway.app/dashboard
2. Click "New Project"
3. Selecciona "Deploy from GitHub"
4. Autoriza y selecciona tu repo `DANSTOOK/MOVILIDAD`

---

## ⚙️ PASO 2: CONFIGURAR BACKEND

Railway auto-detecta Node.js:

1. En el dashboard, ve a "Variables"
2. Agrega:
   ```
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=oxxo-production-secret-super-seguro-123456
   DB_PATH=./data/oxxo_movilidad.db
   GOOGLE_MAPS_API_KEY=your-key-here
   ```

3. Click "Deploy"

---

## 📱 PASO 3: OBTENER URL DE RAILWAY

Después del deploy (5-10 minutos):

1. Railway te da una URL como:
   ```
   https://oxxo-movilidad-api-production.up.railway.app
   ```

2. **COPIA ESTA URL**

---

## 🔗 PASO 4: ACTUALIZAR FRONTEND

En `index.html`, busca línea ~11600:

**Cambiar DE:**
```javascript
var API_BASE_URL = 'http://localhost:3001';
```

**A:**
```javascript
var API_BASE_URL = 'https://oxxo-movilidad-api-production.up.railway.app';
```

(Reemplaza con TU URL de Railway)

---

## 🔄 PASO 5: COMMIT Y PUSH

```bash
git add index.html
git commit -m "Update API URL to Railway production"
git push origin main
```

Railway auto-redeploy cuando haces push 🎉

---

## ✅ VERIFICACIÓN

1. Abre el frontend (localhost:8080 o tu dominio)
2. Login:
   - Usuario: `admin`
   - Contraseña: `admin123`
3. Dashboard debe cargar datos del API en Railway ✅

---

## 🎊 ¡LISTO!

Ahora tienes:
- ✅ Backend corriendo en Railway (24/7)
- ✅ Frontend en localhost (o tu dominio)
- ✅ Conectados automáticamente
- ✅ Auto-deploy en cada push a GitHub

---

## 📊 MONITOREO

En Railway dashboard:
- Ver logs en tiempo real
- Monitorear CPU y memoria
- Ver últimos deployments
- Crear alerts

---

## 💰 COSTOS

- Primeros $5/mes gratis
- Después $0.50/vCPU/hora
- Típicamente: $5-10/mes para esta app

---

## 🆘 SI HAY PROBLEMAS

### Error: "Connection refused"
- Backend aún está deployando (espera 5-10 min)
- Verifica Railway logs

### Error: "Invalid JWT"
- JWT_SECRET debe ser el mismo en Railway y frontend
- Verifica que esté configurado en Variables

### Error: "Database locked"
- SQLite tiene límites
- Usa PostgreSQL en Railway (Phase 2)

---

**¿Seguiste estos pasos? ¡Avísame!** 🚀
