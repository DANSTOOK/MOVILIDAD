# Changelog

## v1.6.4 — 2026-11-08

- feat: el logo va dentro del HTML, que vuelve a bastarse solo

## v1.6.3 — 2026-11-08

- ci: el release se publica con el tablero adjunto

## v1.6.2 — 2026-11-08

- test: el auditor abre tambien el menu lateral y el panel de avisos

## v1.6.1 — 2026-11-08

- fix: el arranque en claro, explicito, y sin herencia del sistema
- ci: un guardian para que no vuelvan los colores sueltos
- fix: el correo llegaba sin color y el PDF tenia un ambar ilegible

## v1.6.0 — 2026-11-08

- style: la colorimetria pasa a ser una escala medida en OKLCH
- style: el tema oscuro deja de ser cristal y pasa a ser panel
- style: la pantalla de arranque y la barra lateral, con la marca y el resplandor
- feat: el header, de dos bandas a una, con el logo oficial
- ci: la auditoría corre en cada push y en cada pull request

## v1.5.0 — 2026-11-07

- style: un nombre para el producto y un solo registro en los letreros
- fix: las tres navegaciones dicen por fin lo mismo
- fix: la geocodificacion de tiendas pasa por el backend, y deja de gritar

## v1.4.0 — 2026-11-07

- fix: el panel de notificaciones sale a la capa superior del navegador
- ci: axe-core en cada push, y los 202 fallos que encontro
- style: la escala tipografica deja de ser un comentario y se usa
- style: la barra de pestanas se encoge y el rojo pasa a ser una gota

## v1.3.2 — 2026-11-07

- style: el aura de Siri, visible por fin en las dos tarjetas

## v1.3.1 — 2026-11-07

- style: la fila de KPI toma el molde de las tarjetas de Stock

## v1.3.0 — 2026-11-07

- style: tintas semanticas, un color por tema en las ocho pestañas
- feat: piel de cristal (glassmorphism + aura) en toda la app

## v1.2.0 — 2026-11-06

- style: tabla de Detalle, ocho columnas por defecto
- style: coherencia de color y texto
- style: sistema de botón y escala de espaciado
- style: sistema de movimiento
- docs: auditoría de coherencia visual
- style: un contrato único de tarjeta
- feat: quitar el login
- style: Fase 4 y rehacer la fila de KPI
- fix(ci): el job de Docker comprueba el build en vez de publicar
- fix(ci): auditar solo producción y arreglar el CHANGELOG del release

## Sin publicar

- Piel de cristal (glassmorphism + aura) en toda la aplicación, con el tema
  oscuro como arranque. El aura solo al pasar por encima.

- Tabla de Detalle: ocho columnas por defecto y las otras cinco tras el botón
  "Ver todas las columnas". Las filas pasan de 104px a 62px.

- Coherencia de color y texto: un verde y un ámbar, los colores sueltos a
  tokens, tres pesos tipográficos y el cuerpo de texto legible.

- Sistema de botón y escala de espaciado: los de icono a un solo tamaño, los
  de texto y pestañas a otro, mínimo táctil de 44px, y 415 valores de
  espacio normalizados a la escala de 4.

- Sistema de movimiento: tres duraciones y dos curvas, fuera `transition: all`
  y las animaciones en bucle decorativas. La vista queda quieta en 200 ms.

- Se elimina el login: la aplicación abre directa al dashboard.
- Un contrato único de tarjeta: de 15 combinaciones distintas de borde,
  radio, sombra y degradado a 8, con la mayoría ya en la misma superficie.

- Fila de KPI rehecha como una sola familia de tarjetas: fuera los aros con
  halo, etiqueta arriba, y barra de proporción en los dos porcentajes.

- Fase 4 de la auditoría visual: pestañas a la izquierda con hover gris,
  título duplicado y botón flotante resueltos, las últimas sombras sueltas a
  tokens, la barra de marca con su propio color y los contadores de cabecera
  mostrando datos de verdad.

Las versiones se lanzan con `node scripts/release.js` y se pueden deshacer con
`node scripts/rollback.js`. Cada sección la escribe el script a partir de los
commits desde el release anterior.

## v1.1.0 — 2026-11-02

- Fase 3 de la auditoría visual: modo oscuro completo (la causa era un
  :not() evaluado sobre <body> cuando el atributo vive en <html>), barras de
  gráfica con holgura en el eje, nombres cortados por palabra y anillo de KPI
  solo en los porcentajes.

- Fase 2 de la auditoría visual: fuera las MAYÚSCULAS de títulos y etiquetas,
  las dos barras de cabecera pasan a ser una, el hueco del logo deja de
  parecer un placeholder y el rojo se reserva a marca y a crítico.

- Fase 1 de la auditoría visual: homologados tamaños de letra, radios y
  sombras a la escala que ya declaraba `:root`, y arreglado el gris secundario
  ilegible. 368 valores sueltos normalizados.

- Proyecto revivido: el backend arranca en local sin servidor de Postgres
  (PGlite embebido) y el frontend apunta al API local cuando se abre en
  localhost, en lugar del despliegue de Railway que ya no existe.
- Arregladas dos librerías del dashboard que no cargaban (`countUp` se servía
  como módulo ESM desde un `<script>` clásico; `geolib` se cargaba igual y
  además no se usaba en ninguna parte).
- Añadidos el lanzamiento de releases y el rollback (`scripts/`,
  `.github/workflows/release.yml`).
