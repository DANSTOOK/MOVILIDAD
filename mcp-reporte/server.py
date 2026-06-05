#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MCP server (sin dependencias externas) para descargar el reporte de movilidad
en crudo desde una URL/API directa.

Implementa el protocolo MCP sobre stdio (JSON-RPC 2.0 delimitado por saltos de
linea). Usa solo la libreria estandar de Python, por lo que corre en cualquier
maquina con Python 3.7+ sin necesidad de pip install.

Configuracion: lee mcp-reporte/config.local.json (no versionado). Ver
config.example.json para la plantilla. Tambien acepta overrides por variables
de entorno: REPORTE_URL, REPORTE_AUTH_HEADER, REPORTE_AUTH_VALUE,
REPORTE_OUTPUT_DIR, REPORTE_VERIFY_SSL.
"""

import sys
import os
import json
import ssl
import time
import urllib.request
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(HERE, "config.local.json")

PROTOCOL_VERSION = "2024-11-05"
SERVER_NAME = "reporte-movilidad"
SERVER_VERSION = "1.0.0"


# --------------------------------------------------------------------------
# Configuracion
# --------------------------------------------------------------------------
def load_config():
    cfg = {
        "url": "",
        "auth_header": "",      # p.ej. "Authorization" o "x-api-key"
        "auth_value": "",       # p.ej. "Bearer xxxxx"
        "output_dir": os.path.dirname(HERE),  # por defecto: carpeta del proyecto
        "filename": "reporte_movilidad.csv",
        "verify_ssl": True,     # ponlo en false si el proxy corporativo rompe el SSL
        "timeout_seconds": 60,
    }
    # 1) archivo config.local.json
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                disk = json.load(f)
            for k in cfg:
                if k in disk and disk[k] != "":
                    cfg[k] = disk[k]
        except Exception:
            pass
    # 2) overrides por entorno
    env_map = {
        "url": "REPORTE_URL",
        "auth_header": "REPORTE_AUTH_HEADER",
        "auth_value": "REPORTE_AUTH_VALUE",
        "output_dir": "REPORTE_OUTPUT_DIR",
        "filename": "REPORTE_FILENAME",
    }
    for key, env in env_map.items():
        if os.environ.get(env):
            cfg[key] = os.environ[env]
    if os.environ.get("REPORTE_VERIFY_SSL"):
        cfg["verify_ssl"] = os.environ["REPORTE_VERIFY_SSL"].lower() not in ("0", "false", "no")
    return cfg


# --------------------------------------------------------------------------
# Descarga
# --------------------------------------------------------------------------
def descargar(url_override=None, filename_override=None):
    cfg = load_config()
    url = url_override or cfg["url"]
    if not url:
        raise ValueError(
            "No hay URL configurada. Edita mcp-reporte/config.local.json y "
            "pon la URL directa del reporte en el campo \"url\"."
        )

    filename = filename_override or cfg["filename"]
    out_dir = cfg["output_dir"]
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, filename)

    req = urllib.request.Request(url, method="GET")
    req.add_header("User-Agent", "reporte-movilidad-mcp/1.0")
    if cfg["auth_header"] and cfg["auth_value"]:
        req.add_header(cfg["auth_header"], cfg["auth_value"])

    # Contexto SSL: permitir desactivar verificacion para proxies corporativos
    ctx = None
    if not cfg["verify_ssl"]:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=cfg["timeout_seconds"], context=ctx) as resp:
            data = resp.read()
            status = resp.status
            ctype = resp.headers.get("Content-Type", "desconocido")
    except urllib.error.HTTPError as e:
        raise RuntimeError("HTTP %s al descargar: %s" % (e.code, e.reason))
    except urllib.error.URLError as e:
        raise RuntimeError(
            "No se pudo conectar: %s. Si es un error de certificado, pon "
            "\"verify_ssl\": false en config.local.json." % e.reason
        )

    with open(out_path, "wb") as f:
        f.write(data)

    elapsed = round(time.time() - t0, 2)
    kb = round(len(data) / 1024.0, 1)
    return {
        "ok": True,
        "ruta": out_path,
        "bytes": len(data),
        "kb": kb,
        "http_status": status,
        "content_type": ctype,
        "segundos": elapsed,
    }


# --------------------------------------------------------------------------
# Definicion de herramientas MCP
# --------------------------------------------------------------------------
TOOLS = [
    {
        "name": "descargar_reporte",
        "description": (
            "Descarga el reporte de movilidad en crudo desde la URL/API "
            "configurada y lo guarda en la carpeta del proyecto. Devuelve la "
            "ruta del archivo descargado, su tamano y el estatus HTTP. Usa esto "
            "cuando el usuario quiera obtener el reporte mas reciente para "
            "cargarlo en el dashboard."
        ),
        "inputSchema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "Opcional. Sobrescribe la URL configurada para esta descarga.",
                },
                "filename": {
                    "type": "string",
                    "description": "Opcional. Nombre de archivo de salida (p.ej. reporte_2026-06-05.csv).",
                },
            },
            "required": [],
        },
    },
    {
        "name": "ver_configuracion",
        "description": (
            "Muestra la configuracion actual de la fuente del reporte (URL, "
            "carpeta de salida, verificacion SSL) SIN revelar el valor del token "
            "de autenticacion. Util para verificar que esta bien configurado."
        ),
        "inputSchema": {"type": "object", "properties": {}, "required": []},
    },
]


# --------------------------------------------------------------------------
# Manejo de peticiones JSON-RPC / MCP
# --------------------------------------------------------------------------
def handle(req):
    method = req.get("method")
    rid = req.get("id")

    if method == "initialize":
        return ok(rid, {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {}},
            "serverInfo": {"name": SERVER_NAME, "version": SERVER_VERSION},
        })

    if method in ("notifications/initialized", "initialized"):
        return None  # notificacion, sin respuesta

    if method == "ping":
        return ok(rid, {})

    if method == "tools/list":
        return ok(rid, {"tools": TOOLS})

    if method == "tools/call":
        params = req.get("params") or {}
        name = params.get("name")
        args = params.get("arguments") or {}
        try:
            if name == "descargar_reporte":
                res = descargar(args.get("url"), args.get("filename"))
                texto = (
                    "Reporte descargado correctamente.\n"
                    "- Ruta: %s\n- Tamano: %s KB (%s bytes)\n"
                    "- HTTP: %s | Tipo: %s\n- Tiempo: %ss"
                    % (res["ruta"], res["kb"], res["bytes"],
                       res["http_status"], res["content_type"], res["segundos"])
                )
                return ok(rid, {"content": [{"type": "text", "text": texto}]})

            if name == "ver_configuracion":
                cfg = load_config()
                safe = {
                    "url": cfg["url"] or "(sin configurar)",
                    "auth_header": cfg["auth_header"] or "(ninguno)",
                    "auth_value": "***configurado***" if cfg["auth_value"] else "(ninguno)",
                    "output_dir": cfg["output_dir"],
                    "filename": cfg["filename"],
                    "verify_ssl": cfg["verify_ssl"],
                    "timeout_seconds": cfg["timeout_seconds"],
                }
                return ok(rid, {"content": [{"type": "text",
                        "text": json.dumps(safe, indent=2, ensure_ascii=False)}]})

            return err(rid, -32602, "Herramienta desconocida: %s" % name)
        except Exception as e:
            # Error de herramienta: se reporta como contenido isError, no como
            # error de protocolo, para que el modelo lo vea y reaccione.
            return ok(rid, {
                "content": [{"type": "text", "text": "Error: %s" % str(e)}],
                "isError": True,
            })

    # Metodo no soportado
    if rid is not None:
        return err(rid, -32601, "Metodo no soportado: %s" % method)
    return None


def ok(rid, result):
    return {"jsonrpc": "2.0", "id": rid, "result": result}


def err(rid, code, message):
    return {"jsonrpc": "2.0", "id": rid, "error": {"code": code, "message": message}}


def main():
    # Loop principal: lee JSON-RPC delimitado por saltos de linea desde stdin.
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
        except Exception:
            continue
        # Soporta batch (lista) o mensaje unico
        msgs = req if isinstance(req, list) else [req]
        for m in msgs:
            resp = handle(m)
            if resp is not None:
                sys.stdout.write(json.dumps(resp) + "\n")
                sys.stdout.flush()


if __name__ == "__main__":
    main()
