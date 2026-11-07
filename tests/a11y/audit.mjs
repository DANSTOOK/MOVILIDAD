#!/usr/bin/env node
/**
 * Auditoria de accesibilidad y contraste del tablero, con axe-core -el mismo
 * motor que usa Lighthouse- sobre la pagina ya cargada con datos.
 *
 * Por que existe: el medidor de contraste escrito a mano dentro del navegador
 * fallo tres veces de tres maneras distintas (se salto la barra de marca
 * entera, dio 137 fallos fantasma por medir durante la animacion de entrada, y
 * canto cero fallos con tres sitios rotos delante). Y una regresion visual
 * total -tarjetas de color macizo- se le paso, porque texto oscuro sobre
 * blanco contrasta de maravilla. La medicion a mano no vale.
 *
 * Lo que hace, en orden:
 *   1. abre la pagina que sirve el backend,
 *   2. carga el concentrado de prueba (sin fichero el tablero no existe: la
 *      aplicacion arranca en la pantalla de bienvenida),
 *   3. pulsa CONTINUAR para llegar al tablero,
 *   4. recorre las ocho pestanas en tema claro y en tema oscuro,
 *   5. pasa axe-core en cada una de las dieciseis vistas,
 *   6. escribe el informe y sale con 1 si hay algo serious o critical.
 *
 * Uso:  node tests/a11y/audit.mjs
 * Env:  A11Y_BASE_URL  (por defecto http://127.0.0.1:3001)
 *       A11Y_OUT_DIR   (por defecto tests/a11y/report)
 *       A11Y_SETTLE_MS (por defecto 3000, la espera de la animacion)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.A11Y_BASE_URL || 'http://127.0.0.1:3001';
const OUT_DIR = resolve(process.env.A11Y_OUT_DIR || join(HERE, 'report'));
const DATASET = join(HERE, 'fixtures', 'dataset.csv');

/* Entre pestana y pestana corre una animacion de entrada escalonada. Medir
   mientras corre da fallos de elementos a medio aparecer -translucidos, y por
   tanto sin contraste-; ya paso una vez y fueron 137 fallos fantasma. Ademas
   de esta espera, el contexto se abre con prefers-reduced-motion: reduce, que
   la hoja de estilos ya respeta (@media prefers-reduced-motion en index.html).
   Las dos defensas juntas, porque una sola ya demostro no bastar. */
const SETTLE_MS = Number(process.env.A11Y_SETTLE_MS || 3000);

/* Las ocho pestanas. El id es el argumento de switchTab(); la etiqueta es el
   texto del boton .tabs .tab, que es lo que se lee en el informe. */
const TABS = [
  { id: 'cruce', label: 'Cruce' },
  { id: 'resumen', label: 'Resumen' },
  { id: 'detalle', label: 'Detalle' },
  { id: 'garantia', label: 'Stock' },
  { id: 'inconsistencias', label: 'Inconsistencias' },
  { id: 'os-modelos', label: 'OS & Modelos' },
  { id: 'exportacion', label: 'Exportacion' },
  { id: 'configuracion', label: 'Configuracion' },
];

const THEMES = ['light', 'dark'];

/* ---------------------------------------------------------------------------
 * Exclusiones. Cada una esta aqui porque medirla contra el DOM da un fallo que
 * no existe en pantalla, no porque el fallo moleste.
 * ------------------------------------------------------------------------- */
const EXCLUDE = [
  /* Las etiquetas de plaza del mapa van dibujadas SOBRE las teselas y llevan
     un halo de text-shadow blanco que les da el contraste. axe sube por el DOM
     para componer el fondo: encuentra el contenedor transparente del mapa, no
     la tesela, y no ve el halo en absoluto. El resultado son fallos de
     contraste de texto que en pantalla se lee perfectamente. */
  '.leaflet-container',
  '.leaflet-marker-icon',

  /* Las ocho pestanas viven a la vez en el documento: la que no esta activa se
     apaga con opacity:0, no con display:none. Para axe eso NO es estar
     oculto -mira display y visibility-, asi que medía tambien las siete
     pestanas que no se ven, y con la opacidad a medio camino salian fallos de
     contraste que no existen: los chips de estado de Stock daban 2.5-2.9
     medidos asi, y asentados y a la vista dan entre 5.46 y 6.13.
     Se mide lo que se ve. */
  '.section:not(.active)',
];

/* La barra de marca (.app-bar) NO se excluye, a proposito.
 *
 * Se esperaba tener que excluirla: es roja con texto blanco, mide 4.94:1, y se
 * daba por hecho que ese rojo estaba pintado en un pseudo-elemento, lo que
 * dejaria ciego a cualquier auditor que componga el fondo subiendo por el DOM
 * -leeria la barra como transparente, seguiria hasta el blanco de la pagina y
 * dictaminaria blanco sobre blanco-.
 *
 * Comprobado contra el navegador, no es asi. El fondo rojo es un
 * background-color de verdad sobre el propio .app-bar:
 *
 *   getComputedStyle('.app-bar').backgroundColor          -> rgb(226, 0, 26)
 *   getComputedStyle('.app-bar', '::before').backgroundColor -> rgba(0,0,0,0)
 *
 * El ::before solo lleva el degradado de brillo. axe lee el rojo bien y no da
 * ningun falso positivo de contraste aqui, asi que excluirla solo serviria
 * para dejar sin medir la barra de marca y, con ella, el panel de
 * notificaciones: exactamente el agujero que ya tuvo el medidor escrito a
 * mano. Se queda dentro de la medicion.
 *
 * Si algun dia ese rojo se mueve al pseudo-elemento, apareceran fallos de
 * contraste fantasma en .app-bar. Entonces -y solo entonces- se excluye,
 * dejando escrito aqui el motivo. */

/* wcag2a/wcag2aa/wcag21a/wcag21aa: el nivel AA, que es el objetivo.
   Deliberadamente sin best-practice, que mete reglas de estilo de codigo
   (orden de encabezados, landmarks) y ahogaria lo que importa en ruido.
   color-contrast entra en wcag2aa. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

const IMPACT_ORDER = ['minor', 'moderate', 'serious', 'critical'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Carga el concentrado y espera a que el tablero tenga datos de verdad.
 *  La primera llamada tras cargar la pagina a veces solo mete unas pocas
 *  filas, asi que se reintenta hasta pasar de 100 equipos. */
async function loadDataset(page) {
  // No tocar el input antes de que setupFileUpload() haya enganchado el
  // listener del change: si no, el evento se dispara en el vacio.
  await page.waitForFunction(
    () => typeof window.handleFile === 'function'
      && !!(document.getElementById('drop-zone-1') || {}).__fileUploadSetup,
    null,
    { timeout: 60000 },
  );

  for (let attempt = 1; attempt <= 6; attempt++) {
    await page.setInputFiles('#file-input-1', DATASET);
    try {
      await page.waitForFunction(
        () => Array.isArray(window.D) && window.D.length > 100,
        null,
        { timeout: 15000 },
      );
      const n = await page.evaluate(() => window.D.length);
      console.log(`  concentrado cargado: ${n} equipos (intento ${attempt})`);
      return;
    } catch {
      const n = await page.evaluate(() => (Array.isArray(window.D) ? window.D.length : -1));
      console.log(`  intento ${attempt}: window.D = ${n}, reintentando`);
      // El dropzone se autodesactiva al cargar con exito; para reintentar hay
      // que devolverlo a su estado inicial.
      await page.evaluate(() => {
        const dz = document.getElementById('drop-zone-1');
        if (dz) {
          dz.classList.remove('success');
          dz.style.pointerEvents = '';
          dz.style.opacity = '';
        }
        const input = document.getElementById('file-input-1');
        if (input) input.value = '';
      });
    }
  }
  throw new Error('el concentrado no llego a cargar mas de 100 equipos en 6 intentos');
}

async function gotoDashboard(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await loadDataset(page);

  // CONTINUAR. El id es lo estable; el texto es el contrato visible.
  const cont = page.locator('#continue-btn');
  await cont.waitFor({ state: 'visible', timeout: 30000 });
  await page.waitForFunction(
    () => !(document.getElementById('continue-btn') || {}).disabled,
    null,
    { timeout: 30000 },
  );
  await cont.click();

  // proceedToResults() esconde la pantalla de carga tras 300 ms y renderiza.
  await page.waitForSelector('#results-screen:not(.hidden)', { timeout: 60000 });
  await page.waitForSelector('.tabs .tab', { state: 'visible', timeout: 60000 });
  await sleep(SETTLE_MS);
}

async function setTheme(page, theme) {
  await page.evaluate((t) => window.applyTheme(t), theme);
  // applyTheme re-inicializa los graficos de ECharts: hay que dejarlos acabar.
  await sleep(SETTLE_MS);
}

/* Esperar un numero fijo de milisegundos no basta. En la primera pasada
   salieron cinco fallos de contraste que no existen: los chips de estado de
   Stock medidos a media aparicion, con la seccion todavia al 60% de opacidad
   -asentados dan entre 5.46 y 6.13-, y la etiqueta del selector de plaza, que
   asentada da 5.41. El reloj dice cuanto has esperado, no si ha terminado algo.
   Se le pregunta al navegador: mientras quede una animacion corriendo, no se
   mide. Con un tope, porque alguna es infinita a proposito (el latido de los
   avisos) y esa no va a terminar nunca. */
async function esperarQuietud(page, tope = 8000) {
  const hasta = Date.now() + tope;
  while (Date.now() < hasta) {
    const vivas = await page.evaluate(() =>
      document.getAnimations()
        .filter((a) => a.playState === 'running')
        /* las infinitas no cuentan: nunca acaban y no afectan al color */
        .filter((a) => {
          const t = a.effect && a.effect.getComputedTiming();
          return t && t.iterations !== Infinity;
        }).length
    );
    if (vivas === 0) return;
    await sleep(120);
  }
}

async function openTab(page, tab) {
  await page.evaluate((id) => window.switchTab(id), tab.id);
  await page.waitForSelector(`#${tab.id}.active`, { timeout: 30000 });
  // La animacion de entrada escalonada. Sin esta espera salen fallos fantasma.
  await sleep(SETTLE_MS);
  await esperarQuietud(page);
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch {
    /* las teselas del mapa pueden no acabar nunca; la espera fija ya cubre */
  }
}

async function runAxe(page) {
  /* Segunda comprobacion de quietud, pegada a la medicion. La de openTab no
     basta: al abrir Stock se marca el chip activo y eso dispara un fundido de
     #estado-table-wrap que empieza DESPUES de esa espera. Medido a mitad del
     fundido, el texto de los chips sale al 60% y da entre 2.5 y 2.9, cuando
     asentado pasa de sobra. */
  await esperarQuietud(page);
  await sleep(250);
  await esperarQuietud(page);
  let builder = new AxeBuilder({ page }).withTags(TAGS);
  for (const sel of EXCLUDE) builder = builder.exclude(sel);
  return builder.analyze();
}

function summarize(results) {
  const counts = { minor: 0, moderate: 0, serious: 0, critical: 0 };
  for (const v of results.violations) {
    counts[v.impact || 'minor'] += v.nodes.length;
  }
  return counts;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`axe-core sobre ${BASE_URL}`);
  console.log(`informe en ${OUT_DIR}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    // Ver el comentario de SETTLE_MS: la hoja de estilos respeta esta
    // preferencia y apaga las animaciones de entrada.
    reducedMotion: 'reduce',
    locale: 'es-MX',
    timezoneId: 'America/Tijuana',
  });
  const page = await context.newPage();

  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  const views = [];
  try {
    await gotoDashboard(page);

    for (const theme of THEMES) {
      await setTheme(page, theme);
      for (const tab of TABS) {
        await openTab(page, tab);
        const results = await runAxe(page);
        const counts = summarize(results);
        views.push({ theme, tab: tab.label, tabId: tab.id, counts, results });
        const bad = counts.serious + counts.critical;
        console.log(
          `  ${theme.padEnd(5)} ${tab.label.padEnd(16)} `
          + `${results.violations.length} reglas, ${bad} nodos serious/critical`,
        );
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  writeReports(views, pageErrors);

  const blocking = views.reduce((s, v) => s + v.counts.serious + v.counts.critical, 0);
  console.log('');
  if (blocking) {
    console.error(`FALLO: ${blocking} nodos con impacto serious/critical.`);
    console.error(`Detalle en ${join(OUT_DIR, 'resumen.md')}`);
    process.exitCode = 1;
  } else {
    console.log('Sin violaciones serious/critical.');
  }
}

/* ------------------------------- informe -------------------------------- */

function writeReports(views, pageErrors) {
  writeFileSync(
    join(OUT_DIR, 'axe-results.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        tags: TAGS,
        excluded: EXCLUDE,
        settleMs: SETTLE_MS,
        pageErrors,
        views: views.map((v) => ({
          theme: v.theme,
          tab: v.tab,
          tabId: v.tabId,
          counts: v.counts,
          violations: v.results.violations,
          incomplete: v.results.incomplete.map((i) => ({
            id: i.id, impact: i.impact, help: i.help, nodes: i.nodes.length,
          })),
          passes: v.results.passes.length,
        })),
      },
      null,
      2,
    ),
    'utf8',
  );

  /* Agrupado por regla, porque la misma regla rota aparece en las dieciseis
     vistas y un listado plano serian cientos de lineas de lo mismo. */
  const byRule = new Map();
  for (const v of views) {
    for (const rule of v.results.violations) {
      if (!byRule.has(rule.id)) {
        byRule.set(rule.id, {
          id: rule.id,
          impact: rule.impact || 'minor',
          help: rule.help,
          helpUrl: rule.helpUrl,
          nodes: new Map(),
        });
      }
      const entry = byRule.get(rule.id);
      // Un impacto mayor en cualquier vista manda.
      if (IMPACT_ORDER.indexOf(rule.impact) > IMPACT_ORDER.indexOf(entry.impact)) {
        entry.impact = rule.impact;
      }
      for (const node of rule.nodes) {
        const sel = node.target.join(' ');
        if (!entry.nodes.has(sel)) {
          entry.nodes.set(sel, {
            selector: sel,
            views: [],
            summary: node.failureSummary || '',
          });
        }
        entry.nodes.get(sel).views.push(`${v.tab}/${v.theme}`);
      }
    }
  }

  const rank = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const rules = [...byRule.values()].sort(
    (a, b) => (rank[a.impact] - rank[b.impact]) || (b.nodes.size - a.nodes.size),
  );

  const total = views.reduce((s, v) => s + v.counts.serious + v.counts.critical, 0);
  const L = [];
  L.push('# Auditoria de accesibilidad y contraste');
  L.push('');
  L.push(`axe-core sobre \`${BASE_URL}\`, ${new Date().toISOString()}`);
  L.push('');
  L.push(`Reglas: ${TAGS.join(', ')} · espera de animacion: ${SETTLE_MS} ms`);
  L.push(`Excluido: ${EXCLUDE.map((e) => `\`${e}\``).join(', ')} `
    + '(el motivo de cada uno esta escrito en `tests/a11y/audit.mjs`)');
  L.push('');
  L.push(total
    ? `**${total} nodos con impacto serious/critical.** El workflow falla por esto.`
    : '**Sin violaciones serious/critical.**');
  L.push('');
  L.push('## Por vista');
  L.push('');
  L.push('| Pestana | Tema | critical | serious | moderate | minor |');
  L.push('|---|---|---:|---:|---:|---:|');
  for (const v of views) {
    L.push(`| ${v.tab} | ${v.theme} | ${v.counts.critical} | ${v.counts.serious}`
      + ` | ${v.counts.moderate} | ${v.counts.minor} |`);
  }
  L.push('');

  if (rules.length) {
    L.push('## Por regla');
    L.push('');
    for (const rule of rules) {
      L.push(`### \`${rule.id}\` — ${rule.impact} — ${rule.nodes.size} elementos`);
      L.push('');
      L.push(`${rule.help}  `);
      L.push(`<${rule.helpUrl}>`);
      L.push('');
      for (const node of [...rule.nodes.values()].slice(0, 40)) {
        L.push(`- \`index.html\` · \`${node.selector}\``);
        L.push(`  - vistas: ${node.views.join(', ')}`);
        const detail = (node.summary || '')
          .split('\n').map((s) => s.trim()).filter(Boolean)[1];
        if (detail) L.push(`  - ${detail}`);
      }
      if (rule.nodes.size > 40) {
        L.push(`- …y ${rule.nodes.size - 40} elementos mas (ver \`axe-results.json\`)`);
      }
      L.push('');
    }
  } else {
    L.push('No hay violaciones que listar.');
    L.push('');
  }

  if (pageErrors.length) {
    L.push('## Errores de JavaScript durante la auditoria');
    L.push('');
    for (const e of [...new Set(pageErrors)].slice(0, 20)) L.push(`- \`${e}\``);
    L.push('');
  }

  writeFileSync(join(OUT_DIR, 'resumen.md'), L.join('\n'), 'utf8');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
