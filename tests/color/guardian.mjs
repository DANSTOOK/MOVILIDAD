#!/usr/bin/env node
/**
 * Guardian de la paleta: no deja que vuelvan los colores sueltos.
 *
 * Por que existe. La aplicacion llego a tener 235 colores hexadecimales
 * distintos en 898 usos. No porque nadie supiera hacerlo mejor, sino
 * porque cada arreglo urgente anade uno y nadie los cuenta nunca. Se
 * construyo una escala medida en OKLCH y se apuntaron los tokens a ella,
 * pero una escala sin nadie que la vigile se desarma sola en unos meses:
 * ya paso una vez.
 *
 * Esto NO prohibe los literales. Hay sitios donde son obligatorios:
 *
 *   · el cuerpo del correo, porque Outlook, Gmail y Apple Mail no
 *     entienden las variables CSS;
 *   · el PDF, que se pinta con jsPDF y quiere numeros;
 *   · las graficas, que pintan en canvas, donde var() no existe;
 *   · las definiciones de los propios tokens, que es donde deben estar.
 *
 * Lo que hace es un TRINQUETE: cuenta los literales de cada zona y falla
 * si alguna sube respecto a la linea base. Pueden bajar cuando quieras;
 * subir, no sin cambiar la base a conciencia y dejarlo escrito.
 *
 * Uso:  node tests/color/guardian.mjs
 *       node tests/color/guardian.mjs --actualizar   (reescribe la base)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const INDEX = resolve(join(AQUI, '..', '..', 'index.html'));
const BASE = join(AQUI, 'linea-base.json');
const actualizar = process.argv.includes('--actualizar');

const html = readFileSync(INDEX, 'utf8');
const HEX = /#[0-9A-Fa-f]{6}\b/g;

/* Un bloque <style> es "de tokens" si define la escala. */
const esDeTokens = (bloque) => /--ink-marca:\s*#/.test(bloque);

let enTokens = 0;
let enCss = 0;
const sinEstilos = html.replace(/<style[^>]*>[\s\S]*?<\/style>/g, (bloque) => {
  const n = (bloque.match(HEX) || []).length;
  if (esDeTokens(bloque)) enTokens += n; else enCss += n;
  return ''; // se saca para contar el resto aparte
});
const enScript = (sinEstilos.match(HEX) || []).length;

const hoy = { css: enCss, script: enScript, tokens: enTokens };

if (actualizar || !existsSync(BASE)) {
  writeFileSync(BASE, JSON.stringify(hoy, null, 2) + '\n');
  console.log('Linea base escrita:', JSON.stringify(hoy));
  process.exit(0);
}

const base = JSON.parse(readFileSync(BASE, 'utf8'));
const zonas = [
  ['css', 'hojas de estilo (fuera de las definiciones de token)'],
  ['script', 'guion y marcado (correo, PDF, graficas, estilos en linea)'],
];

let mal = false;
console.log('Colores escritos a mano, por zona:\n');
for (const [clave, nombre] of zonas) {
  const n = hoy[clave], b = base[clave];
  const signo = n > b ? '+' : '';
  const estado = n > b ? '  SUBE, y no deberia' : n < b ? '  baja' : '  igual';
  console.log(`  ${nombre}`);
  console.log(`    ahora ${n}   base ${b}   ${signo}${n - b}${estado}\n`);
  if (n > b) mal = true;
}
console.log(`  definiciones de token: ${hoy.tokens} (aqui los literales son lo correcto)\n`);

if (mal) {
  console.error('FALLO: han aparecido colores sueltos nuevos.');
  console.error('');
  console.error('Si el color nuevo es semantico -un estado, la marca, un gris de');
  console.error('texto- usa el token que le corresponde en vez del hexadecimal.');
  console.error('');
  console.error('Si de verdad hace falta un literal (cuerpo de correo, PDF, canvas),');
  console.error('deja escrito AL LADO por que, y sube la linea base a proposito con:');
  console.error('    node tests/color/guardian.mjs --actualizar');
  process.exit(1);
}
console.log('Sin colores sueltos nuevos.');
