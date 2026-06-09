# 🚀 RAILWAY - SOLO 3 PASOS (5 MINUTOS)

## ✅ ESTADO ACTUAL

✅ **Servidor local corriendo**: http://localhost:8080  
✅ **Backend listo para Railway**  
✅ **Frontend listo para conectar**  
✅ **GitHub actualizado con todos los cambios**

---

## 🎯 SOLO NECESITAS HACER 3 COSAS:

### **PASO 1️⃣: VA A RAILWAY.APP**

Abre en Brave (o cualquier navegador):
```
https://railway.app/dashboard
```

---

### **PASO 2️⃣: CONECTA GITHUB**

En Railway:
1. Click **"New Project"**
2. Click **"Deploy from GitHub"**
3. Autoriza GitHub (si no lo hiciste)
4. Selecciona: **DANSTOOK/MOVILIDAD**
5. Click **"Deploy"**

**⏳ Espera 5-10 minutos** (Railway está construyendo)

---

### **PASO 3️⃣: COPIA LA URL Y CORRE UN COMANDO**

Cuando Railway termine:
1. Ve a **Railway Dashboard**
2. Copia la URL que ves (algo como):
   ```
   https://oxxo-movilidad-api-production.up.railway.app
   ```

3. En tu terminal, ejecuta:
   ```bash
   node update-api-url.js "PEGA-TU-URL-AQUI"
   ```

   Ejemplo:
   ```bash
   node update-api-url.js "https://oxxo-movilidad-api-production.up.railway.app"
   ```

4. Luego:
   ```bash
   git add index.html
   git commit -m "Update API to Railway production"
   git push origin main
   ```

---

## ✨ ¡ESO ES TODO!

Ahora:
- ✅ Backend corre en Railway (24/7)
- ✅ Frontend conectado a Railway
- ✅ Auto-redeploy en cada push a GitHub
- ✅ Todos pueden usar tu app

---

## 🌐 URLS FINALES

| Componente | URL |
|-----------|-----|
| **Desarrollo (Localhost)** | http://localhost:8080 |
| **Producción (Railway)** | https://oxxo-movilidad-api-production.up.railway.app |
| **Tu App** | http://localhost:8080 (apunta a Railway) |

---

## 📊 TIMELINE

| Acción | Tiempo |
|--------|--------|
| Paso 1: IR A RAILWAY | 1 min |
| Paso 2: DEPLOY | 5-10 min |
| Paso 3: COMANDOS | 2 min |
| **TOTAL** | **8-13 min** |

---

## 🆘 SI TIENES DUDAS

### "¿Dónde copio la URL?"
**Railway Dashboard → Ver logs → Busca la URL HTTPS**

### "¿El comando update-api-url.js funciona?"
```bash
node update-api-url.js "https://tu-url.com"
```
Te dirá ✅ si funcionó

### "¿Cómo verifico que funciona?"
1. Abre http://localhost:8080 en navegador
2. Login con admin/admin123
3. Deberías ver datos (conectados a Railway)

---

## 🎊 ¡LISTO!

Tu app está:
- ✅ Funcionando localmente (ahora)
- ✅ Deployada en Railway (después de Paso 2)
- ✅ Conectada y sincronizada (después de Paso 3)

---

**¿EMPEZAMOS?**

1. Abre Brave
2. Va a https://railway.app/dashboard
3. Sigue los 3 pasos arriba
4. Avísame cuando termines 🚀
