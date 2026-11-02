# Changelog

Las versiones se lanzan con `node scripts/release.js` y se pueden deshacer con
`node scripts/rollback.js`. Cada sección la escribe el script a partir de los
commits desde el release anterior.

## Sin publicar

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
