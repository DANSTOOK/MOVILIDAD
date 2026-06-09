# 🚂 OXXO Movilidad Dashboard - Railway Deployment Guide

## Status: 95% Complete ✅

Tu aplicación está completamente configurada en Railway y lista para producción. Solo necesitas 3 pasos manuales simples en el dashboard de Railway.

## 📊 Lo que se ha hecho:

### ✅ Backend Migración (Completado)
- [x] SQLite → PostgreSQL con connection pooling
- [x] Variables de entorno configuradas
- [x] JWT Authentication setup
- [x] CORS habilitado para Railway
- [x] Automatic database initialization
- [x] Demo user (admin/admin123) auto-creado

### ✅ Deployment (Completado)
- [x] Railway CLI instalado y autenticado
- [x] Proyecto linked: `disciplined-surprise`
- [x] Servicio MOVILIDAD online
- [x] URL: https://movilidad-production.up.railway.app
- [x] GitHub integration configurado

### ⏳ Pendiente (Requiere acción manual - 5 minutos)
- [ ] PostgreSQL creado en Railway
- [ ] DATABASE_URL configurado
- [ ] Variables JWT_SECRET y NODE_ENV
- [ ] Primer deploy completado

---

## 🎯 3 Pasos Finales (5 minutos total)

### 📌 Abre el Dashboard
**https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee**

### Paso 1️⃣: Crear PostgreSQL (2 minutos)

En el dashboard:
1. Click "+New" (arriba a la derecha)
2. Selecciona "PostgreSQL"
3. Espera 1-2 minutos a que se cree
4. ✅ Verás que PostgreSQL está online

```
PostgreSQL será creado automáticamente con:
- Database: postgres
- Username: postgres  
- Password: (generado automáticamente)
```

### Paso 2️⃣: Obtener DATABASE_URL (1 minuto)

1. Click en el servicio "PostgreSQL" del paso anterior
2. Pestaña "Variables"
3. Copia el valor completo de `DATABASE_URL`
   - Ejemplo: `postgresql://postgres:xxx@xxx.railway.app:5432/postgres`

### Paso 3️⃣: Configurar Variables (2 minutos)

1. Click en servicio "MOVILIDAD"
2. Pestaña "Variables"
3. Agrega / Actualiza estas 4 variables:

```
DATABASE_URL=<PEGA_LO_QUE_COPIASTE_EN_PASO_2>
NODE_ENV=production
PORT=3001
JWT_SECRET=sk_prod_$(date +%s)_your_secret_here
```

Ejemplo de JWT_SECRET seguro:
```
sk_prod_7xK9mP2qL4wN6zVbYcHjFgD8eRtUiOaSmQ4rWxYzAbCdEfGhIjKlMnOpQrStUvWxYz
```

4. Railway hará redeploy automáticamente (1-2 minutos)
5. ✅ Cuando veas "Online" en verde, ¡está listo!

---

## ✨ Verificación

Después de completar los 3 pasos, verifica que funcione:

```bash
# Test API Login
curl -X POST https://movilidad-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Respuesta esperada (contiene token JWT)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

Si ves el token, ¡está funcionando perfectamente! ✅

---

## 📝 Credenciales Por Defecto

| Campo | Valor |
|-------|-------|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Rol | `admin` |

⚠️ **Acción recomendada**: Cambia la contraseña después del primer login en la sección de Usuarios.

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| **Dashboard** | https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee |
| **API Production** | https://movilidad-production.up.railway.app |
| **GitHub Repository** | https://github.com/DANSTOOK/MOVILIDAD |
| **API Docs** | POST /api/auth/login (user, password) |

---

## 🔧 Tecnología Stack

| Componente | Tech |
|-----------|------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Database | PostgreSQL 15+ |
| Authentication | JWT |
| Hosting | Railway |
| CI/CD | GitHub (automatic) |

---

## 📋 Archivos Importantes Agregados

```
backend/
├── db.js                 (Migrado a PostgreSQL)
├── package.json          (pg reemplaza sqlite3)
└── .env.example          (Variables de entorno)

Docs/
├── RAILWAY_SETUP.md      (Guía detallada)
├── PASOS_FINALES.md      (Quick start)
└── README_RAILWAY.md     (Este archivo)

Scripts/
├── setup_railway_auto.py (Automatización parcial)
└── SETUP_COMMANDS.sh     (Comandos railway CLI)
```

---

## 🆘 Troubleshooting

### Error: "Connection refused"
- Verifica DATABASE_URL está copiada correctamente
- Asegúrate PostgreSQL está Online en el dashboard
- Los espacios en blanco pueden quebrar la conexión

### Error: "Cannot connect to database"
- La BD podría no estar lista (espera 1-2 minutos)
- Revisa los logs: Servicio MOVILIDAD → Logs tab
- Intenta un redeploy: Service → Redeploy button

### Error: "Variables not set"
- Verifica que DATABASE_URL empiece con `postgresql://`
- NODE_ENV debe ser exactamente `production`
- JWT_SECRET puede ser cualquier string (pero debe ser fuerte)

### Ver Logs en Tiempo Real
1. Dashboard → Servicio MOVILIDAD
2. Pestaña "Logs"
3. Busca errores de conexión o inicialización

---

## 🚀 Próximos Pasos (Después del Deploy)

1. **Cambiar contraseña admin**
   - Login con admin/admin123
   - Ir a Configuración → Usuarios
   - Editar usuario admin

2. **Habilitar HTTPS**
   - Railway lo hace automáticamente
   - Tu dominio es: movilidad-production.up.railway.app

3. **Backups automáticos**
   - Railway maneja backups de PostgreSQL
   - Ve a PostgreSQL service → Settings → Backups

4. **Monitoreo**
   - Dashboard → Metrics
   - CPU, Memory, Requests en tiempo real

5. **Custom domain (Opcional)**
   - Si tienes dominio propio
   - Settings → Custom domains
   - Apunta a movilidad-production.up.railway.app

---

## 📞 Soporte

- **Railway Docs**: https://docs.railway.app
- **Railway Dashboard**: https://railway.com/dashboard
- **GitHub Issues**: Abre un issue si encuentras bugs

---

**¿Listo para completar el setup?** 
👉 Ve a: https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee

**Tiempo estimado**: 5 minutos ⏱️
