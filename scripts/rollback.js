#!/usr/bin/env node
/**
 * Rollback a un release anterior.
 *
 * Deja el contenido de main exactamente igual al del tag indicado, pero como
 * un commit NUEVO encima de main (no reescribe historia, así que no hace falta
 * force-push y nadie pierde commits). Railway redespliega solo al recibir ese
 * push, con lo que la producción vuelve a la versión buena.
 *
 * Uso:
 *   node scripts/rollback.js                  # lista los releases disponibles
 *   node scripts/rollback.js v1.2.0           # vuelve a v1.2.0
 *   node scripts/rollback.js v1.2.0 --dry-run # enseña qué haría
 *   node scripts/rollback.js v1.2.0 --no-push # deja el commit sin empujar
 */

const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const NO_PUSH = args.includes('--no-push');
const target = args.find((a) => !a.startsWith('--'));

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function run(cmd) {
  if (DRY) {
    console.log('  [dry-run] ' + cmd);
    return '';
  }
  console.log('  $ ' + cmd);
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' });
}

function fail(msg) {
  console.error('\n✗ ' + msg + '\n');
  process.exit(1);
}

try {
  sh('git fetch origin main --tags');
} catch (e) {
  console.warn('⚠ No se pudo contactar con origin (¿sin red?). Uso los tags locales.');
}

const tags = sh('git tag -l "v*"')
  .split('\n')
  .filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
  .sort((a, b) => {
    const pa = a.slice(1).split('.').map(Number);
    const pb = b.slice(1).split('.').map(Number);
    return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
  });

if (!target) {
  console.log('\nReleases disponibles (del más nuevo al más viejo):\n');
  if (!tags.length) {
    console.log('  (ninguno todavía — lanza uno con: node scripts/release.js minor)\n');
  } else {
    tags.forEach((t, i) => {
      const date = sh(`git log -1 --format=%ci ${t}`).slice(0, 10);
      const subject = sh(`git log -1 --format=%s ${t}`);
      console.log(`  ${i === 0 ? '→' : ' '} ${t.padEnd(10)} ${date}  ${subject}`);
    });
    console.log('\nPara volver a uno:  node scripts/rollback.js ' + (tags[1] || tags[0]) + '\n');
  }
  process.exit(0);
}

if (!tags.includes(target)) {
  fail(`El tag "${target}" no existe. Corre "node scripts/rollback.js" sin argumentos para ver la lista.`);
}

const branch = sh('git rev-parse --abbrev-ref HEAD');
if (branch !== 'main') {
  fail(`Estás en la rama "${branch}". El rollback se aplica sobre main.`);
}

const dirty = sh('git status --porcelain');
if (dirty && !DRY) {
  fail('Hay cambios sin commitear. Haz commit o stash antes del rollback:\n' + dirty);
}

const headTree = sh('git rev-parse HEAD:');
const tagTree = sh(`git rev-parse ${target}:`);
if (headTree === tagTree) {
  console.log(`\n✓ main ya es idéntico a ${target}. No hay nada que deshacer.\n`);
  process.exit(0);
}

let current;
try {
  current = sh('git describe --tags --abbrev=0');
} catch (e) {
  current = 'sin tag';
}
const undone = sh(`git log ${target}..HEAD --no-merges --pretty=format:"- %s"`);

console.log('\n════════════════════════════════════════════');
console.log(`  ROLLBACK:  ${current}  →  ${target}`);
console.log('════════════════════════════════════════════');
console.log('Se deshace el efecto de estos commits (la historia se conserva):\n');
console.log(undone || '  (ninguno)');
console.log('════════════════════════════════════════════\n');

// read-tree deja índice y working tree con el árbol del tag, sin mover HEAD:
// el commit siguiente tiene el contenido viejo y el padre es el main actual.
run(`git read-tree -u --reset ${target}`);
run(`git commit -m "revert: volver al release ${target}" -m "Rollback de ${current} a ${target}. El contenido de main queda idéntico a ${target}; la historia se conserva."`);

if (NO_PUSH) {
  console.log('\n✓ Commit de rollback creado en local (--no-push).');
  console.log('  Revísalo y empuja con: git push origin main\n');
} else {
  run('git push origin main');
  console.log('\n✓ Rollback a ' + target + (DRY ? ' (simulado)' : ' empujado.'));
  if (!DRY) {
    console.log('  Railway redespliega solo con este push.');
    console.log('  La versión en backend/package.json vuelve a ser la de ' + target + '.');
    console.log('  Cuando arregles el problema, lanza un release nuevo: node scripts/release.js patch');
  }
}
