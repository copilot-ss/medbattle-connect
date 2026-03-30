import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');
const androidDir = path.join(projectRoot, 'android');
const appJsonPath = path.join(projectRoot, 'app.json');
const aabPath = path.join(
  projectRoot,
  'android',
  'app',
  'build',
  'outputs',
  'bundle',
  'release',
  'app-release.aab'
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readVersionCode() {
  const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  return appConfig?.expo?.android?.versionCode ?? null;
}

const checkScriptPath = path.join(scriptDir, 'check.mjs');

run(process.execPath, [checkScriptPath]);

if (process.platform === 'win32') {
  run('cmd.exe', ['/c', 'gradlew.bat', 'bundleRelease'], { cwd: androidDir });
} else {
  run('./gradlew', ['bundleRelease'], { cwd: androidDir });
}

const versionCode = readVersionCode();
const aabStats = fs.existsSync(aabPath) ? fs.statSync(aabPath) : null;

if (!aabStats) {
  console.error('AAB build finished, but app-release.aab was not found.');
  process.exit(1);
}

console.log('');
console.log(`AAB ready: ${aabPath}`);
console.log(`Android versionCode: ${versionCode}`);
console.log(`Last updated: ${aabStats.mtime.toISOString()}`);
