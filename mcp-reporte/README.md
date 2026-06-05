# MCP: Descarga automática del reporte de movilidad

Servidor MCP **sin dependencias** (solo Python estándar) que permite a Claude
descargar el reporte en crudo directamente desde tu URL/API, para luego cargarlo
en el dashboard.

## Puesta en marcha (1 sola vez)

### 1. Crea tu configuración local
Copia la plantilla y edítala con tus datos reales:

```
copy mcp-reporte\config.example.json mcp-reporte\config.local.json
```

Abre `mcp-reporte/config.local.json` y llena:

| Campo | Qué poner |
|-------|-----------|
| `url` | La URL directa que descarga el reporte (CSV o XLSX). **Obligatorio.** |
| `auth_header` | Si la URL pide token: nombre del header (`Authorization` o `x-api-key`). Si no, déjalo vacío. |
| `auth_value` | El valor del token (`Bearer eyJ...` o tu API key). Vacío si no aplica. |
| `output_dir` | Carpeta destino. Vacío = la carpeta del proyecto (junto a `index.html`). |
| `filename` | Nombre del archivo, p.ej. `reporte_movilidad.csv`. |
| `verify_ssl` | Pon `false` si la red corporativa rompe el certificado SSL (mismo problema que el `git push`). |

> 🔒 `config.local.json` **NO se sube a GitHub** (está en `.gitignore`), así que tu URL y token quedan privados.

### 2. El MCP ya está registrado
El archivo `.mcp.json` en la raíz del proyecto ya registra este servidor. La
próxima vez que abras Claude Code en esta carpeta, aparecerá la herramienta.
Claude pedirá tu aprobación para activar el MCP la primera vez.

## Uso

Solo dile a Claude algo como:

> "Descarga el reporte más reciente"

Claude usará la herramienta **`descargar_reporte`**, que guarda el archivo en la
carpeta del proyecto y te dice la ruta. Después puedes cargarlo en el dashboard.

### Herramientas disponibles
- **`descargar_reporte`** — baja el reporte desde la URL configurada. Acepta
  override opcional de `url` y `filename`.
- **`ver_configuracion`** — muestra la config actual (sin revelar el token).

## Solución de problemas

| Síntoma | Causa / arreglo |
|---------|-----------------|
| `No hay URL configurada` | Falta crear/llenar `config.local.json`. |
| Error de certificado SSL | Pon `"verify_ssl": false` en `config.local.json`. |
| `HTTP 401/403` | El token (`auth_header`/`auth_value`) falta o expiró. |
| `HTTP 404` | La URL cambió o no es el enlace directo de descarga. |
| Python no encontrado | Instala Python 3.7+ y asegúrate de que `python` esté en el PATH. |

## Cómo probarlo manualmente (opcional)

```
python mcp-reporte\server.py
```
y pega una línea JSON-RPC, p.ej.:
```
{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"ver_configuracion","arguments":{}}}
```
