#!/usr/bin/env node
/**
 * Build the WebExtension bundle consumed by Safari.
 *
 * The source tree is plain ESM so it stays readable and testable. esbuild packs
 * each entry point into a classic script because Safari content scripts do not
 * load ES modules directly. We invoke the esbuild CLI rather than its Node API
 * so builds stay reliable even when the host filesystem is slow to scan.
 */
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'extension');
const esbuild = join(root, 'node_modules', '.bin', 'esbuild');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const entries = [
  { in: 'src/background/index.js', out: 'background.js' },
  { in: 'src/content/index.js', out: 'content.js' },
  { in: 'src/popup/popup.js', out: 'popup.js' },
  { in: 'src/options/options.js', out: 'options.js' },
];

function copy(rel, destination = rel.replace(/^src\//, '')) {
  const from = join(root, rel);
  const to = join(outDir, destination);
  if (!existsSync(from)) throw new Error(`Missing static asset: ${rel}`);
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runEsbuild(entry) {
  const args = [
    join(root, entry.in),
    '--bundle',
    `--outfile=${join(outDir, entry.out)}`,
    '--format=iife',
    '--platform=browser',
    '--target=safari15',
    '--charset=utf8',
    '--loader:.css=text',
    `--define:__YILIU_VERSION__=${JSON.stringify(pkg.version)}`,
    '--log-level=warning',
  ];
  execFileSync(esbuild, args, { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
}

async function main() {
  if (!existsSync(esbuild)) {
    throw new Error('esbuild is missing. Run: npm install');
  }

  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  for (const entry of entries) {
    const started = Date.now();
    runEsbuild(entry);
    const size = statSync(join(outDir, entry.out)).size;
    console.log(
      `  ${entry.out.padEnd(16)} ${(size / 1024).toFixed(1).padStart(7)} KB  ${Date.now() - started}ms`,
    );
  }

  copy('src/manifest.json', 'manifest.json');
  copy('src/content/content.css', 'content.css');
  copy('src/popup/popup.html', 'popup.html');
  copy('src/popup/popup.css', 'popup.css');
  copy('src/options/options.html', 'options.html');
  copy('src/options/options.css', 'options.css');
  copy('assets/icons', 'icons');

  const manifestPath = join(outDir, 'manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.version = pkg.version;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const referenced = new Set();
  for (const icon of Object.values(manifest.icons || {})) referenced.add(icon);
  for (const icon of Object.values(manifest.browser_action?.default_icon || {})) {
    referenced.add(icon);
  }
  if (manifest.browser_action?.default_popup) referenced.add(manifest.browser_action.default_popup);
  if (manifest.options_ui?.page) referenced.add(manifest.options_ui.page);
  for (const script of manifest.content_scripts || []) {
    for (const file of script.js || []) referenced.add(file);
    for (const file of script.css || []) referenced.add(file);
  }
  for (const script of manifest.background?.scripts || []) referenced.add(script);
  for (const file of referenced) {
    assert(existsSync(join(outDir, file)), `manifest references missing file: ${file}`);
  }

  assert(manifest.manifest_version === 2, 'Safari build expects manifest v2');
  assert(JSON.stringify(manifest).includes('content.js'), 'content script missing');

  const total = [...referenced].reduce((sum, file) => sum + statSync(join(outDir, file)).size, 0);
  console.log(`\n  extension/  ${(total / 1024).toFixed(1)} KB referenced assets`);
  console.log(`  译流 v${pkg.version} build complete.`);
}

main().catch((error) => {
  console.error('\nBuild failed:', error.message);
  process.exitCode = 1;
});
