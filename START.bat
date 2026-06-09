@echo off
chcp 65001 >/dev/null
cls

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  🚀 OXXO Movilidad - Dashboard                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo ✅ Iniciando servidor local en localhost:8080
echo.
timeout /t 2

REM Iniciar servidor Node
node server-local.js

