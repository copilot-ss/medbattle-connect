import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');
const defaultAabPath = path.join(
  projectRoot,
  'android',
  'app',
  'build',
  'outputs',
  'bundle',
  'release',
  'app-release.aab'
);
const bundletoolPath = path.join(projectRoot, 'tools', 'android', 'bundletool.jar');
const expectedUploadCertificateSha256 =
  '62:55:AD:58:1E:3D:D6:23:55:4A:38:E3:F9:46:BE:5F:7E:6E:C5:70:B2:2C:A5:02:0E:46:6B:D8:F9:00:ED:45';
const expectedAbis = ['arm64-v8a', 'armeabi-v7a', 'x86_64'];

function run(command, args) {
  try {
    return execFileSync(command, args, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const details = [error?.stdout, error?.stderr]
      .filter(Boolean)
      .map((value) => String(value).trim())
      .filter(Boolean)
      .join('\n');
    throw new Error(`${command} failed${details ? `:\n${details}` : '.'}`);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(projectRoot, relativePath), 'utf8'));
}

function bundletool(args) {
  return run('java', ['-jar', bundletoolPath, ...args]);
}

const requestedPath = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : defaultAabPath;

if (!fs.existsSync(requestedPath)) {
  throw new Error(`AAB not found: ${requestedPath}`);
}

if (!fs.existsSync(bundletoolPath)) {
  throw new Error(`Bundletool not found: ${bundletoolPath}`);
}

const appConfig = readJson('app.json');
const expectedVersionCode = String(appConfig?.expo?.android?.versionCode ?? '');
const expectedVersionName = String(appConfig?.expo?.version ?? '');

bundletool(['validate', `--bundle=${requestedPath}`]);

const actualVersionCode = bundletool([
  'dump',
  'manifest',
  `--bundle=${requestedPath}`,
  '--module=base',
  '--xpath=/manifest/@android:versionCode',
]);
const actualVersionName = bundletool([
  'dump',
  'manifest',
  `--bundle=${requestedPath}`,
  '--module=base',
  '--xpath=/manifest/@android:versionName',
]);

if (actualVersionCode !== expectedVersionCode) {
  throw new Error(
    `AAB versionCode ${actualVersionCode} does not match app.json ${expectedVersionCode}.`
  );
}

if (actualVersionName !== expectedVersionName) {
  throw new Error(
    `AAB versionName ${actualVersionName} does not match app.json ${expectedVersionName}.`
  );
}

const bundleConfig = bundletool(['dump', 'config', `--bundle=${requestedPath}`]);
if (!bundleConfig.includes('PAGE_ALIGNMENT_16K')) {
  throw new Error('AAB does not declare PAGE_ALIGNMENT_16K for native libraries.');
}

run('jarsigner', ['-verify', requestedPath]);
const certificateOutput = run('keytool', ['-printcert', '-jarfile', requestedPath]);
const actualCertificateSha256 = certificateOutput.match(
  /SHA256:\s*([0-9A-F:]+)/i
)?.[1]?.toUpperCase();

if (actualCertificateSha256 !== expectedUploadCertificateSha256) {
  throw new Error(
    `Unexpected upload certificate SHA-256: ${actualCertificateSha256 ?? 'not found'}.`
  );
}

const archiveEntries = run('jar', ['tf', requestedPath]);
const actualAbis = [...new Set(
  archiveEntries
    .split(/\r?\n/)
    .map((entry) => entry.match(/^base\/lib\/([^/]+)\//)?.[1])
    .filter(Boolean)
)].sort();

if (actualAbis.join(',') !== [...expectedAbis].sort().join(',')) {
  throw new Error(
    `Unexpected AAB ABIs: ${actualAbis.join(', ') || 'none found'}.`
  );
}

const sha256 = crypto
  .createHash('sha256')
  .update(fs.readFileSync(requestedPath))
  .digest('hex')
  .toUpperCase();
const stats = fs.statSync(requestedPath);

console.log('AAB verification passed');
console.log(`Path: ${requestedPath}`);
console.log(`Version: ${actualVersionName} (${actualVersionCode})`);
console.log(`SHA-256: ${sha256}`);
console.log(`Upload certificate SHA-256: ${actualCertificateSha256}`);
console.log(`ABIs: ${actualAbis.join(', ')}`);
console.log('Native library packaging: PAGE_ALIGNMENT_16K');
console.log(`Size: ${stats.size} bytes`);
