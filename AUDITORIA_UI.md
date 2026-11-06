# Auditoría visual — OXXO Movilidad

Revisión de la interfaz con el dashboard corriendo en local y 190 equipos
cargados en las 4 plazas (Tijuana Este, Tijuana Centro, Ensenada, Playas).
Se recorrieron las 8 pestañas en claro y oscuro, a 1440×900 y a 375×812.

> **Estado:** las **cuatro fases están aplicadas** (ver sección 11). Las cifras de
> las secciones 1, 3 y 4 son las de **antes** de aplicarla; al final de la
> sección 11 están las de después.

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

### Resultado de la Fase 1 (aplicada)

Medido en la pestaña Resumen con los mismos 190 equipos:

| | Antes | Después |
|---|---|---|
| Tamaños de letra distintos | 18 | **8** |
| Textos por debajo de 11px | 7, 8, 9, 10 y 10.5px | **ninguno** |
| Radios de esquina distintos | 20 | **7** |
| Sombras distintas | 31 | **12** |
| Colores de texto distintos | 23 | **11** |
| Textos bajo el mínimo de contraste (claro) | 25 | **0** reales |
| Textos bajo el mínimo de contraste (oscuro) | 41 | 28 |
| Paneles claros sobre fondo oscuro | 6 | 2 |

En claro quedan 3 avisos y los tres son falsos positivos de la medición
(iniciales del avatar sobre un degradado y dos iconos). Sin desbordes de texto
ni scroll horizontal, en escritorio ni en móvil.

El modo oscuro mejora pero **sigue incompleto a propósito**: completarlo es la
Fase 3, porque depende de que los colores de las tarjetas salgan de variables.

Lo que la Fase 1 **no** tocó: las sombras escritas como propiedad de JavaScript
(`this.style.boxShadow = '...'` en los `onmouseover`), que siguen con valores
a pelo, y los 139 glows de color, que son intencionados.

### Resultado de la Fase 2 (aplicada)

- **MAYÚSCULAS:** de 40 elementos forzados a mayúsculas por CSS a **0** en la
  pantalla de Resumen. El texto ya estaba escrito en capitalización normal:
  eran las reglas las que gritaban. Se conservan a propósito en 9 sitios donde
  ayudan — cabeceras de tabla, badges diminutos y el splash de marca.
- **Cabecera:** las dos barras rojas son ahora una sola. Se van el borde
  divisorio y la franja oscura de la fila 2; la cabecera adelgaza unos 19px.
- **Hueco del logo:** deja de ser un recuadro blanco con "LOGO" punteado y pasa
  a un icono discreto sobre el rojo. **Sigue siendo pulsable** para cargar el
  logo: solo cambia su aspecto vacío.
- **Contadores de la cabecera:** resultó que `— equipos` y `— offline` nunca
  tuvieron datos. La función `updateHeaderStats()` lee `reportData`, una
  variable que **no existe en toda la aplicación** (el array real se llama `D`).
  Como el encargo era no tocar el funcionamiento, se ocultan mientras no haya
  cifra en lugar de enseñar rayitas. Apuntarlos a `D` es una línea, pero es una
  decisión de datos, no visual.
- **Indicador de tiempo duplicado:** al fundir las barras quedaron dos "hace N
  min" uno encima de otro (`#data-load-ago` y el chip de la fila de stats). Se
  oculta el duplicado.
- **Gráficas:** el rojo deja de usarse donde no significa nada. *Asesores con
  más llamadas* (un conteo de equipos por asesor) pasa a azul pizarra; las que
  cuentan equipos offline mantienen el rojo, que ahora es el rojo de error
  (`#B3261E`) y no el de marca (`#E2001A`), para que la identidad quede libre.

Sin desbordes de texto ni scroll horizontal en escritorio ni en móvil.

**Pendiente para la Fase 3:** el modo oscuro, los nombres cortados en los ejes
de las gráficas y las barras que salen todas al 100% del ancho.

### Resultado de la Fase 3 (aplicada)

**Modo oscuro.** La causa raíz no era que faltaran reglas, sino dos que nunca
se desactivaban:

```css
body:not([data-theme="dark"]) { background: #f8f9fe; }  /* el atributo va en <html> */
#results-screen { background: #f8f9fe; }                 /* sin acotar al tema */
```

El `:not()` se evaluaba sobre `<body>`, que nunca lleva el atributo, así que
**siempre** pintaba claro. De ahí venían los "paneles claros sobre fondo
negro". Además se enrutaron a variables los colores que estaban escritos
dentro del HTML generado (tipo de equipo, estados, superficies blancas) y se
oscurecieron las teselas del mapa.

| En oscuro | Antes | Después |
|---|---|---|
| Paneles claros sobre fondo oscuro | 6 | **1** |
| Textos bajo el mínimo de contraste | 41 | **25** |

Los 25 restantes son en su mayoría etiquetas sobre el mapa, iconos y las
iniciales del avatar sobre un degradado.

**Gráficas.**

- El eje de valores llegaba justo al máximo de la serie, así que con todos los
  valores iguales **todas las barras salían al 100%** y parecía que todo estaba
  al máximo. Ahora hay holgura: con valores de 1, el eje llega a 2.
- Los nombres se cortaban a mitad de palabra ("Alicia Jaqueline Pi…"). Ahora
  se cortan por palabra y el nombre completo sigue estando en el tooltip.
- Ejes y valores suben de 10px a 11px, el suelo de la escala.

**Fila de KPI.** Los cuatro conteos (Total BD, HH apagadas, TT apagadas,
Tiendas) pasan a tarjeta plana y el anillo se queda solo en los dos
porcentajes. (Este paso quedó a medias y se rehízo después: ver
"Corrección: la fila de KPI, rehecha" al final.)
El cambio se aplicó a las **dos** filas de KPI: la de Cruce y la de Resumen,
que son marcados distintos. "Disp. HH %" pasa a "Disponibilidad HH": el valor
ya lleva el signo.

**Pendiente.** Las sombras escritas como propiedad de JavaScript
(`this.style.boxShadow`) siguen con valores a pelo, y el ancho máximo común
de la sección 9 no se tocó.
### Resultado de la Fase 4 (aplicada)

Con esto se cierran los 13 puntos del plan y los pendientes que habían quedado
anotados al final de cada fase.

**Repaso de estructura.**

- **Pestañas** alineadas a la izquierda y a lo ancho del contenido, en vez de
  una píldora centrada flotando suelta. El **hover** pasa de rojo a gris: se
  pintaba igual que la pestaña seleccionada y a simple vista parecían dos
  activas.
- **Título duplicado** en Configuración resuelto: "Configuración del Sistema"
  salía dos veces seguidas. Se queda el encabezado de pantalla y el buscador
  conserva su sitio.
- **Botón flotante de sonido**: se acerca al borde y el contenido reserva su
  espacio en pantallas estrechas, donde antes lo tapaba.

**Las últimas sombras sueltas.** Quedaban 32 escritas como propiedad de
JavaScript (`this.style.boxShadow = '…'` en los `onmouseover`), fuera del
alcance de la Fase 1, que solo tocó las declaradas como CSS. Las 8 neutras
pasan a `var(--shadow-N)`; las 17 de color (rojo de marca, verde y azul de
estado) se quedan, porque son intencionadas, igual que los anillos de foco.

**Contraste.** Dos arreglos reales:

- La **barra de marca** usaba `--primary`, que en oscuro se aclara a `#FF3B5C`
  para leerse *sobre* superficies oscuras. Pero como **fondo**, el blanco
  encima caía a 3.48:1. Se separa en un token propio `--brand-bar`, fijo al
  rojo de marca en los dos temas: 4.94:1 y la identidad intacta.
- El **número del KPI** usaba `#00C853` y `#FF9100`, que sobre blanco dan
  2.2:1. Pasa a tokens por tema (`--kpi-ok`, `--kpi-aviso`). El aro sigue
  brillante a propósito: es un gráfico, y el glow es lo que lo hace resaltar.

**Las dos cosas que estaban a medias.**

- Los contadores `— equipos` y `— offline` de la cabecera ya muestran datos.
  `updateHeaderStats()` leía `reportData`, una variable que no existe en la
  aplicación; el array de equipos se llama `D`.
- La etiqueta `Total / en BD` de las tarjetas HH y TABLET pasa a
  `Tiendas con HH / deben tener uno`. El número no cambia: seguía siendo
  correcto, pero bajo un título "HH" se leía como "tenemos 174 handhelds".

**Medición final** (pestaña Cruce, 190 equipos, con la página ya estabilizada):

| | Claro | Oscuro |
|---|---|---|
| Paneles claros sobre fondo oscuro | — | **0** |
| Textos bajo el mínimo de contraste | **6** | **4** |
| Textos recortados por su caja | **0** | **0** |
| Tamaños de letra distintos | **7** | **7** |
| Radios de esquina distintos | **4** | **4** |
| Sombras distintas | **11** | **11** |

Los avisos que quedan son iconos (que como gráficos piden 3:1, no 4.5:1) y las
iniciales del avatar sobre un degradado, que el medidor no sabe resolver.
Comparado con el punto de partida: 18 tamaños de letra, 20 radios, 31 sombras
y 25 textos ilegibles en claro / 41 en oscuro.

**Una nota sobre cómo medir esto.** Varias lecturas intermedias dieron números
alarmantes (35 fallos, 14 "paneles claros") que al comprobarlos resultaron ser
estados transitorios: la aplicación anima la entrada de cada sección y
re-renderiza las tablas, así que medir antes de que todo se asiente devuelve
colores a medio camino. Lo mismo pasa con el menú lateral: está fuera de
pantalla y `getComputedStyle` devuelve valores congelados — abierto se lee
perfectamente. Conviene esperar a que la vista esté quieta antes de medir.

### Contrato único de tarjeta

Medido sobre la pestaña Resumen, convivían **15 combinaciones distintas** de
borde, radio, sombra y degradado: tarjetas de gráfica sin borde con radio 16,
KPI con borde y radio 12, secciones con radio 16 y borde, y las de tipo de
equipo con borde de 2px de color y fondo en degradado.

Ahora todas comparten la misma superficie: fondo `--card-bg`, borde de 1px
`--border`, radio `--radius-md` y sombra `--shadow-1`. Donde el color llevaba
significado —tipo de equipo, estado— pasa a una **franja lateral de 4px** en
lugar de teñir la tarjeta entera, así que el significado se conserva sin
inventar una segunda tarjeta.

| | Antes | Después |
|---|---|---|
| Combinaciones de superficie | 15 | **8** |
| Radios de tarjeta en pantalla | varios | **12px en 19 de 22** |

Las que quedan son la barra de marca (radio 0, correcto), dos envoltorios del
mapa y la leyenda flotante.
