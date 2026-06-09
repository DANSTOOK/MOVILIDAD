# 🚀 OXXO Movilidad - Acceso Localhost

## ✅ SERVIDOR ACTIVO EN LOCALHOST

El servidor está corriendo en:

```
🌐 http://localhost:8080
```

---

## 📱 ACCESO INMEDIATO

### **Opción 1: Dashboard Principal** (Recomendado)
```
http://localhost:8080
```
O
```
http://localhost:8080/index.html
```

### **Opción 2: Test de Conexión**
```
http://localhost:8080/test-login.html
```

---

## 🎯 QUÉ PUEDES HACER

✅ **Cargar archivos CSV** - Usa el formulario de upload  
✅ **Ver analytics** - Gráficos e información  
✅ **Guardar datos localmente** - localStorage  
✅ **Exportar reportes** - PDF y PNG  
✅ **Generar QR codes**  
✅ **Crear notas de seguimiento**  

---

## 📋 MODO LOCAL

- ✅ SIN API EXTERNO (funciona completamente offline)
- ✅ Todos los datos se guardan en localStorage
- ✅ Los datos persisten al cerrar y abrir navegador
- ✅ Puedes cargar archivos CSV

---

## 🔧 PARA CONECTAR A TUS APIs DESPUÉS

Cuando tengas tus APIs listas:

1. Abre `index.html`
2. Busca línea ~11600:
   ```javascript
   var API_BASE_URL = 'http://localhost:3001';
   ```

3. Cámbialo a tu URL:
   ```javascript
   var API_BASE_URL = 'http://tu-api.com';
   ```

4. Reload la página

---

## 🛑 PARA DETENER EL SERVIDOR

### Windows:
- Haz click en la terminal donde está corriendo
- Presiona **Ctrl+C**

### Mac/Linux:
```bash
pkill -f "node server-local.js"
```

---

## 🔄 PARA REINICIAR

### Windows - Opción 1 (Rápido):
```
Haz doble click en: INICIAR.bat
```

### Windows - Opción 2 (Manual):
```bash
cd "C:/Users/5481292/Downloads/PROYECTOS CLAUDE/REPORTE MOVILIDAD"
node server-local.js
```

### Mac/Linux:
```bash
bash INICIAR.sh
```

---

## ✨ EJEMPLO: CARGAR CSV

1. Abre http://localhost:8080
2. Verás una pantalla de upload
3. Haz click en "Cargar archivo"
4. Selecciona tu CSV con datos de equipos
5. El dashboard se llena automáticamente

---

## 📊 DATOS DE PRUEBA

Si no tienes CSV, puedes:
1. Usar modo local (datos vacíos)
2. Agregar datos manualmente desde la UI
3. Los datos se guardarán en localStorage

---

## 🎨 PANTALLAS DISPONIBLES

| URL | Descripción |
|-----|------------|
| / | Dashboard principal |
| /index.html | Dashboard (explícito) |
| /test-login.html | Test de API |
| /test-login.html | Verificar conexiones |

---

## 📞 SOPORTE

### Servidor no inicia:
```bash
# Verifica Node.js
node -v

# Si no está, descarga de: https://nodejs.org
```

### Puerto 8080 ocupado:
```bash
# Encuentra el proceso
lsof -i :8080

# Termínalo
kill -9 <PID>
```

### Página en blanco:
- Abre consola (F12)
- Revisa errors rojos
- Reload (Ctrl+Shift+R)

---

## 🎊 ¡LISTO!

Tu dashboard está activo en **http://localhost:8080** 🚀

Puedes:
1. ✅ Cargar datos CSV
2. ✅ Ver analytics
3. ✅ Guardar información
4. ✅ Exportar reportes
5. ✅ Generar QR codes

---

**¿Todo funciona? ¡Adelante con tus datos!** 🎯
