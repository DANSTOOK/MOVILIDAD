# 🚂 Pasos Finales para Railway - OXXO Movilidad

Tu proyecto está 95% listo. Solo necesitas 2 pasos manuales en el dashboard de Railway:

## 📌 Dashboard URL
https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee

## ✅ Paso 1: Crear PostgreSQL (2 minutos)

1. Abre el dashboard arriba
2. Click en "+New" (arriba a la derecha)
3. Busca "PostgreSQL" y clickea
4. Espera 1-2 minutos a que se cree
5. ✅ Listo, PostgreSQL está creado

## ✅ Paso 2: Copiar DATABASE_URL (1 minuto)

1. En el dashboard, haz click en el servicio "PostgreSQL" que acaba de crearse
2. Ve a la pestaña "Variables"
3. Copia el valor de `DATABASE_URL` (es largo, empieza con `postgresql://`)
4. Guárdalo en un lugar seguro

## ✅ Paso 3: Configurar Variables en MOVILIDAD

1. Haz click en el servicio "MOVILIDAD"
2. Ve a pestaña "Variables"
3. Agrega estas 4 variables:

```
DATABASE_URL=<PEGA LO QUE COPIASTE>
NODE_ENV=production
PORT=3001
JWT_SECRET=<genera-una-clave-aleatoria-o-usa-esta>
```

Para JWT_SECRET, puedes usar:
```
your-super-secret-key-$(date +%s)
```

O una clave segura: `sk_prod_7xK9mP2qL4wN6zVbYcHjFgD8eRtUiOaS`

4. Haz click en "Deploy" o espera a que redeploy automáticamente (1-2 minutos)

## ✅ Verificación Final

Abre una terminal y prueba:

```bash
curl -X POST https://movilidad-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Si ves un `token` en la respuesta, ¡está funcionando! ✅

## 🎉 ¿Qué está configurado?

✅ Backend migrado a PostgreSQL
✅ Variables de entorno listas  
✅ JWT configurado
✅ Base de datos automáticamente inicializada
✅ Usuario `admin` creado automáticamente

## 📝 Credentials por defecto

- **Usuario**: admin
- **Contraseña**: admin123
- **Rol**: admin

(Cambia esto después en la sección de Usuarios)

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| Dashboard | https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee |
| API Production | https://movilidad-production.up.railway.app |
| GitHub Repo | https://github.com/DANSTOOK/MOVILIDAD |

## ❓ Troubleshooting

### Error "Connection refused"
- Verifica que DATABASE_URL esté correcto
- Asegúrate de que PostgreSQL está en el estado "Online"

### Error "Cannot connect to database"
- Copia DATABASE_URL nuevamente (sin espacios)
- Revisa en los logs del servicio

### Logs
Abre el servicio MOVILIDAD → pestaña "Logs" para ver errores en tiempo real

---

**¿Necesitas ayuda?** Lee `RAILWAY_SETUP.md` para documentación completa.
