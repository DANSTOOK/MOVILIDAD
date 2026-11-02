#!/usr/bin/env node
/**
 * Lanzamiento de release.
 *
 * Sube la versión en backend/package.json, escribe la entrada del CHANGELOG
 * con los commits desde el release anterior, crea el tag vX.Y.Z y lo empuja.
 * Al llegar el tag, .github/workflows/release.yml publica el GitHub Release;
 * al llegar el push a main, Railway redespliega.
 *
 * Uso:
 *   node scripts/release.js patch          # 1.0.0 -> 1.0.1
 *   node scripts/release.js minor          # 1.0.0 -> 1.1.0
 *   node scripts/release.js major          # 1.0.0 -> 2.0.0
 *   node scripts/release.js 2.3.1          # versión explícita
 *   node scripts/release.js minor --dry-run   # enseña qué haría, sin tocar nada
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const PKG = path.join(ROOT, 'backend', 'package.json');
const CHANGELOG = path.join(ROOT, 'CHANGELOG.md');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const bump = args.find((a) => !a.startsWith('--'));

function sh(cmd, opts = {}) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts }).trim();
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

if (!bump) {
  fail('Falta la versión. Uso: node scripts/release.js patch|minor|major|X.Y.Z [--dry-run]');
}

// ── Comprobaciones previas ──────────────────────────────────────────
const branch = sh('git rev-parse --abbrev-ref HEAD');
if (branch !== 'main') {
  fail(`Estás en la rama "${branch}". Los releases se lanzan desde main.`);
}

const dirty = sh('git status --porcelain');
if (dirty && !DRY) {
  fail('Hay cambios sin commitear. Haz commit o stash antes de lanzar el release:\n' + dirty);
}

try {
  sh('git fetch origin main --tags');
  const behind = sh('git rev-list --count HEAD..origin/main');
  if (behind !== '0') {
    fail(`main local está ${behind} commit(s) por detrás de origin/main. Haz git pull primero.`);
  }
} catch (e) {
  console.warn('⚠ No se pudo contactar con origin (¿sin red?). Continúo con el estado local.');
}

// ── Calcular la versión nueva ───────────────────────────────────────
const pkg = JSON.parse(fs.readFileSync(PKG, 'utf8'));
const current = pkg.version;

function nextVersion(cur, how) {
  if (/^\d+\.\d+\.\d+$/.test(how)) return how;
  const [ma, mi, pa] = cur.split('.').map(Number);
  if (how === 'major') return `${ma + 1}.0.0`;
  if (how === 'minor') return `${ma}.${mi + 1}.0`;
  if (how === 'patch') return `${ma}.${mi}.${pa + 1}`;
  fail(`No entiendo "${how}". Usa patch, minor, major o una versión X.Y.Z.`);
}

const version = nextVersion(current, bump);
const tag = 'v' + version;

const existing = sh('git tag -l').split('\n').filter(Boolean);
if (existing.includes(tag)) {
  fail(`El tag ${tag} ya existe. Elige otra versión.`);
}

// ── Notas: commits desde el release anterior ────────────────────────
const prevTag = existing
  .filter((t) => /^v\d+\.\d+\.\d+$/.test(t))
  .sort((a, b) => {
    const pa = a.slice(1).split('.').map(Number);
    const pb = b.slice(1).split('.').map(Number);
    return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
  })[0];

const range = prevTag ? `${prevTag}..HEAD` : 'HEAD';
const commits = sh(`git log ${range} --no-merges --pretty=format:"- %s"`) || '- Primer release.';

console.log('\n════════════════════════════════════════════');
console.log(`  Release ${current} → ${version}  (tag ${tag})`);
console.log(`  Desde: ${prevTag || 'el principio del repo'}`);
console.log('════════════════════════════════════════════');
console.log(commits);
console.log('════════════════════════════════════════════\n');

// ── Escribir versión y CHANGELOG ────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const entry = `## ${tag} — ${today}\n\n${commits}\n\n`;

if (DRY) {
  console.log('  [dry-run] backend/package.json -> version ' + version);
  console.log('  [dry-run] CHANGELOG.md -> nueva sección ' + tag);
} else {
  pkg.version = version;
  fs.writeFileSync(PKG, JSON.stringify(pkg, null, 2) + '\n');

  const header = '# Changelog\n\n';
  let changelog = fs.existsSync(CHANGELOG) ? fs.readFileSync(CHANGELOG, 'utf8') : header;
  if (!changelog.startsWith('# Changelog')) changelog = header + changelog;
  changelog = changelog.replace(header, header + entry);
  fs.writeFileSync(CHANGELOG, changelog);
}

// ── Commit, tag y push ──────────────────────────────────────────────
run('git add backend/package.json CHANGELOG.md');
run(`git commit -m "chore(release): ${tag}"`);
run(`git tag -a ${tag} -m "Release ${tag}"`);
run('git push origin main');
run(`git push origin ${tag}`);

console.log('\n✓ Release ' + tag + (DRY ? ' (simulado)' : ' lanzado.'));
if (!DRY) {
  console.log('  GitHub Release: lo publica el workflow al recibir el tag.');
  console.log('  Railway: redespliega con el push a main.');
  console.log(`  Si sale mal: node scripts/rollback.js ${prevTag || '<tag-anterior>'}`);
}
