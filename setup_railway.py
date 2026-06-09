import subprocess
import json
import time

# Get the current token from railway login
result = subprocess.run(['railway', 'token'], capture_output=True, text=True)
token = result.stdout.strip()

if not token:
    print("❌ No se pudo obtener el token. Asegúrate de ejecutar 'railway login' primero")
    exit(1)

print(f"✓ Token obtenido")

# Railway API endpoint
api_url = "https://backboard.railway.com/graphql"
project_id = "1d79793e-5e0c-4d61-912b-14118534e7ee"

# Query to check existing services
check_query = """
query {
  project(id: "%s") {
    services {
      edges {
        node {
          id
          name
        }
      }
    }
  }
}
""" % project_id

print(f"📋 Consultando servicios existentes...")
result = subprocess.run([
    'curl', '-s', '-X', 'POST', api_url,
    '-H', f'Authorization: Bearer {token}',
    '-H', 'Content-Type: application/json',
    '-d', json.dumps({"query": check_query})
], capture_output=True, text=True)

print("✓ Servicios obtenidos")
print(result.stdout[:500])

