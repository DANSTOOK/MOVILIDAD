# 🚀 PostgreSQL Setup usando Neon

Como alternativa a esperar manualmente en el dashboard de Railway, puedes usar **Neon** que es un proveedor de PostgreSQL serverless gratuito y vincularlo a Railway.

## Opción 1: Neon (Recomendado - 2 minutos)

### Paso 1: Crear BD en Neon
1. Ve a https://console.neon.tech
2. Sign up (gratis)
3. Crea un proyecto
4. Copia el connection string `postgresql://...`

### Paso 2: Configurar en Railway
```bash
railway variable set DATABASE_URL="<pega_neon_connection_string>"
```

Listo. Railway usará Neon como BD.

## Opción 2: Railway PostgreSQL Plugin (Automático)

Si prefieres que Railway cree su propio PostgreSQL:

1. Ve a dashboard: https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee
2. Click "+New"
3. Busca "PostgreSQL" 
4. Espera 1-2 minutos
5. Copia DATABASE_URL del plugin
6. Ejecuta: `railway variable set DATABASE_URL="<value>"`
7. Railway redeploya automáticamente

---

Elige la opción más cómoda. La Opción 1 es más rápida.
