import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..', '..');
const defaultPackageName = 'com.sjigalin.medbattle';

function readOption(name, fallback = null) {
  const equalsPrefix = `--${name}=`;
  const equalsArg = process.argv.find((value) => value.startsWith(equalsPrefix));
  if (equalsArg) {
    return equalsArg.slice(equalsPrefix.length);
  }

  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }

  return fallback;
}

function resolveAdb() {
  if (process.env.ANDROID_ADB) {
    return process.env.ANDROID_ADB;
  }

  const sdkRoot = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
  if (!sdkRoot) {
    return 'adb';
  }

  return path.join(
    sdkRoot,
    'platform-tools',
    process.platform === 'win32' ? 'adb.exe' : 'adb'
  );
}

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      cwd: projectRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
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

function parseKb(text, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^${escapedLabel}:\\s+([\\d,]+)\\s+kB`, 'mi'));
  return match ? Number.parseInt(match[1].replaceAll(',', ''), 10) : null;
}

function parseSummaryKb(text, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`^\\s*${escapedLabel}:\\s+([\\d,]+)`, 'mi'));
  return match ? Number.parseInt(match[1].replaceAll(',', ''), 10) : null;
}

function parseTotalLine(text) {
  const match = text.match(
    /^\s*TOTAL PSS:\s*([\d,]+).*?TOTAL RSS:\s*([\d,]+).*?TOTAL SWAP PSS:\s*([\d,]+)/mi
  );
  if (!match) {
    return {};
  }

  return {
    totalPss: Number.parseInt(match[1].replaceAll(',', ''), 10),
    totalRss: Number.parseInt(match[2].replaceAll(',', ''), 10),
    totalSwapPss: Number.parseInt(match[3].replaceAll(',', ''), 10),
  };
}

function sanitizeLabel(value) {
  const normalized = String(value || 'snapshot')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'snapshot';
}

const adb = resolveAdb();
const requestedSerial = readOption('serial');
const packageName = readOption('package', defaultPackageName);
const label = sanitizeLabel(readOption('label', 'snapshot'));
const devicesOutput = run(adb, ['devices']);
const connectedDevices = devicesOutput
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.trim().split(/\s+/))
  .filter((parts) => parts[0] && parts[1] === 'device')
  .map((parts) => parts[0]);

const serial = requestedSerial || (connectedDevices.length === 1 ? connectedDevices[0] : null);
if (!serial) {
  throw new Error(
    connectedDevices.length
      ? `Multiple Android devices are connected. Pass --serial (${connectedDevices.join(', ')}).`
      : 'No ready Android device found.'
  );
}

function adbShell(args) {
  return run(adb, ['-s', serial, 'shell', ...args]);
}

const pid = adbShell(['pidof', packageName]).split(/\s+/)[0];
if (!pid) {
  throw new Error(`App process is not running: ${packageName}`);
}

const capturedAt = new Date();
const timestamp = capturedAt.toISOString().replace(/[:.]/g, '-');
const outputDir = path.resolve(
  projectRoot,
  readOption('output', path.join('.tmp_memory', `${timestamp}-${label}`))
);
fs.mkdirSync(outputDir, { recursive: true });

const [meminfo, processStatus, deviceMeminfo, sdk, model, packageInfo] = [
  adbShell(['dumpsys', 'meminfo', packageName]),
  adbShell(['cat', `/proc/${pid}/status`]),
  adbShell(['cat', '/proc/meminfo']),
  adbShell(['getprop', 'ro.build.version.sdk']),
  adbShell(['getprop', 'ro.product.model']),
  adbShell(['dumpsys', 'package', packageName]),
];

const totals = parseTotalLine(meminfo);
const anonRss = parseKb(processStatus, 'RssAnon');
const swap = parseKb(processStatus, 'VmSwap');
const versionCode = packageInfo.match(/versionCode=(\d+)/)?.[1] ?? null;
const versionName = packageInfo.match(/versionName=([^\s]+)/)?.[1] ?? null;
const bitmapCount = meminfo.match(/^\s*Bitmaps:\s*(\d+)/mi)?.[1] ?? null;

const report = {
  capturedAt: capturedAt.toISOString(),
  label,
  app: {
    packageName,
    pid: Number.parseInt(pid, 10),
    versionCode: versionCode ? Number.parseInt(versionCode, 10) : null,
    versionName,
  },
  device: {
    serial,
    model,
    androidApi: Number.parseInt(sdk, 10),
    totalRamKb: parseKb(deviceMeminfo, 'MemTotal'),
  },
  metricsKb: {
    anonRss,
    swap,
    anonRssPlusSwap: anonRss !== null && swap !== null ? anonRss + swap : null,
    residentSet: parseKb(processStatus, 'VmRSS'),
    fileRss: parseKb(processStatus, 'RssFile'),
    ...totals,
    javaHeap: parseSummaryKb(meminfo, 'Java Heap'),
    nativeHeap: parseSummaryKb(meminfo, 'Native Heap'),
    graphics: parseSummaryKb(meminfo, 'Graphics'),
    privateOther: parseSummaryKb(meminfo, 'Private Other'),
    system: parseSummaryKb(meminfo, 'System'),
  },
  objects: {
    bitmapCount: bitmapCount ? Number.parseInt(bitmapCount, 10) : null,
  },
  notes: [
    'anonRssPlusSwap is the local /proc proxy for the Google Play Anon RSS + Swap metric.',
    'graphics is a local bitmap/graphics proxy; Android vitals P90 remains authoritative.',
  ],
};

if (report.metricsKb.anonRssPlusSwap === null) {
  throw new Error('Could not parse RssAnon and VmSwap from the running app process.');
}

const baseName = `${timestamp}-${label}`;
const jsonPath = path.join(outputDir, `${baseName}.json`);
const meminfoPath = path.join(outputDir, `${baseName}.meminfo.txt`);
const processStatusPath = path.join(outputDir, `${baseName}.proc-status.txt`);

fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}${os.EOL}`, 'utf8');
fs.writeFileSync(meminfoPath, `${meminfo}${os.EOL}`, 'utf8');
fs.writeFileSync(processStatusPath, `${processStatus}${os.EOL}`, 'utf8');

console.log('Android memory snapshot captured');
console.log(`Device: ${model} (${serial}), API ${sdk}`);
console.log(`App: ${packageName} ${versionName ?? '-'} (${versionCode ?? '-'})`);
console.log(`Label: ${label}`);
console.log(`Anon RSS + Swap: ${report.metricsKb.anonRssPlusSwap} kB`);
console.log(`Graphics proxy: ${report.metricsKb.graphics ?? 'n/a'} kB`);
console.log(`Report: ${jsonPath}`);
