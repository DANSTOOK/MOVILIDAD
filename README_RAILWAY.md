# 🚂 OXXO Movilidad — Deployment en Railway

## ✅ Estado: DESPLEGADO Y FUNCIONANDO EN PRODUCCIÓN

URL: **https://movilidad-production.up.railway.app**

| Componente | Estado |
|-----------|--------|
| Frontend (dashboard `index.html`) | ✅ Sirviendo (HTTP 200) |
| Backend API (Express) | ✅ Corriendo |
| Base de datos PostgreSQL | ✅ Conectada |
| Login / JWT | ✅ Funcionando |

## Arquitectura

Un **único servicio** (`MOVILIDAD`) sirve tanto el frontend como la API en el
mismo dominio, conectado a un servicio **PostgreSQL** de Railway:

```
movilidad-production.up.railway.app
├── /                → index.html (dashboard estático)
├── /api/health      → healthcheck (usado por Railway)
├── /api/auth/login  → login (devuelve JWT)
├── /api/auth/verify → valida token
└── /api/equipos     → datos (requiere token) → tabla PostgreSQL
```

- El backend (`backend/server.js`) sirve los archivos estáticos del repo raíz
  con `express.static` y expone los endpoints `/api/*`.
- Build vía `Dockerfile` (Node 18). Healthcheck en `/api/health`.
- `DATABASE_URL` en el servicio MOVILIDAD es una referencia a
  `${{Postgres.DATABASE_URL}}` (red privada de Railway).

## Servicios en el proyecto Railway

- **MOVILIDAD** — frontend + backend (repo `DANSTOOK/MOVILIDAD`)
- **Postgres** — base de datos PostgreSQL 16

Proyecto: https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee

## Variables de entorno (MOVILIDAD)

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referencia) |
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `JWT_SECRET` | configurado |

## Credenciales iniciales

- Usuario: `admin`
- Contraseña: `admin123`
- Rol: `admin`

> Cambia la contraseña tras el primer login.

## Verificación rápida

```bash
# Login (debe devolver un token JWT)
curl -X POST https://movilidad-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## Desarrollo local

El backend usa PostgreSQL. Para correr local hay un `docker-compose.yml`:

```bash
docker compose up
# Backend en http://localhost:3001 con Postgres incluido
```

O apunta `DATABASE_URL` en `backend/.env` a un PostgreSQL propio (ver
`backend/.env.example`).
