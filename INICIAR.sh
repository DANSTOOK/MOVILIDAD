#!/bin/bash

clear

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🚀 OXXO Movilidad - Iniciando Servidor Local           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    echo ""
    echo "Instala Node.js de: https://nodejs.org"
    echo ""
    exit 1
fi

echo "✅ Node.js detectado: $(node -v)"
echo ""
echo "⏳ Iniciando servidor en http://localhost:8080"
echo ""
sleep 2

# Iniciar servidor
node server-local.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Servidor iniciado exitosamente"
else
    echo ""
    echo "❌ Error al iniciar el servidor"
fi
