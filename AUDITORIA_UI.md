# Auditoría visual — OXXO Movilidad

Revisión de la interfaz con el dashboard corriendo en local y 190 equipos
cargados en las 4 plazas (Tijuana Este, Tijuana Centro, Ensenada, Playas).
Se recorrieron las 8 pestañas en claro y oscuro, a 1440×900 y a 375×812.

**Alcance: solo lo visual.** Nada de lo que está aquí cambia cálculos, filtros,
exportaciones ni la lógica de la aplicación. Se trata de capas, estructura y
homologación.

---

## 1. El diagnóstico en una frase

La aplicación no se ve "verde" por falta de trabajo — hay muchísimo hecho —
sino porque **cada pantalla se diseñó por separado**. No existe una capa de
decisiones compartidas, así que cada tarjeta reinventa su sombra, su radio y su
tamaño de letra. Los números de una sola pestaña:

| En la pestaña Resumen | Cantidad | Lo sano |
|---|---|---|
| Tamaños de letra distintos | **18** (de 10px a 36px) | 6–7 |
| Radios de esquina distintos | **20** (2, 3, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 50%, 999px, 9999px…) | 3–4 |
| Sombras distintas | **31** | 3–4 |
| Colores de texto distintos | **23** | 4–5 |

Siete de esos tamaños de letra están por debajo de 14px (10, 10.5, 11, 11.5,
12, 12.5, 13). Dos radios distintos para el mismo concepto de "píldora"
(`999px` y `9999px`) son la huella de que se copió y pegó desde fuentes
distintas.

**Esto es lo que el ojo lee como "sin terminar".** Y es, con diferencia, lo más
barato de arreglar: no hay que rediseñar pantallas, hay que **unificar los
valores**.

---

## 2. La causa de raíz: los estilos están incrustados en el HTML

Buena parte de las tarjetas se generan como cadenas de HTML con el estilo
escrito dentro:

```js
html += '<div style="padding: 20px; background: linear-gradient(135deg, ' + r.colorLight + ' 0%, var(--surface) 100%);' +
        'border: 2px solid ' + r.color + '; border-radius: 14px;' +
        'box-shadow: 0 4px 12px rgba(0,0,0,0.08); ...">';
```

Mientras los valores vivan ahí dentro, **no hay forma de homologar nada desde
un sitio**: cambiar el radio de las tarjetas obliga a buscar y reemplazar en
decenas de plantillas, y siempre se escapa alguna. Es también la razón por la
que el modo oscuro está a medias (punto 6).

**Propuesta:** mover esos valores a clases con variables CSS. El marcado y el
comportamiento se quedan igual; solo cambia de dónde salen los números.

---

## 3. Color y contraste (lo más urgente)

### 3.1 El gris secundario no se lee

`#8898AA` es el color de casi todo el texto secundario de la aplicación
(etiquetas de KPI, descripciones, pestañas inactivas, pies de tarjeta). Sobre
fondo blanco da **2.81–2.95:1**, cuando el mínimo legible (WCAG AA) es 4.5:1.

Se detectaron **25 textos por debajo del mínimo en modo claro**. Los peores:

| Texto | Tamaño | Contraste |
|---|---|---|
| `⏱ hace 11 min` (barra superior) | 11px | **1.68:1** |
| Pestañas inactivas (Cruce, Resumen, Detalle…) | 12px | **2.95:1** |
| "No hay inconsistencias detectadas." | 14px | 2.81:1 |
| "Análisis de Datos", "Salud del Sistema" | 11px | 2.95:1 |
| "pendientes" | 9.5px | 2.95:1 |

**Arreglo:** un solo cambio de token. `#8898AA` → `#5A6B80` (4.6:1) deja de ser
ilegible sin dejar de verse gris y secundario. Esto corrige de golpe la mayoría
de los 25 fallos, porque todos usan el mismo color.

### 3.2 El rojo lo ocupa todo

El rojo de marca (`#E2001A`) está en: cabecera, segunda barra de cabecera,
pestaña activa, badges de días offline, píldoras de estado, títulos de gráficas,
iconos de sección, barras de gráficas y botones primarios. Cuando todo es rojo,
**el rojo deja de significar "urgente"** — que es justo lo que este dashboard
necesita que signifique.

**Propuesta (sin tocar la identidad):**

- Rojo de marca: cabecera y acciones primarias. Nada más.
- Rojo de alerta (un tono distinto, p. ej. `#B3261E`): exclusivamente estados
  críticos — offline, badges de días, filas en riesgo.
- Títulos de sección y de gráfica: **gris oscuro del texto normal**, no rojo.
  Un título no es una alerta.
- Iconos decorativos de sección: gris, o el color del dato que acompañan.

Solo con despintar los títulos la pantalla se calma muchísimo.

### 3.3 Colores sin significado

En *OS & Modelos*, la columna "Cantidad" pinta cada fila de un color distinto
(72 verde, 45 azul, 40 naranja, 33 morado) y las mini-barras repiten esos
colores. **El color no codifica nada** — son cuatro versiones de Android, no
cuatro estados. En *Top 5 tiendas* las barras son naranjas; en *Criticidad por
CR*, rojas; en *Asesores*, un degradado rojo. Tres gráficas, tres paletas.

**Propuesta:** una sola paleta categórica de 5–6 tonos, usada en el mismo orden
en todas las gráficas, y el rojo reservado para "crítico" también dentro de las
gráficas.

---

## 4. Tipografía

18 tamaños distintos y siete por debajo de 14px. En un panel que se lee de
lejos (y a veces en el móvil, en tienda), 10px y 10.5px no son una opción.

**Escala propuesta** — seis pasos, nada más:

| Uso | Tamaño | Peso |
|---|---|---|
| Número de KPI | 28px | 800 |
| Título de pantalla | 20px | 700 |
| Título de tarjeta / sección | 16px | 600 |
| Texto normal y tablas | 14px | 400 |
| Etiqueta secundaria | 13px | 500 |
| Micro (unidades, pies) | 12px | 500 |

Nada por debajo de 12px. Hoy hay etiquetas de KPI en 11px con `letter-spacing`
y mayúsculas, que es la combinación más difícil de leer que existe.

También conviene bajar el uso de MAYÚSCULAS: "ASESORES CON MÁS LLAMADAS",
"DASHBOARDS ANALÍTICOS", "CRUCE DE DATOS", "RESUMEN POR TIPO" — en mayúsculas
y en rojo, cada título pesa como un encabezado de primer nivel y compiten entre
sí. En capitalización normal y gris oscuro, la jerarquía aparece sola.

---

## 5. Forma y elevación

20 radios y 31 sombras distintas. **Propuesta: tres de cada una.**

| Nivel | Radio | Sombra | Para |
|---|---|---|---|
| Plano | 8px | ninguna | campos, celdas, chips |
| Tarjeta | 12px | `0 1px 3px rgba(16,24,40,.08)` | tarjetas, paneles |
| Flotante | 16px | `0 8px 24px rgba(16,24,40,.12)` | modales, menús, toasts |

Más la píldora (`border-radius: 999px`, un solo valor) para badges y botones
redondos.

Hoy conviven tarjetas con borde de 2px de color y tarjetas sin borde con
sombra; conviene elegir **una sola** forma de delimitar una tarjeta. Recomiendo
borde de 1px `#E6E9EF` + sombra de nivel "tarjeta", y reservar el borde de
color (2px) para cuando ese color signifique algo.

---

## 6. Modo oscuro: está a medias

Es el defecto visual más visible de la aplicación. Al activarlo, el fondo se
vuelve negro pero **las superficies interiores siguen siendo claras**: quedan
6 paneles blancos flotando sobre negro, y los textos que estaban pensados para
fondo claro se quedan en su color original.

Medición en oscuro: **41 textos por debajo del mínimo de contraste** (frente a
25 en claro). Los casos imposibles de leer:

| Texto | Color | Contraste |
|---|---|---|
| "TABLET" | `#003399` (azul oscuro) | **1.55:1** |
| "HH" | `#155724` (verde oscuro) | **1.94:1** |
| "Resumen Ejecutivo" | `#E8E4EA` sobre superficie clara | **1.19:1** |
| "Total", "en BD" | `#CCC4D6` | 1.69:1 |

La causa es la del punto 2: esos colores están escritos a mano dentro del HTML
generado (`colorDark: '#155724'`), así que la regla `[data-theme="dark"]` nunca
los alcanza.

**Propuesta:** que cada color de las tarjetas salga de una variable
(`--tipo-hh`, `--tipo-tablet`, `--superficie`, `--texto`), y que el bloque de
modo oscuro redefina esas variables. Es el mismo trabajo que el punto 2, hecho
una vez, y arregla claro y oscuro a la vez.

---

## 7. Los KPI: el anillo no dice lo que parece

La fila de seis indicadores usa **el mismo anillo circular para todo**:

| Indicador | Valor | ¿Tiene sentido el anillo? |
|---|---|---|
| TOTAL (BD) | 178 | **No** — un conteo no es una proporción |
| HH APAGADAS | 2 | **No** |
| TT APAGADAS | 1 | **No** |
| DISP. HH % | 98.85% | Sí |
| DISP. TT % | 99.43% | Sí |
| TIENDAS | 174 | **No** |

Un anillo promete "parte de un total". Cuatro de los seis no son proporciones,
así que el anillo es decoración que confunde. Además los seis tienen el mismo
tamaño, así que **nada indica qué hay que mirar primero**.

**Propuesta:**

- Los cuatro conteos: número grande sobre tarjeta plana, sin anillo.
- Los dos porcentajes: conservan el anillo (ahí sí informa).
- Jerarquía: los dos porcentajes de disponibilidad y los equipos caídos son lo
  que de verdad importa → tarjeta más ancha o primera posición. El total y las
  tiendas son contexto → más pequeños, a la derecha.

### 7.1 Un detalle de redacción que confunde

Las tarjetas **HH** y **TABLET** muestran las dos `TOTAL 174 · en BD`, cuando en
los datos hay 111 handhelds y 79 tablets. El 174 es correcto — es el universo
de tiendas que *deberían* tener un equipo de ese tipo, y es el denominador de
la disponibilidad — pero puesto bajo un título "HH" y con la etiqueta "Total",
cualquiera lo lee como "tenemos 174 handhelds".

No es un error de cálculo y no propongo tocar el cálculo. Propongo **cambiar la
etiqueta**: `Tiendas que deben tener HH` en lugar de `Total / en BD`. Es solo
texto y elimina la ambigüedad.

### 7.2 Cifras de disponibilidad que no concuerdan a la vista

En la misma pestaña conviven *Disponibilidad global 97.4%*, *Responsabilidad
global 98.85%*, *DISP. HH 98.85%* y *DISP. TT 99.43%*. Cada una mide algo
distinto, pero visualmente son cuatro números del mismo tamaño y color
compitiendo.

**Propuesta visual:** un solo dato de disponibilidad destacado, y los demás
como desglose debajo, más pequeños y con su alcance escrito al lado
("por tipo", "del parque completo"). Sin cambiar ningún cálculo.

---

## 8. Gráficas

1. **Nombres cortados.** En *Asesores con más llamadas* el eje muestra
   "Aldo Jaqueline Piña…", "Carlos Eduardo Ruiz Ber…". Si no se puede
   identificar a la persona, la gráfica no sirve. Arreglo: más ancho de eje, o
   `Nombre A.` (nombre + inicial), o barras horizontales con el nombre encima.

2. **Barras todas iguales.** En *Top 5 tiendas* y *Criticidad por CR* todos los
   valores son 1 y todas las barras salen al 100% del ancho. Parece que todo
   está al máximo. Arreglo: fijar el máximo del eje al total real, no al valor
   máximo de la serie, y mostrar el valor al final de la barra.

3. **Título dentro de la gráfica compitiendo con el de la tarjeta.** Cada
   tarjeta tiene título en mayúsculas y color + subtítulo gris. Con un título
   en capitalización normal y el subtítulo en 13px basta.

4. **Rejilla y ejes muy marcados.** Conviene bajar la rejilla a `#EEF1F5` y los
   ejes a gris medio, para que el dato sea lo que destaque.

---

## 9. Estructura de la pantalla

- **Cabecera doble.** Hay una barra roja grande y debajo otra barra roja más
  fina con las estadísticas. Dos barras rojas seguidas roban ~110px de alto
  antes de ver un dato. **Propuesta:** fundirlas en una sola barra.

- **La barra de estadísticas muestra guiones.** `— equipos` y `— offline`
  siguen en blanco con 190 equipos cargados (los nodos `hdr-stat-total-val` y
  `hdr-stat-offline-val` mantienen el `—`). O se llenan, o se quitan: una
  cabecera permanente con rayitas da sensación de roto.

- **Placeholder de logo.** La caja "LOGO" con borde punteado está en la
  cabecera de todas las pantallas. Mientras no haya logo, mejor el nombre de la
  aplicación solo.

- **Las pestañas van centradas y flotando.** Ocho pestañas centradas en una
  píldora blanca, despegadas del contenido. Alineadas a la izquierda y pegadas
  al contenedor se escanean mejor y dejan de parecer un elemento suelto.

- **Hover y seleccionado se parecen demasiado.** La pestaña con el ratón encima
  se pinta de rojo sobre fondo rojo claro; la seleccionada, de blanco sobre
  píldora roja. A simple vista parecen dos pestañas activas. Basta con que el
  hover sea gris.

- **Título repetido.** En *Configuración* se lee "Configuración del Sistema"
  dos veces seguidas: como encabezado de pantalla y como título de la primera
  tarjeta.

- **Ancho desaprovechado.** La pantalla de carga centra una tarjeta estrecha en
  1440px y deja el resto vacío, mientras las tablas van de borde a borde. Un
  ancho máximo común (~1280px) para todo el contenido homologa las dos cosas.

---

## 10. Móvil (375px)

Lo bueno: **no hay scroll horizontal** y las tarjetas se apilan bien. Lo que
falla:

- Los títulos de gráfica en mayúsculas parten en tres líneas ("ASESORES / CON
  MÁS / LLAMADAS") y el icono se queda alineado con la segunda línea. Se
  resuelve solo al pasar a capitalización normal (punto 4).
- El botón flotante de sonido se solapa con el contenido de la esquina inferior
  derecha y se recorta contra el borde.

---

## 11. Por dónde empezar

Ordenado por relación entre lo que se ve y lo que cuesta. Todo es visual.

**Fase 1 — La capa de tokens (es el 80% del resultado)**

1. Definir en `:root` las variables de color, tamaño, radio y sombra de las
   secciones 3, 4 y 5.
2. Cambiar el gris secundario `#8898AA` → `#5A6B80`. Corrige la mayoría de los
   25 fallos de contraste de un plumazo.
3. Sustituir los valores sueltos de los `style="..."` generados en JS por esas
   variables. Mismo marcado, mismo comportamiento.

**Fase 2 — Calmar la pantalla**

4. Títulos de sección y de gráfica en gris oscuro y capitalización normal.
5. Rojo solo para marca y para crítico.
6. Una sola paleta categórica en todas las gráficas.
7. Fundir las dos barras de cabecera; quitar el placeholder del logo; llenar o
   retirar los contadores en `—`.

**Fase 3 — Los componentes que más se miran**

8. Rediseñar la fila de KPI: anillo solo en los porcentajes, jerarquía por
   tamaño, etiquetas sin jerga.
9. Arreglar ejes y etiquetas de las gráficas (nombres completos, máximo real).
10. Completar el modo oscuro, que para entonces ya será casi gratis porque todo
    sale de variables.

**Fase 4 — Repaso**

11. Pestañas alineadas a la izquierda, hover gris.
12. Ancho máximo común.
13. Título duplicado en Configuración y solape del botón flotante en móvil.

Cada fase puede ir en su propio release con `node scripts/release.js minor`, y
si algo se ve peor de lo que estaba, `node scripts/rollback.js` lo devuelve.
