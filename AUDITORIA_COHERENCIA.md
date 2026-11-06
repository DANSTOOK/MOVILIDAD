# Auditoría de coherencia visual

Segunda pasada, más fina que [AUDITORIA_UI.md](AUDITORIA_UI.md). Aquella arregló
lo que estaba roto; ésta mira si lo que queda **habla un mismo idioma**: color,
texto y su colocación, componentes, espacio y movimiento.

Medido en la aplicación corriendo, con 190 equipos cargados, en la pestaña
Resumen (la más densa) y contrastado en Detalle, en claro y en oscuro.

Cada hallazgo lleva su veredicto: **MEJORAR** (vale, pero hay que afinarlo),
**ELIMINAR** (sobra) o **REHACER** (el planteamiento está mal).

---

## Resumen ejecutivo

Lo que está bien: el contraste ya cumple, el modo oscuro funciona, no hay
MAYÚSCULAS gritando, las tarjetas comparten superficie y los radios están
casi homologados. Eso es trabajo hecho y no hay que tocarlo.

Lo que todavía no habla un mismo idioma, por orden de impacto:

| Capítulo | Medida | Veredicto |
|---|---|---|
| **Movimiento** | 8 duraciones, 9 curvas, 29 `transition: all`, 4 animaciones infinitas | ~~REHACER~~ **hecho** |
| **Botones** | 12 variantes y **8 alturas distintas** para 39 botones | ~~REHACER~~ **hecho** |
| **Espacio** | 11 valores de padding, 10 de gap, sin escala | ~~REHACER~~ **hecho** |
| **Color** | 16 colores de texto, 2 verdes y 3 ámbares para lo mismo | ~~MEJORAR~~ **hecho** |
| **Colocación del texto** | 3 formas de alinear, 7 interlineados, tabla que parte todo | ~~MEJORAR~~ **hecho** |
| **Adornos** | aurora de fondo, pulsos infinitos, robot animado | **ELIMINAR** |

---

## 1. Movimiento — REHACER

Es el capítulo más desordenado y el que más barato sale de arreglar, porque casi
todo se resuelve con tres tokens.

**Lo medido en el código:** 178 bloques `@keyframes`, 214 declaraciones
`animation:` y 221 `transition:`.

**Lo medido en pantalla**, en una sola vista:

| | Cuántos | Lo sano |
|---|---|---|
| Elementos animados | 34 | — |
| Animaciones distintas | 13 | 3–4 |
| Duraciones de animación | **8** (0.15s, 0.3s, 0.35s, 0.7s, 1s, 2s, 2.4s, **30s**) | 3 |
| Curvas de animación | **7** | 2 |
| Elementos con transición | 136 | — |
| Duraciones de transición | **8** (0.12 / 0.15 / 0.18 / 0.2 / 0.25 / 0.3 / 0.4 / 1.4s) | 3 |
| Curvas de transición | **9** | 2 |
| `transition: all` | **29 elementos** | 0 |
| Animaciones **infinitas** | **4** | 0 |

### 1.1 Tres duraciones y dos curvas, no dieciséis

Hoy conviven 0.12s, 0.15s, 0.18s, 0.2s, 0.25s, 0.3s y 0.4s para transiciones.
Nadie percibe la diferencia entre 0.15 y 0.18; lo que sí se percibe es que la
interfaz no tiene un ritmo propio.

```css
--mov-rapido: 120ms;   /* hover, foco, cambios de color */
--mov-base:   200ms;   /* abrir/cerrar, aparecer */
--mov-lento:  320ms;   /* paneles y modales */
--mov-curva:        cubic-bezier(0.2, 0, 0, 1);    /* entrada y salida */
--mov-curva-salida: cubic-bezier(0.4, 0, 1, 1);    /* solo salida */
```

### 1.2 `transition: all` — ELIMINAR

29 elementos lo usan. `all` anima **cualquier** propiedad que cambie, incluidas
las que provocan reflow (`width`, `height`, `top`). Es la causa típica de que
una tabla "tiemble" al filtrar. Hay que nombrar las propiedades:
`transition: background-color var(--mov-rapido), color var(--mov-rapido), border-color var(--mov-rapido);`

### 1.3 La curva con rebote — MEJORAR

`cubic-bezier(0.34, 1.56, 0.64, 1)` aparece **42 veces**. Es una curva con
sobreimpulso: el elemento se pasa de largo y vuelve. En una app de consumo da
simpatía; en un panel donde alguien revisa 190 equipos a diario, cansa y hace
que todo parezca de juguete. Dejarla, como mucho, en una o dos
confirmaciones puntuales.

### 1.4 Cuatro animaciones infinitas — ELIMINAR

```
auroraDrift      30s   fondo decorativo
iconPulseGlow          iconos del menú lateral
offlinePulse           contador de offline en la cabecera
plazaPulseCSS          puntos de plaza en el mapa
```

Una animación infinita **nunca deja de repintar**: consume batería en un portátil
y CPU en un equipo de tienda, y en una pantalla que ya está llena compite por
la atención permanentemente. `offlinePulse` tiene una intención legítima
(avisar de equipos caídos), pero un pulso eterno deja de leerse como alarma a
los dos minutos: mejor un punto de color fijo.

### 1.5 La entrada de cada sección — REHACER

Cada cambio de pestaña dispara `cardStagger` (10 elementos) y `chartFade` (9).
El efecto práctico, que sufrí midiendo: **la pantalla tarda segundos en quedar
quieta** y durante ese rato los colores están a medio camino. Si yo no podía
medirla, el usuario tampoco puede leerla.

Propuesta: una sola transición de opacidad de 200ms para el contenedor de la
sección, y nada de escalonado por tarjeta. El escalonado tiene sentido cuando
hay 3 elementos; con 19 es una espera.

### 1.6 `prefers-reduced-motion`

Hay 18 referencias en el código, lo cual está muy bien y conviene mantener.
Al rehacer el sistema hay que asegurarse de que el bloque siga cubriendo las
animaciones nuevas, y que incluya también las infinitas (hoy algunas se
desactivan solo en móvil, no por preferencia del usuario).

---

## 2. Botones — REHACER

**12 variantes distintas para 39 botones**, con **8 alturas**:

```
19.19px · 30px · 34px · 36px · 38px · 40px · 44px · 58.5px
```

Ocho alturas no es una decisión de diseño, es acumulación. Y dos de ellas
(19px y 30px) están por debajo del objetivo táctil recomendado de 44px, en una
app que se usa en tienda.

**Propuesta: tres tamaños y tres jerarquías.**

| Tamaño | Alto | Para |
|---|---|---|
| `sm` | 32px | acciones dentro de una celda o chip |
| `md` | 40px | el botón normal |
| `lg` | 48px | la acción principal de una pantalla |

| Jerarquía | Aspecto |
|---|---|
| Primario | relleno rojo de marca, texto blanco |
| Secundario | fondo transparente, borde 1px `--border`, texto `--text` |
| Terciario | solo texto, sin borde |

En táctil, cualquier botón sube a 44px de alto mínimo, aunque visualmente
parezca menor (con padding invisible).

---

## 3. Espacio — REHACER

**11 valores de padding** (4, 8, 10, 12, 14, 16, 18, 20, 22, 24…) y **10 de gap**
(2, 4, 5, 6, 8, 10, 12, 16…) conviviendo en una pantalla.

Lo irónico: `:root` **ya declara** una escala (`--space-xs` a `--space-3xl`) y
casi nadie la usa. Valores como 5, 14, 18 o 22 son el síntoma de ajustar a ojo
hasta que "cuadre".

**Propuesta:** escala de 4 (4, 8, 12, 16, 24, 32) y prohibido el valor suelto.
Seis pasos cubren todo; 22px no existe.

---

## 4. Color — MEJORAR

El contraste ya está resuelto. Lo que queda es **vocabulario**: 16 colores de
texto, 17 de fondo y 6 de borde en una vista.

### 4.1 Dos verdes y tres ámbares para lo mismo

```
verdes:   #1F7A4E (5 usos)   #2A6E40 (3 usos)
ámbares:  #F5A623            #E8B400            #B26A00
```

Son el mismo significado — "correcto" y "atención" — pintados con tonos
distintos según quién escribió cada trozo. Hay que dejar **uno de cada**, ya
tokenizados (`--success`, `--warning`), y que el mapa use los mismos.

### 4.2 Colores que se escaparon del sistema

| Dónde | Color | Debería ser |
|---|---|---|
| `.kpi-number` de los 4 conteos | `#333333` | `var(--text)` |
| 10 iconos Material sin color | negro heredado | `var(--text-light)` |
| `.map-plaza-chip` | texto negro | `var(--text)` |

El de `.kpi-number` es el más visible: los cuatro números grandes de la fila de
KPI son `#333` mientras todo el resto del texto principal es `#32325D`. Se ven
"sucios" al lado del resto y nadie sabría decir por qué.

### 4.3 El rojo, otra vez

Ya se reservó para marca y crítico, y se nota. Queda un detalle: en el mapa
el rojo de marca `#E2001A` se usa para "plaza crítica", mientras en las tablas
lo crítico es `#B3261E`. Unificar en `--error`.

---

## 5. Colocación del texto — MEJORAR

### 5.1 Cuatro formas de alinear

```
start: 74    center: 68    left: 24    right: 2
```

`start` y `left` son lo mismo escrito de dos maneras: eso solo revela que el
código lo escribieron manos distintas. Y 68 elementos centrados conviviendo con
98 alineados a la izquierda es lo que hace que el texto parezca "mal colocado"
aunque cada tarjeta por separado esté bien.

**Regla propuesta:** todo a la izquierda, salvo números en columnas de tabla
(a la derecha, para comparar magnitudes de un vistazo) y el contenido de
estados vacíos (centrado). Nada más.

### 5.2 Siete interlineados, y uno peligroso

```
1.6 (75)   1 (61)   normal (20)   1.3 (6)   1.1 (4)   1.2 (1)   1.5 (1)
```

`line-height: 1` en **61 elementos** es la causa de que los glifos se salgan de
su caja — lo vi midiendo: números de 28px en cajas de 28px, con el trazo
desbordando 3px. No se recorta porque el overflow es visible, pero el texto
queda pegado a lo de arriba y a lo de abajo.

**Propuesta:** 1.2 para títulos y números grandes, 1.5 para texto corrido.
Dos valores.

### 5.3 Cinco pesos

400, 500, 600, 700 y 800. Con 400 (normal), 600 (semibold) y 800 (los números
de KPI) sobra. El 500 y el 700 son indistinguibles de sus vecinos a estos
tamaños.

### 5.4 La tabla de Detalle — REHACER

Es el peor sitio de colocación de texto de la aplicación. Con 11 columnas en
1024px:

- Las cabeceras parten en dos líneas ("ÚLTIMA / CONEXIÓN").
- Los nombres de asesor parten en **cuatro** ("Alicia / Jaqueline / Piña /
  Bretado"), lo que hace filas de 80px de alto y obliga a barrer la vista
  arriba y abajo para leer un registro.
- Debajo hay una segunda fila de filtros que repite el ancho y añade más ruido.

No se arregla con tipografía: **sobran columnas para el ancho disponible**.
Propuesta: columnas esenciales por defecto (Última conexión · Días · CR ·
Tienda · Estado) y el resto tras un control de "columnas", o una fila que se
despliega con el detalle completo del equipo.

### 5.5 Nueve tamaños, pero mal repartidos

11px (46 usos) · 12px (29) · **14px (6)** · 16px (47) · 18px (9) · 20px (15) ·
24px (6) · 28px (8) · 36px (2).

Lo llamativo: **14px, que debería ser el tamaño del texto normal, se usa 6
veces**, mientras 11px se usa 46. La interfaz está escrita casi entera en
"micro" y en "título", sin cuerpo intermedio. Por eso cansa leerla: casi todo
es o muy pequeño o muy grande.

Los tokens `--fs-*` ya existen desde la Fase 1; el trabajo es **usarlos**, y
subir a 13–14px mucho de lo que hoy es 11px.

---

## 6. Adornos — ELIMINAR

Cosas que no aportan información y sí coste:

- **Aurora de fondo** (`auroraDrift`, 30s en bucle): degradado animado detrás
  del contenido. Invisible cuando funciona, y repintando siempre.
- **Pulsos infinitos** en iconos del menú y puntos del mapa (§1.4).
- **Robot animado** de la pantalla de carga: simpático la primera vez, y esa
  pantalla se ve en cada sesión.
- **Decoración radial** en la esquina de las tarjetas de tipo de equipo: ya la
  bajé a opacidad 0.05 al homologar las tarjetas; a ese nivel no se ve, así que
  mejor quitarla del todo que mantener un elemento que no hace nada.
- **`text-shadow` con glow** en los números de KPI: con el aro fuera, el halo
  de color sobre texto solo emborrona.

---

## 7. Por dónde empezar

Ordenado por lo que se nota dividido por lo que cuesta.

**Primero — el sistema de movimiento (un día de trabajo, se nota en todas las pantallas)**

1. Tres duraciones y dos curvas como tokens; sustituir las 16 variantes.
2. Quitar `transition: all` de los 29 elementos y nombrar propiedades.
3. Eliminar las 4 animaciones infinitas y la aurora.
4. Cambiar el escalonado de entrada por una opacidad única de 200ms.

**Segundo — botones y espacio**

5. Tres tamaños y tres jerarquías de botón; mínimo táctil de 44px.
6. Escala de espaciado de 4; eliminar los valores sueltos.

**Tercero — afinar color y texto**

7. Un verde y un ámbar; `.kpi-number` e iconos sueltos a tokens.
8. Alinear a la izquierda por defecto; dos interlineados; tres pesos.
9. Subir el cuerpo de texto de 11px a 13–14px donde se lee, no solo se ojea.

**Cuarto — la tabla de Detalle**

10. Reducir columnas por defecto y mover el resto a un control de columnas.

Cada bloque cabe en su propio release, y `node scripts/rollback.js` sigue
estando ahí si algo se ve peor de lo que estaba.

---

## Nota de método

Las cifras salen de medir el DOM con la aplicación corriendo y los datos
cargados, no de leer el CSS. Dos avisos para quien repita la medición:

- **Hay que esperar a que la vista esté quieta.** Con la entrada escalonada en
  marcha, los colores están a medio camino y salen falsos positivos de
  contraste. Es, en sí mismo, parte del hallazgo §1.5.
- **El menú lateral fuera de pantalla devuelve valores congelados** en
  `getComputedStyle`. Hay que abrirlo para medirlo, o excluirlo.
---

## Resultado: capítulo 1 aplicado

Medido en la aplicación corriendo, con 190 equipos:

| | Antes | Después |
|---|---|---|
| Duraciones de transición | 8 | **4** (0.12 / 0.2 / 0.32 + 0.15 de terceros) |
| Curvas de transición | 9 | **4**, dominadas por `--mov-curva` |
| Elementos con `transition: all` | 29 | **0** |
| Animaciones infinitas en pantalla | 4 | **0** |
| Declaraciones `animation … infinite` | 82 | **0** propias |
| Elementos animados a la vez | 34 | **11** |
| Tiempo hasta que la vista queda quieta | segundos | **~200 ms** |

**Lo que se hizo.**

- Tres duraciones y dos curvas como tokens en `:root`. Se normalizaron **255
  duraciones** y **229 curvas** (43 `cubic-bezier` sueltos y 186 palabras clave
  `ease`/`ease-out`/`ease-in`) dentro de las declaraciones `transition:`.
- **69 `transition: all` reescritos** nombrando propiedades: fondo, color,
  borde, sombra, transform y opacidad. Ninguna que provoque reflow, que era la
  causa de que las tablas temblaran al filtrar.
- **Fuera las animaciones en bucle decorativas**: la aurora de fondo de 30s, el
  pulso de los iconos del menú, el del contador de offline, el de los puntos
  del mapa, el robot de la pantalla de carga con sus veinte piezas, el splash y
  los pulsos de estado. Se conservan las que dicen "estoy trabajando":
  spinner, barra de progreso, esqueletos de carga y el robot *mientras* procesa
  un archivo.
- **La entrada de sección deja de ser escalonada**: `cardStagger` (10
  elementos) y `chartFade` (9, con 0.7s cada uno) se retiran y queda una sola
  opacidad de 200 ms. Con 19 tarjetas, el escalonado había dejado de ser
  elegante para ser una espera.
- `prefers-reduced-motion` ahora cubre también lo añadido aquí, no solo lo que
  había antes.

**Lo que queda fuera a propósito.** Las 20 transiciones de 0.15s y las 13
curvas `ease` que siguen apareciendo vienen del CSS de Leaflet, que es de
terceros. Y las partículas de confeti mantienen su transición aleatoria: son
un efecto puntual que se destruye solo, no parte del sistema.
---

## Resultado: capítulos 2 y 3 aplicados

### Botones

Al medirlos de cerca, las 8 alturas no eran ocho tipos de botón: eran
**botones de icono con cinco tamaños por accidente** (30, 36, 38, 40 y 44px),
más los de texto en dos (34 y 48) y las pestañas en un tercero (34).

| | Antes | Después |
|---|---|---|
| Alturas distintas | 8 | **5** |
| Botones de icono | 30 / 36 / 38 / 40 / 44 | **36px, los 23** |
| Botones de texto y pestañas | 34 / 48 | **40px, los 8** |

Las tres alturas que quedan no son botones por naturaleza: el chip de
estadística de la cabecera (19px), el hueco del logo (38px) y la tarjeta de
plaza del mapa (63px). Forzarlas al sistema sería peor que dejarlas.

En pantalla táctil todo sube a 44px de área activa mediante un `::after`
invisible, así que el aspecto no cambia y el dedo sí acierta.

**Una regresión que hubo que corregir:** al subir las pestañas a 40px, la barra
se iba a dos líneas. Ahora no se parte: si no cabe, se desplaza, igual que ya
hacía en móvil.

### Espacio

| | Antes | Después |
|---|---|---|
| Valores de padding | 11 | **7** (4, 6, 8, 12, 16, 20, 24) |
| Valores de gap | 10 | **8** (2, 4, 6, 8, 12, 16, 20, 24) |

Se normalizaron **415 valores sueltos** a la escala de 4. Los 5, 10, 14, 18 y
22px eran el rastro de ajustar a ojo hasta que cuadrara.

**Una decisión que se aparta de la propuesta original.** La auditoría pedía una
escala estricta de 4, pero el 6px aparece en **112 sitios** y casi siempre es el
hueco entre un icono y su texto. Ahí no es un descuido: es un paso real, y
forzarlo a 8 habría cambiado la densidad de media interfaz para ganar pureza en
un documento. Se queda, declarado como `--space-icono`.

Sin desbordes de texto ni scroll horizontal en claro, oscuro y móvil.
---

## Resultado: capítulos 4 y 5 aplicados

### Color

| | Antes | Después |
|---|---|---|
| Colores de texto en pantalla | 16 | **13** |
| Verdes para "correcto" | 2 | **1** |
| Ámbares para "atención" | 3 | **1** |

- `#2A6E40` se unifica en `#1F7A4E`, y `#E8B400` en `#F5A623`: eran el mismo
  significado pintado por manos distintas.
- Los cuatro números grandes de KPI dejan `#333333` y pasan al token de texto.
  Eran lo más visible de todo: se veían sucios al lado del resto y nadie sabría
  decir por qué.
- 17 grises `#999` sueltos pasan a `--text-light`, y los chips de plaza del
  mapa dejan de heredar negro.
- El mapa pintaba "plaza crítica" con el rojo **de marca**; ahora usa el de
  error, como el resto de la aplicación.

### Texto

| | Antes | Después |
|---|---|---|
| Pesos tipográficos | 5 | **3** (400 · 600 · 800) |
| Interlineados | 7 | **6**, dominados por 1.2 y 1.6 |
| `line-height: 1` | 61 elementos | **3** |
| Textos recortados por su caja | — | **0** |

- `line-height: 1` dejaba el glifo sin aire: números de 28px en cajas de 28px,
  con el trazo desbordando 3px. Pasa a 1.2 en 24 declaraciones.
- 500 y 700 se colapsan en 600: a estos tamaños eran indistinguibles de sus
  vecinos. Son 221 declaraciones, y el resultado es una interfaz menos
  "gritada" sin perder jerarquía.
- Lo que se lee —pies de tarjeta, etiquetas de estado, celdas de tabla— sube
  de 11px a 13px. Lo que solo se ojea se queda en 12.
- Las tarjetas alinean a la izquierda; los estados vacíos siguen centrados,
  que es su sitio.

### Una corrección a esta misma auditoría

El capítulo 5 decía que convivían **cuatro formas de alinear** (`start`, `left`,
`center`, `right`). Al ir a arreglarlo resultó que **`text-align: start` no se
declara ni una sola vez**: es el valor por defecto del navegador para los
elementos que no fijan alineación. No eran cuatro formas, eran tres.

El hallazgo de fondo sí se sostiene, y es más simple de enunciar: hay **144
reglas que centran frente a 44 que alinean a la izquierda**. La aplicación
centra por defecto, y eso en una interfaz de datos es justo lo que hace que el
texto parezca mal colocado.
---

## Resultado: la tabla de Detalle

Resultó peor de lo que decía el capítulo 5: no eran 11 columnas sino **13**, y
la tabla medía **1226px dentro de un contenedor de 983**.

| | Antes | Después |
|---|---|---|
| Columnas visibles | 13 | **8** |
| Ancho de la tabla | 1226px (no cabía) | **981px en 983** |
| Alto de la cabecera | 91px | **52px** |
| Alto de fila | 85–104px | **62px** |
| Registros por pantalla | ~5 | **~8** |

**Las ocho de por defecto:** selección, Última conexión, Días offline, CR,
Tienda, Asesor, Equipo y Comentario. Son las que se usan para decidir a quién
llamar.

**Las cinco que se esconden:** Plaza (ya hay un filtro de plaza justo encima),
Serie, Modelo, Nota e Historial. No se borran: el botón **"Ver todas las
columnas"** las devuelve, y vuelve a lo esencial con otro clic.

Además, cada celda ocupa **una sola línea**: antes "Alicia Jaqueline Piña
Bretado" se partía en cuatro y dejaba filas de 104px. Ahora se recorta con
puntos suspensivos y el valor completo queda en el `title`, al pasar por
encima.

### Un fallo que apareció al mirarlo en oscuro

La cabecera de esta tabla salía **verde** en modo oscuro. La causa era una
regla propia de `#detalle` con un degradado verde (`#2E7D32 → #1B5E20`) que en
modo claro quedaba **tapada** por el fondo opaco de los `th`, así que nunca se
había visto. En oscuro, donde el `th` es translúcido, asomaba y dejaba una
cabecera verde en una aplicación roja.

Era estilo muerto desde hacía tiempo: solo se manifestaba como fallo. Retirado;
la cabecera usa el token como el resto de tablas.
