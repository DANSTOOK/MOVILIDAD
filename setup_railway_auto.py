#!/usr/bin/env python3
"""
Automatiza la configuración de Railway para OXXO Movilidad
Crea PostgreSQL, configura variables de entorno y hace deploy
"""

import subprocess
import sys
import time
import json

def run_command(cmd):
    """Ejecuta un comando y retorna el output"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        return result.stdout.strip(), result.returncode
    except subprocess.TimeoutExpired:
        return "Command timed out", 1
    except Exception as e:
        return str(e), 1

def main():
    print("🚂 Configurando Railway para OXXO Movilidad")
    print("=" * 60)
    
    # Verificar autenticación
    output, code = run_command("railway whoami")
    if code != 0:
        print("❌ No estás autenticado en Railway")
        print("   Ejecuta: railway login")
        sys.exit(1)
    print(f"✓ Autenticado como: {output}")
    
    # Listar servicios existentes
    print("\n📋 Servicios existentes:")
    output, _ = run_command("railway service list")
    print(output)
    
    # Preguntar si agregar PostgreSQL
    print("\n🔧 Pasos para agregar PostgreSQL:")
    print("   1. Ve a: https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee")
    print("   2. Click en '+New' (arriba a la derecha)")
    print("   3. Selecciona 'PostgreSQL'")
    print("   4. Espera 1-2 minutos a que se cree")
    print("   5. Vuelve aquí y presiona Enter para continuar")
    
    input("\n⏸️  Presiona Enter cuando PostgreSQL esté creado...")
    
    # Esperar un poco para que Railway actualice
    print("\n⏳ Esperando a que Railroad actualice los servicios...")
    time.sleep(5)
    
    # Obtener DATABASE_URL de PostgreSQL
    print("\n📦 Obteniendo DATABASE_URL...")
    output, code = run_command("railway service list --json")
    
    if code == 0:
        try:
            services = json.loads(output)
            # Buscar PostgreSQL
            db_url = None
            for service in services.get('services', []):
                if 'postgres' in service.get('name', '').lower():
                    # Obtener variables del servicio PostgreSQL
                    print(f"✓ Encontrado servicio: {service['name']}")
                    db_url = service.get('variables', {}).get('DATABASE_URL')
                    if db_url:
                        print(f"✓ DATABASE_URL obtenido")
                        break
            
            if not db_url:
                print("❌ No se pudo obtener DATABASE_URL automáticamente")
                print("   Copia manualmente desde el dashboard PostgreSQL")
                db_url = input("\nPega DATABASE_URL: ").strip()
        except json.JSONDecodeError:
            print("❌ Error procesando respuesta JSON")
            db_url = input("\nPega DATABASE_URL manualmente: ").strip()
    else:
        db_url = input("\nPega DATABASE_URL: ").strip()
    
    if not db_url:
        print("❌ DATABASE_URL no proporcionado")
        sys.exit(1)
    
    # Configurar variables de entorno
    print("\n⚙️  Configurando variables de entorno...")
    
    variables = {
        "DATABASE_URL": db_url,
        "NODE_ENV": "production",
        "PORT": "3001",
        "JWT_SECRET": "your-super-secret-key-change-in-production-" + str(int(time.time()))
    }
    
    for key, value in variables.items():
        cmd = f'railway variable set {key} "{value}"'
        output, code = run_command(cmd)
        if code == 0:
            print(f"✓ {key} configurado")
        else:
            print(f"⚠️  {key}: {output}")
    
    # Ver configuración final
    print("\n✅ Configuración final:")
    output, _ = run_command("railway variable list")
    print(output)
    
    # Forzar redeploy
    print("\n🚀 Iniciando redeploy...")
    output, _ = run_command("railway service redeploy --yes")
    print(output)
    
    print("\n" + "=" * 60)
    print("✅ Setup completado!")
    print("\nPróximos pasos:")
    print("  1. Espera 2-3 minutos para que Railway haga deploy")
    print("  2. Ve al dashboard: https://railway.com/project/1d79793e-5e0c-4d61-912b-14118534e7ee")
    print("  3. Verifica que el servicio MOVILIDAD esté 'Online'")
    print("  4. Prueba la API: curl https://movilidad-production.up.railway.app/api/auth/login")

if __name__ == "__main__":
    main()
