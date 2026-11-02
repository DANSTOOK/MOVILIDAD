# Qué open-source usar para el salto visual

Complemento de [AUDITORIA_UI.md](AUDITORIA_UI.md). La auditoría dice **qué**
está mal; esto dice **con qué** arreglarlo.

## La restricción que manda

`index.html` es **un solo archivo de 1.1 MB**, en JavaScript plano, sin paso de
compilación, que carga todo desde CDN (ECharts, Leaflet, SweetAlert2, Tippy,
Papa Parse…). Cualquier cosa que entre tiene que:

- cargarse con una etiqueta `<script>` o `<link>`, sin build,
- **no pelearse** con las miles de reglas CSS que ya existen,
- y no cambiar comportamiento.

Eso descarta de entrada lo más recomendado en los listados de "mejores
dashboards": **Tremor** es React, y la app es vanilla. **Tailwind por CDN**
obligaría a reescribir el marcado de todas las pantallas.

---

## Lo que sí recomiendo (3 piezas, todas MIT, todas por CDN)

### 1. Radix Colors — la base de color y el modo oscuro

`https://cdn.jsdelivr.net/npm/@radix-ui/colors@3.0.0/gray.css` · **~1 KB por escala** · comprobado: responde 200

Escalas de 12 pasos donde **cada paso tiene un trabajo asignado** (1–2 fondos,
3–5 superficies, 6–8 bordes, 9–10 sólidos, 11–12 texto), y donde las
combinaciones de texto están garantizadas para pasar WCAG. Cada escala trae su
gemela oscura que **redefine las mismas variables**:

```css
/* claro */            /* oscuro: mismos nombres, otros valores */
--gray-11: #60646c;    --gray-11: #b0b4ba;
```

Por qué resuelve nuestros dos peores problemas de un golpe:

- **El gris ilegible (§3.1).** En vez de inventar `#5A6B80` a mano, el texto
  secundario pasa a ser `var(--gray-11)`, que ya está calculado para cumplir
  contraste sobre `--gray-1`.
- **El modo oscuro a medias (§6).** Hoy hay que perseguir cada color escrito a
  mano. Con Radix, el modo oscuro es **cargar el archivo `-dark`**: las
  variables cambian de valor y toda la interfaz se adapta sola. Los 41 fallos
  de contraste en oscuro desaparecen en su mayoría sin tocar cada tarjeta.

Escalas a cargar: `gray`, `red`, `green`, `amber`, `blue` y sus `-dark`.

> **Ojo con la marca.** El rojo OXXO es `#E2001A` y el rojo 9 de Radix es
> `#E5484D`. **El rojo de marca no se toca**: se queda como `--marca-rojo:
> #E2001A` para cabecera y acciones primarias. Las escalas de Radix se usan
> para los *estados* (crítico, aviso, ok) y para los fondos y bordes suaves
> alrededor — que es justo donde hoy hay veinte tintes inventados.

### 2. Open Props — el resto de los tokens

`https://cdn.jsdelivr.net/npm/open-props@1.7.16/open-props.min.css` · **27 KB** · comprobado: responde 200

300+ variables CSS de tamaño, espaciado, radio, sombra, tipografía y easings,
sin build y sin clases: **solo añade variables**, así que no puede romper nada
de lo que ya está escrito. Es la pieza que mata los 18 tamaños de letra, los 20
radios y las 31 sombras de la auditoría.

No se usa en crudo, se le ponen alias con el vocabulario del proyecto:

```css
:root {
  --radio-plano:    var(--radius-2);   /* 5px  → campos, chips, celdas */
  --radio-tarjeta:  var(--radius-3);   /* 1rem → tarjetas y paneles */
  --radio-pildora:  var(--radius-round);
  --sombra-tarjeta: var(--shadow-2);
  --sombra-flotante:var(--shadow-4);
  --texto-2:        var(--gray-11);    /* de Radix */
}
```

A partir de ahí, "cambiar el radio de todas las tarjetas" es editar **una
línea**, que es exactamente lo que hoy no se puede hacer.

### 3. Un tema de ECharts — el mayor cambio visible por línea escrita

La app ya carga **ECharts 5.5.1** y dibuja con él una docena de gráficas, cada
una con su paleta propia (§3.3, §8). ECharts permite registrar un tema y
pasarlo al inicializar:

```js
echarts.registerTheme('movilidad', { /* paleta, ejes, rejilla, tooltip, fuentes */ });
echarts.init(dom, 'movilidad');          // y 'movilidad-dark' en modo oscuro
```

Un solo objeto de tema **unifica las doce gráficas a la vez**: misma paleta
categórica en el mismo orden, misma rejilla tenue, mismos ejes, misma
tipografía, mismo tooltip. Es el cambio con más impacto visual por esfuerzo de
todo el plan, y no toca ni un cálculo: solo el nombre del tema en `init`.

Se puede partir del [constructor de temas oficial](https://echarts.apache.org/theme-builder),
con una advertencia: hay reportes de que **el JSON que exporta esa herramienta
no siempre se puede pasar directo a ECharts**. Si da problemas, se usa la
exportación en formato JS (se auto-registra al cargar) o se escribe el objeto
a mano — que para nuestro caso es mejor, porque así los colores salen de los
mismos tokens que el resto de la interfaz.

---

## Lo que NO recomiendo meter (y por qué)

| Proyecto | Por qué no |
|---|---|
| **Tabler** (Bootstrap) | 554 KB de CSS comprobados. Al ser un framework con clases propias (`.card`, `.btn`, `.table`), **chocaría de frente** con las clases del mismo nombre que ya existen aquí. Como dependencia es un riesgo alto; **como referencia visual es excelente** (ver abajo). |
| **Tremor** | Es React. La app es JavaScript plano. |
| **Tailwind por CDN** | Obliga a reescribir el marcado de todas las pantallas con clases utilitarias. Mucho riesgo para un cambio que es de estilo. |
| **Shoelace / Web Awesome** | Web components por CDN, sí, pero sustituir los controles actuales por `<wa-button>` y compañía **sí cambia comportamiento**, que es justo lo que no queremos. Además Shoelace 2.x ya no se desarrolla: el sucesor es Web Awesome. |
| **Cambiar de librería de iconos** | La app usa Material Symbols de forma consistente. Cambiarlos sería churn sin beneficio. |

### Tabler como referencia, no como dependencia

Donde la auditoría pide rediseñar la fila de KPI (§7) y la estructura de página
(§9), Tabler es la mejor fuente de patrones ya resueltos: tarjetas de KPI con
jerarquía, cabeceras de página, tablas densas legibles. Se copia **el criterio
de diseño**, no el CSS.

---

## Cómo encaja con el plan de la auditoría

| Fase de AUDITORIA_UI.md | Pieza open-source |
|---|---|
| Fase 1 — capa de tokens | **Radix Colors** + **Open Props** |
| Fase 2 — calmar la pantalla | tokens (nada nuevo que instalar) |
| Fase 3 — componentes y gráficas | **tema de ECharts** + Tabler como referencia |
| Fase 3 — completar modo oscuro | **Radix Colors** (archivos `-dark`) |

**Peso total añadido: ~32 KB de CSS.** Todo por CDN, todo MIT, cero build, cero
cambios de comportamiento.

## Expectativa realista

Esto produce un cambio **grande y visible**: color coherente, tipografía
ordenada, tarjetas homologadas, gráficas que por fin parecen de la misma
aplicación y un modo oscuro que funciona. Lo que **no** hace por sí solo es
reorganizar pantallas: los anillos de KPI que no deberían ser anillos (§7), la
cabecera doble (§9) y los nombres cortados en las gráficas (§8) siguen siendo
trabajo a mano. Los tokens hacen que ese trabajo a mano sea mucho más corto.

---

### Fuentes

- [Open Props](https://open-props.style/)
- [Radix Colors](https://radix-ui.com/colors/docs)
- [ECharts — personalización de estilo](https://echarts.apache.org/handbook/en/concepts/style)
- [ECharts — constructor de temas](https://echarts.apache.org/theme-builder)
- [Tabler](https://github.com/tabler/tabler)
- [Shoelace](https://next.shoelace.style/getting-started/installation)
