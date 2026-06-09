# 🚀 RAILWAY + FRONTEND - SETUP EN 5 MINUTOS

## 📋 CHECKLIST RÁPIDA

```
⬜ Crear cuenta en Railway
⬜ Conectar GitHub a Railway
⬜ Deployar backend
⬜ Obtener URL de Railway
⬜ Actualizar frontend
⬜ Hacer commit y push
⬜ Verificar que funciona
```

---

## ⚡ OPCIÓN 1: AUTOMÁTICO (Recomendado)

### Paso 1: Crea cuenta en Railway
```
1. Va a https://railway.app
2. Click "Start Project"
3. Selecciona "Deploy from GitHub"
4. Autoriza y selecciona DANSTOOK/MOVILIDAD
5. Click "Deploy"
6. Espera 5-10 minutos ☕
```

### Paso 2: Copia la URL de Railway
Después de deploy, verás algo como:
```
https://oxxo-movilidad-api-production.up.railway.app
```

### Paso 3: Actualiza frontend (AUTOMÁTICO)
```bash
# Reemplaza con TU URL de Railway
node update-api-url.js "https://oxxo-movilidad-api-production.up.railway.app"
```

### Paso 4: Commit y push
```bash
git add index.html
git commit -m "Update API to Railway production"
git push origin main
```

✅ **¡LISTO!** Tu app está conectada a Railway

---

## 🔧 OPCIÓN 2: MANUAL

Si prefieres hacerlo manualmente:

### En index.html:
Busca línea ~11600 y cambia:
```javascript
// Antes:
var API_BASE_URL = 'http://localhost:3001';

// Después:
var API_BASE_URL = 'https://tu-url-railway.com';
```

---

## ✅ VERIFICACIÓN

```bash
# 1. Abre el navegador
http://localhost:8080

# 2. Login
Usuario: admin
Contraseña: admin123

# 3. Deberías ver:
✅ Dashboard cargado
✅ Datos desde Railway API
✅ Sin errores de conexión
```

---

## 📊 VARIABLES NECESARIAS EN RAILWAY

Railway necesita estas variables:
```
PORT=3001
NODE_ENV=production
JWT_SECRET=tu-secret-super-seguro
DB_PATH=./data/oxxo_movilidad.db
GOOGLE_MAPS_API_KEY=your-key-if-needed
```

**Railway las configura automáticamente** durante el deploy.

---

## 🎯 DESPUÉS DE DEPLOYAR

### Logs en tiempo real:
```
Railway Dashboard → Logs
```

### Ver estado:
```
Railway Dashboard → Deployments
```

### Reiniciar:
```
Railway Dashboard → Redeploy Latest
```

### Ver variables:
```
Railway Dashboard → Variables
```

---

## 💡 TIPS

✅ **Auto-redeploy**: Cada push a GitHub auto-deploya  
✅ **Monitoreo**: Railway muestra CPU, RAM, logs  
✅ **Rollback**: Puedes volver a versión anterior fácil  
✅ **Custom domain**: Conecta tu dominio en Railway  

---

## 🆘 TROUBLESHOOTING

### "Connection refused"
- Backend aún deployando (espera 10 min)
- Verifica Railway logs

### "Invalid JWT"
- JWT_SECRET debe coincidir
- Revisa Variables en Railway

### "502 Bad Gateway"
- Backend crashed
- Ve a Railway → Logs para ver error

---

## 📞 RESUMEN FINAL

| Paso | Acción | Tiempo |
|------|--------|--------|
| 1 | Crear cuenta Railway | 2 min |
| 2 | Conectar GitHub | 1 min |
| 3 | Deployar backend | 5-10 min |
| 4 | Obtener URL | 1 min |
| 5 | Actualizar frontend | 30 seg |
| 6 | Commit y push | 1 min |
| 7 | Verificar | 2 min |

**Total: ~15-20 minutos** ⏱️

---

**¿Terminaste el setup? Avísame si tienes problemas** 🚀
