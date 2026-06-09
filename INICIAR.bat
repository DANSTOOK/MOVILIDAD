@echo off
chcp 65001 >nul
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     🚀 OXXO Movilidad - Iniciando Servidor Local           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar que Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Node.js no está instalado o no está en PATH
    echo.
    echo Descarga Node.js de: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.
echo ⏳ Iniciando servidor en http://localhost:8080
echo.
timeout /t 2

REM Iniciar servidor
node server-local.js

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Servidor iniciado exitosamente
) else (
    echo.
    echo ❌ Error al iniciar el servidor
    pause
)
