# 🚂 Railway Setup Guide - OXXO Movilidad Dashboard

## Paso 1: Crear Proyecto en Railway

1. Ve a https://railway.com/login
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto

## Paso 2: Agregar Base de Datos PostgreSQL

1. En tu proyecto Railway, haz click en "New"
2. Selecciona "PostgreSQL" (la opción de base de datos)
3. Espera a que se cree la instancia (1-2 minutos)
4. Haz click en la BD para ver la configuración
5. Copia la URL de conexión (DATABASE_URL)

## Paso 3: Agregar Backend API

### Opción A: Deploy desde GitHub (Recomendado)
1. Conecta tu repositorio GitHub a Railway
2. Selecciona la rama `main`
3. Railway detectará automáticamente que es Node.js

### Opción B: Deploy Manual
1. En tu proyecto Railway, haz click en "New"
2. Selecciona "GitHub Repo"
3. Autoriza a Railway para acceder a tus repositorios
4. Selecciona tu repositorio

## Paso 4: Configurar Variables de Entorno

En Railway (en la pestaña del servicio backend):

1. Haz click en "Variables"
2. Agrega las siguientes variables:

```
DATABASE_URL=<pega la URL que copiaste de PostgreSQL>
PORT=3001
NODE_ENV=production
JWT_SECRET=tu-clave-secreta-super-segura-aqui
CORS_ORIGIN=https://tu-dominio.railway.app
```

## Paso 5: Configurar el Root Directory

1. En la pestaña "Settings" del servicio backend
2. Establece "Root Directory" a `backend`
3. Establece "Build Command" a `npm install`
4. Establece "Start Command" a `npm start`

## Paso 6: Deploy

1. Railway debería hacer deploy automáticamente después de la última actualización
2. Puedes ver los logs en tiempo real en la sección "Logs"
3. Una vez que veas "listening on port 3001", está listo

## Paso 7: Conectar Frontend a Railway

En el archivo `index.html`, busca la línea:

```javascript
const API_BASE_URL = 'http://localhost:3001';
```

Reemplázala con:

```javascript
const API_BASE_URL = 'https://tu-servicio-railway.railway.app';
```

O mejor aún, usa una variable de entorno:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://tu-servicio-railway.railway.app';
```

## Verificación

1. Abre Railway y ve a tu servicio backend
2. Copia la URL pública (ej: `https://movilidad-prod.railway.app`)
3. Prueba el login:
   ```
   POST https://tu-servicio-railway.railway.app/api/auth/login
   Body: { "username": "admin", "password": "admin123" }
   ```

4. Si ves un token JWT en la respuesta ✅, ¡está funcionando!

## Solución de Problemas

### "Connection refused" o "Cannot connect to database"
- Verifica que la DATABASE_URL esté correcta
- Asegúrate de que PostgreSQL esté corriendo en Railway
- Revisa los logs del servicio

### "Port already in use"
- Railway maneja automáticamente los puertos
- El servicio debería correr en `0.0.0.0:3001`

### Tabla de usuarios vacía
- Railway ejecuta `npm start` que llama `initDB()` y `initDemoUser()`
- Verifica en los logs que veas `✓ Demo user created`

## Escala Automática

Railway escalará automáticamente basado en:
- CPU usage
- Memory usage
- Conexiones activas

No necesitas configurar nada adicional para esto.

## Costos

Railway tiene un plan gratuito con:
- 5GB de almacenamiento de BD
- Créditos de $5 USD/mes
- 100 horas de ejecución de aplicación

Si necesitas más, puedes activar "Pro" mode que es ~$10 USD/mes.
