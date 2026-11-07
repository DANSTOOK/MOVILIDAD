#!/usr/bin/env node
/**
 * Genera dataset.csv, el concentrado sintetico que alimenta la auditoria de
 * accesibilidad. Determinista: misma salida en cada ejecucion.
 *
 * Por que un fichero sintetico y no el _test_data.csv de la raiz: ese esta en
 * .gitignore, asi que en CI no existe, y lleva nombres reales de tienda y de
 * asesor. Este repositorio es publico. El fixture reproduce la ESTRUCTURA que
 * el tablero necesita -las columnas que valida validateFileStructure, el CR
 * que extractCR saca del Friendly Name, la plaza que parseLastName lee del
 * final del Last Name- con nombres inventados.
 *
 * Las fechas estan ancladas a una fecha fija del pasado a proposito: el
 * tablero toma el "Last Seen" mas reciente del fichero como ahora de
 * referencia (REFERENCE_NOW_MS), de modo que los tramos -en linea, critico,
 * fuera de linea- salen iguales hoy y dentro de dos anos. Sin ancla, el
 * fixture caducaria y la auditoria mediria otra pantalla cada semana.
 *
 *   node tests/a11y/fixtures/make-dataset.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Ancla: el equipo mas reciente del fichero. parseDate del tablero lee
// dd/mm/yyyy, no mm/dd/yyyy.
const ANCHOR = new Date(2026, 10, 1, 9, 40); // 01/11/2026 09:40

const PLAZAS = ['Tijuana Este', 'Tijuana Centro', 'Ensenada', 'Playas'];

// TC58/TC52/TC52X cuentan como HH; el resto como TABLET (ver processRows).
const MODELS = ['TC58', 'TC52', 'TC52X', 'TC57', 'MC3300'];
const OS_BY_MODEL = {
  TC58: ['11', '13'],
  TC52: ['10', '11'],
  TC52X: ['11', '13'],
  TC57: ['8.1.0', '10', '13'],
  MC3300: ['8.1.0', '10', '11'],
};

const CALLES = [
  'Alamo', 'Bugambilia', 'Cedro', 'Duraznos', 'Encino', 'Fresno', 'Granado',
  'Higuera', 'Jacaranda', 'Laurel', 'Mezquite', 'Nogal', 'Olivo', 'Palma',
  'Quebracho', 'Roble', 'Sauce', 'Tabachin', 'Uva', 'Viburno', 'Yuca', 'Zapote',
  'Mirador', 'Portal', 'Rotonda', 'Terraza', 'Vereda', 'Alameda', 'Bulevar',
  'Calzada',
];

const ASESORES = [
  'A. Delgado Rios', 'B. Mendoza Prieto', 'C. Rivas Alarcon', 'D. Salgado Nieto',
  'E. Trevino Olmos', 'F. Quintero Vega', 'G. Herrera Pinto', 'H. Cardenas Soto',
];

// Generador congruente lineal: aleatoriedad reproducible sin dependencias.
let seed = 20261101;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const B32 = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789';
const usedCR = new Set();
function makeCR() {
  // extractCR busca /(50[A-Z0-9]{3})/ en el Friendly Name.
  for (;;) {
    const cr = '50' + Array.from({ length: 3 }, () => pick(B32.split(''))).join('');
    if (!usedCR.has(cr)) { usedCR.add(cr); return cr; }
  }
}

const pad = (n) => String(n).padStart(2, '0');
function stamp(minutesBefore) {
  const d = new Date(ANCHOR.getTime() - minutesBefore * 60000);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Tramos de antiguedad, para que los KPI y los graficos no salgan todos en un
// solo cubo: en linea, de un dia, critico (>4 dias) y muy atrasado.
const BUCKETS = [
  { weight: 34, min: 0, max: 180 },          // minutos: en linea
  { weight: 22, min: 1440, max: 4320 },      // 1-3 dias
  { weight: 28, min: 5760, max: 14400 },     // 4-10 dias: critico
  { weight: 16, min: 20160, max: 57600 },    // 14-40 dias
];
function minutesAgo() {
  const total = BUCKETS.reduce((s, b) => s + b.weight, 0);
  let r = rnd() * total;
  for (const b of BUCKETS) {
    if ((r -= b.weight) <= 0) return Math.floor(b.min + rnd() * (b.max - b.min));
  }
  return 0;
}

const rows = [];
let serial = 17200000000;

function addRow({ cr, plaza, model, mins, breakPlaza = false, tienda }) {
  const os = pick(OS_BY_MODEL[model]);
  const nombreTienda = tienda || `${pick(CALLES)} ${100 + Math.floor(rnd() * 800)}`;
  // parseLastName saca la plaza del final del Last Name. Si no la ponemos, el
  // registro queda con _plazaOk:false y aparece en Inconsistencias: eso es
  // justo lo que queremos ejercitar en unas pocas filas.
  const lastName = breakPlaza
    ? `OXXO ${nombreTienda} TIJ`
    : `OXXO ${nombreTienda} TIJ ${plaza}`;
  rows.push({
    'Friendly Name': `${cr}_${model}_${1000 + rows.length}`,
    'Last Name': lastName,
    'Last Seen': stamp(mins),
    Model: model,
    OS: os,
    'Serial Number': String(++serial),
    ASESOR: pick(ASESORES),
  });
}

// 1) El grueso del fichero: una tienda, un equipo.
for (let i = 0; i < 196; i++) {
  addRow({ cr: makeCR(), plaza: PLAZAS[i % PLAZAS.length], model: pick(MODELS), mins: minutesAgo() });
}

// 2) Tiendas con HH y TABLET a la vez: el cruce de datos vive de esto.
for (let i = 0; i < 14; i++) {
  const cr = makeCR();
  const plaza = PLAZAS[i % PLAZAS.length];
  const tienda = `${pick(CALLES)} ${100 + Math.floor(rnd() * 800)}`;
  addRow({ cr, plaza, tienda, model: pick(['TC58', 'TC52', 'TC52X']), mins: minutesAgo() });
  addRow({ cr, plaza, tienda, model: pick(['TC57', 'MC3300']), mins: minutesAgo() });
}

// 3) Plaza sin resolver: alimenta la pestana de Inconsistencias.
for (let i = 0; i < 9; i++) {
  addRow({ cr: makeCR(), plaza: PLAZAS[i % PLAZAS.length], model: pick(MODELS), mins: minutesAgo(), breakPlaza: true });
}

// 4) Una fila con el equipo mas reciente exactamente en el ancla, para que
// REFERENCE_NOW_MS quede fijado donde esperamos.
addRow({ cr: makeCR(), plaza: 'Tijuana Este', model: 'TC58', mins: 0 });

const HEADERS = ['Friendly Name', 'Last Name', 'Last Seen', 'Model', 'OS', 'Serial Number', 'ASESOR'];
const csv = [
  HEADERS.join(','),
  ...rows.map((r) => HEADERS.map((h) => {
    const v = String(r[h] ?? '');
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }).join(',')),
].join('\n') + '\n';

const out = join(dirname(fileURLToPath(import.meta.url)), 'dataset.csv');
writeFileSync(out, csv, 'utf8');
console.log(`dataset.csv: ${rows.length} equipos, ${usedCR.size} tiendas -> ${out}`);
