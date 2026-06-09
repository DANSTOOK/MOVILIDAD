# ⚡ Crear PostgreSQL en 2 Minutos

## Opción 1: Railway Plugin (OPCIÓN RECOMENDADA AHORA)

Ya que estamos dentro de Railway, la forma más fácil es:

```bash
# Abre browser a:
# https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee

# Luego en terminal, ejecuta:

# 1. Ver servicios disponibles
railway service list

# 2. Railway debe poder detectar que necesitas PostgreSQL
# Intenta este comando que podría funcionar:
railway add postgres
```

Si `railway add postgres` funciona:
- Railway crea el servicio automáticamente
- Expone DATABASE_URL automáticamente
- Tu backend se conecta automáticamente

## Opción 2: Neon.tech (Alternativa rápida)

```bash
# 1. Ve a https://console.neon.tech
# 2. Haz click en "Sign up" (gratis, sin tarjeta)
# 3. Completa el signup en 30 segundos
# 4. Abre tu proyecto
# 5. Copia el connection string (Connection string tab)
# 6. Pega en terminal:

railway variable set DATABASE_URL="postgresql://user:password@host:5432/db"
```

## Opción 3: ElephantSQL (También rápida)

```bash
# 1. Ve a https://www.elephantsql.com
# 2. Sign up (gratis)
# 3. Crea una instancia
# 4. Copia la URL
# 5. En terminal:

railway variable set DATABASE_URL="postgresql://user:password@host:5432/db"
```

---

## Verificación Final

Después de cualquier opción:

```bash
# 1. Verifica que la variable se grabó:
railway variable list | grep DATABASE_URL

# 2. Railway redeploya automáticamente
# Espera 2-3 minutos

# 3. Prueba la API:
curl -X POST https://movilidad-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Si ves un token JWT, ¡FUNCIONA! ✅
```

---

## ¿Cuál elegir?

| Opción | Ventajas | Tiempo | Requiere |
|--------|----------|--------|----------|
| **Railway Plugin** | Incluido, automático | 2-3 min | Dashboard click |
| **Neon.tech** | Rápido, 500MB gratis | 2 min | Signup |
| **ElephantSQL** | Simple, 20MB gratis | 2 min | Signup |

**RECOMENDACIÓN**: Railway Plugin si funciona el comando `railway add postgres`

Si no funciona → Usa Neon (es lo más rápido)

