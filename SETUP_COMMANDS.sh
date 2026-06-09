#!/bin/bash

# Railway Setup Commands for OXXO Movilidad Dashboard
# Ejecuta estos comandos para configurar PostgreSQL y las variables de entorno

PROJECT_ID="1d79793e-5e0c-4d61-912b-14118534e7ee"

echo "🚂 Railway Setup para OXXO Movilidad"
echo "======================================"

# 1. Abrir dashboard
echo ""
echo "1. Abriendo dashboard de Railway..."
railway open

# 2. Instrucciones para agregar PostgreSQL
echo ""
echo "2. PASOS EN RAILWAY DASHBOARD:"
echo "   a) Click en '+New' (esquina superior derecha)"
echo "   b) Busca y selecciona 'PostgreSQL'"
echo "   c) Espera a que se cree la instancia (1-2 minutos)"
echo "   d) Click en el servicio PostgreSQL"
echo "   e) Copia la variable 'DATABASE_URL' completa"

# 3. Agregar variables de entorno
echo ""
echo "3. Agregando variables de entorno al servicio MOVILIDAD..."
echo "   Necesitas: DATABASE_URL (de PostgreSQL)"

read -p "¿Ya copiaste DATABASE_URL? (s/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    read -p "Pega DATABASE_URL: " db_url
    
    railway variable set DATABASE_URL "$db_url"
    echo "✓ DATABASE_URL configurado"
    
    railway variable set JWT_SECRET "$(openssl rand -hex 32)"
    echo "✓ JWT_SECRET generado automáticamente"
    
    railway variable set NODE_ENV "production"
    echo "✓ NODE_ENV=production"
    
    railway variable set PORT "3001"
    echo "✓ PORT=3001"
fi

# 4. Ver configuración
echo ""
echo "4. Configuración final:"
railway variable list

# 5. Deploy
echo ""
echo "5. Railway va a hacer redeploy automáticamente..."
railway service status

echo ""
echo "✅ Setup completado!"
echo ""
echo "Próximos pasos:"
echo "- Espera 2-3 minutos para que Railway haga redeploy"
echo "- Verifica que el servicio esté 'Online' en el dashboard"
echo "- Prueba la API: curl https://movilidad-production.up.railway.app/api/auth/login"
