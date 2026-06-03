# 🧪 Testing Guide - Ejecución Paso a Paso

## 📊 Archivos de Testing Disponibles

1. **TESTING_SUITE.md** - Plan detallado de todos los tests
2. **STRESS_TEST.js** - Script automatizado para DevTools
3. **TEST_DASHBOARD.html** - Dashboard visual de testing
4. **Esta Guía** - Instrucciones de ejecución

---

## 🚀 OPCIÓN 1: Usando el Testing Dashboard (Recomendado)

### Paso 1: Abrir el Dashboard
```bash
# En tu navegador
file:///C:/Users/5481292/Downloads/PROYECTOS%20CLAUDE/REPORTE%20MOVILIDAD/TEST_DASHBOARD.html

# O simplemente abre el archivo TEST_DASHBOARD.html en tu navegador
```

### Paso 2: Cargar la Aplicación
1. Haz click en el botón **"Load Application"**
2. Espera a que cargue el iframe con index.html
3. El dashboard y la app estarán lado a lado

### Paso 3: Ejecutar Tests
```
Opción A: "▶️ Run All Tests"
  → Ejecuta todos los tests en secuencia
  → Toma ~5-10 minutos
  → Genera reporte completo

Opción B: "📊 Performance Tests Only"
  → Solo pruebas de rendimiento
  → Toma ~2 minutos
  
Opción C: "⚡ Stress Tests Only"
  → Solo pruebas de estrés
  → Toma ~3-5 minutos

Opción D: "🐛 Bug Detection"
  → Solo validación de bugs conocidos
  → Toma ~1 minuto
```

### Paso 4: Monitorear Resultados
- Observa la **progress bar** (avance)
- Lee los **logs en tiempo real** (consola verde)
- Revisa las **métricas** en cada tarjeta
- Consulta la **tabla de resultados** abajo

### Paso 5: Guardar Resultados
```bash
# Cuando terminen los tests:
1. Right-click en la página
2. "Guardar como" → Guarda el HTML
3. O abre DevTools (F12) y copia el contenido de cada metric
```

---

## 🔧 OPCIÓN 2: Usando el Script de DevTools (Avanzado)

### Paso 1: Abrir la Aplicación y DevTools
```bash
1. Abre index.html en el navegador
2. Presiona F12 para abrir DevTools
3. Ve a la pestaña "Console"
```

### Paso 2: Copiar y Ejecutar el Script
```bash
1. Abre STRESS_TEST.js en un editor de texto
2. Copia TODO el contenido
3. Pégalo en la consola de DevTools
4. Presiona Enter
```

### Paso 3: Monitorear en Tiempo Real
```bash
# Mientras se ejecuta, abre las pestañas de DevTools:
- Console: Ve los logs y resultados en tiempo real
- Performance: Monitor CPU y memoria
- Memory: Detecta memory leaks
- Network: Verifica requests
```

### Paso 4: Capturar Datos de Performance
```bash
En DevTools > Performance tab:
1. Click en el círculo rojo para grabar
2. Ejecuta los tests
3. Detén la grabación
4. Analiza el timeline
5. Export/screenshot los gráficos
```

---

## 📋 OPCIÓN 3: Validación Manual (Paso a Paso)

Si prefieres validar manualmente, aquí está el checklist:

### Test 1: Performance Baseline
```
✓ Abre index.html
✓ DevTools > Lighthouse
✓ Audit "Performance", "Accessibility", "Best Practices"
✓ Verifica:
  - Lighthouse Score > 90
  - TTI < 3 segundos
  - FCP < 1.5 segundos
  - No warnings críticas
```

### Test 2: Memory Leak Detection
```
✓ DevTools > Memory
✓ Toma snapshot inicial
✓ Interactúa con la app durante 5 minutos:
  - Carga archivos
  - Cambia de tabs
  - Aplica filtros
  - Exporta datos
✓ Toma snapshot final
✓ Compara snapshots:
  - Memory debe estar estable (+/- 10MB)
  - No debe haber crecimiento lineal
  - GC debe limpiar regularmente
```

### Test 3: Large File Upload
```
✓ Prepara archivo de prueba (10K+ filas)
✓ Observa DevTools > Performance durante upload
✓ Verifica:
  - Parse < 5 segundos
  - UI sigue respondiendo
  - No freezing
  - Todos los datos cargados
✓ Abre tabla y verifica últimas filas
```

### Test 4: Rapid Tab Switching
```
✓ Click rápidamente entre tabs (50+ veces)
✓ Observa:
  - Transiciones suaves (no lag)
  - Datos cargados correctamente
  - No errores en console
  - Memory estable
✓ DevTools > Performance > FPS (Frames per second)
  - Debe mantener 60 FPS o cercano
```

### Test 5: Serial Number Formatting
```
✓ Carga archivo con números seriales largos
✓ Abre tabla DETALLE
✓ Verifica cada serial:
  - NO está en notación científica (2.51E+13)
  - Está en formato completo (2511250000000)
✓ Exporta a CSV y verifica formato
```

### Test 6: Alert Notification Timing
```
✓ Carga nuevo archivo
✓ Observa si aparece alert/notificación
✓ Cronómetra con reloj/timer:
  - Aparece en < 1 segundo
  - Desaparece en ~5 segundos (4-6 es OK)
  - NO reaparece hasta nueva carga de datos
✓ Carga otro archivo
  - Alert debe volver a aparecer (fue reseteado)
```

### Test 7: KPI Color Reactivity
```
✓ Carga archivo y observa KPIs en CRUCE
✓ Verifica colores:
  - Disponibilidad HH ≥98% → VERDE
  - Disponibilidad HH 95-97% → AMARILLO
  - Disponibilidad HH <95% → ROJO
  - Lo mismo para TT
✓ Aplica filtros
  - Los porcentajes cambian
  - Los colores se actualizan automáticamente
✓ Recarga página
  - Los colores persisten correctamente
```

### Test 8: Dark Mode
```
✓ Abre CONFIGURACIÓN tab
✓ Activa "Modo Oscuro"
✓ Verifica:
  - Tema oscuro aplicado a toda la app
  - Texto es legible en fondo oscuro
  - Gráficos se ven bien
  - Colores OXXO siguen siendo visibles
✓ Recarga página
  - Dark mode persiste
✓ Desactiva dark mode
  - Vuelve a light mode
  - Todos los elementos correctos
```

### Test 9: Export Functionality
```
✓ EXPORT tab
✓ Prueba cada tipo de export:
  CSV:
    - Click en "Descargar CSV"
    - Verifica archivo descargado
    - Abre en Excel y verifica datos
  
  PDF:
    - Click en "Descargar PDF"
    - Verifica si se muestra diálogo
    - Espera a que se descargue
    - Abre PDF y verifica contenido
  
  Email:
    - Click en "Email"
    - Verifica contenido (gráficos, tabla, formato)
    - Copia HTML y prueba en cliente de email
```

### Test 10: Form Validation
```
✓ CONFIGURACIÓN > Agregar Modelo de Costo
✓ Deja el nombre vacío
  - Sistema debe mostrar error
  - No debe guardar
✓ Completa formulario correctamente
  - Nombre: "iPhone 14"
  - Costo: "999"
  - Click "Guardar"
  - Debe aparecer en tabla
✓ Intenta duplicado
  - Nombre duplicado debe reemplazar anterior
  - O mostrar advertencia
✓ Elimina modelo
  - Sistema pide confirmación
  - Al confirmar, se elimina
  - Tabla se actualiza
```

---

## 📊 Métricas a Capturar

Para cada test, captura:

```
Performance:
  - Time to Interactive (TTI): [____] ms (Target: < 3000ms)
  - First Contentful Paint (FCP): [____] ms (Target: < 1500ms)
  - Largest Contentful Paint (LCP): [____] ms (Target: < 2500ms)
  
Memory:
  - Initial Heap: [____] MB
  - Peak Heap: [____] MB
  - Final Heap: [____] MB
  - Memory Leak: YES / NO
  
UI Responsiveness:
  - Frames Per Second: [____] FPS (Target: ≥50)
  - Main Thread Blocking: [____] ms (Target: < 100ms)
  - Layout Shifts: YES / NO
  
Errors:
  - Console Errors: [____]
  - Console Warnings: [____]
  - Uncaught Exceptions: [____]
  
Functional:
  - Data Integrity: OK / FAIL
  - Export Quality: OK / FAIL
  - Formatting Correct: OK / FAIL
  - UI Stable: OK / FAIL
```

---

## 🎯 Criterios de Éxito

### ✅ PASS
- ✓ TTI < 3 segundos
- ✓ Memory leak < 10MB/min
- ✓ No freezing/lag
- ✓ Datos correctos
- ✓ Sin errores críticos

### ⚠️ WARNING
- ⚠ TTI 3-5 segundos
- ⚠ Memory leak 10-20MB/min
- ⚠ Lag ocasional < 200ms
- ⚠ Minor warnings

### ❌ FAIL
- ❌ TTI > 5 segundos
- ❌ Memory leak > 20MB/min
- ❌ Freezing frecuente
- ❌ Corrupción de datos
- ❌ Errores críticos

---

## 📝 Plantilla de Reporte

```markdown
# Testing Report - OXXO Movilidad
**Date**: 2026-06-03
**Tester**: [Your Name]
**Environment**: Chrome, Windows 10, 16GB RAM

## Summary
- Total Tests: [__]
- Passed: [__] ✅
- Failed: [__] ❌
- Warnings: [__] ⚠️

## Performance Metrics
- TTI: [__] ms [✅/⚠️/❌]
- FCP: [__] ms [✅/⚠️/❌]
- Memory: [__] MB [✅/⚠️/❌]

## Issues Found
1. [Issue description]
   - Severity: [HIGH/MEDIUM/LOW]
   - Steps to reproduce: [...]
   - Expected: [...]
   - Actual: [...]

2. [Another issue...]

## Recommendations
- [...]
- [...]

## Sign-off
- Overall Status: [PASS/FAIL]
- Ready for Production: [YES/NO]
```

---

## 🔄 Recomendación de Frecuencia

```
Testing Schedule:
  - Después de cambios de código: ALWAYS
  - Antes de producción: REQUIRED
  - Cada semana: RECOMENDADO
  - Cada mes: FULL SUITE
```

---

## 💡 Tips Útiles

### Chrome DevTools Pro Tips
```
1. Performance Recording:
   - Cmd+Shift+P (Mac) o Ctrl+Shift+P (Windows)
   - Type "record" → Performance recording
   - Corre tu test
   - Stop recording
   - Analiza el timeline

2. Memory Profiling:
   - DevTools > Memory tab
   - Take Heap Snapshot
   - Perform actions
   - Take another Heap Snapshot
   - Compare modo: muestra objetos creados

3. Lighthouse Audit:
   - DevTools > Lighthouse tab
   - Select "Performance" + "Best Practices"
   - Generate report
   - Sigue las recomendaciones

4. Frame Rate Monitor:
   - Cmd+Shift+P > "Show frames per second meter"
   - Verde = 60 FPS (bueno)
   - Rojo = < 30 FPS (malo)
```

### Quick Check Shortcuts
```
Console (F12):
  - Paste STRESS_TEST.js script
  - All tests run in ~2 minutes
  - Scroll down para ver results

Network Throttling:
  - DevTools > Network tab
  - Throttle to "Slow 3G" para simular internet lento
  - Prueba si UI es usable
```

---

## ❓ Troubleshooting

### "Script stopped at line X"
```
Solution: Open DevTools > Console
Check for errors before that line
Fix the error and re-run
```

### "Memory keeps growing"
```
Possible Causes:
  - Event listeners not removed
  - Timers not cleared
  - Circular references
  - Large objects retained

Solution:
  - Check DevTools > Memory > Detached DOM nodes
  - Find the element that's being retained
  - Find where it's referenced
  - Clear the reference when done
```

### "Tab switching is laggy"
```
Possible Causes:
  - Too many DOM nodes
  - Expensive reflows/repaints
  - Heavy JavaScript execution

Solution:
  - DevTools > Performance > record while switching tabs
  - Look for long yellow/red bars (blocking work)
  - Optimize those functions
  - Use requestAnimationFrame for animations
```

### "Export not working"
```
Solution:
  - Check DevTools > Console for errors
  - Verify library is loaded (FileSaver, html2pdf)
  - Check browser permissions for downloads
  - Try private/incognito mode to rule out extensions
```

---

## ✅ Next Steps

After completing tests:

1. **Document Results**: Copia metrics en TESTING_REPORT.md
2. **Identify Issues**: Lista bugs encontrados con severidad
3. **Plan Fixes**: Prioriza qué arreglar primero
4. **Commit**: `git commit -m "Testing: [results summary]"`
5. **Push**: `git push origin main`

---

**Happy Testing!** 🎉
