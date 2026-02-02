import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const LOCALES_DIR = path.join(SRC_DIR, 'i18n', 'locales');
const DE_PATH = path.join(LOCALES_DIR, 'de.json');
const EN_PATH = path.join(LOCALES_DIR, 'en.json');
const PYTHON = process.env.I18N_PYTHON || 'python';
const PROVIDER = (process.env.I18N_PROVIDER || 'argos').toLowerCase();
const ARGOS_SCRIPT = path.join(ROOT, 'scripts', 'i18n', 'translate_argos.py');

const FILE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx']);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function sortObject(obj) {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (FILE_EXTS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

function unescapeString(value) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`);
  } catch (error) {
    return value;
  }
}

function extractKeys() {
  const keys = new Set();
  const files = walk(SRC_DIR);
  const regex = /\bt\s*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/g;
  for (const file of files) {
    if (file.includes(`${path.sep}i18n${path.sep}locales${path.sep}`)) {
      continue;
    }
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(content)) !== null) {
      const rawValue = match[2];
      if (!rawValue) {
        continue;
      }
      keys.add(unescapeString(rawValue));
    }
  }
  return keys;
}

function protectParams(text) {
  const params = [];
  const protectedText = text.replace(/\{[^}]+\}/g, (value) => {
    const token = `__VAR${params.length}__`;
    params.push({ token, value });
    return token;
  });
  return { protectedText, params };
}

function restoreParams(text, params) {
  return params.reduce((result, { token, value }) => {
    return result.replace(new RegExp(token, 'g'), value);
  }, text);
}

function translateWithArgos(texts) {
  const payload = JSON.stringify({ from: 'de', to: 'en', texts });
  const result = spawnSync(PYTHON, [ARGOS_SCRIPT], {
    input: payload,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    const message = result.stderr ? result.stderr.toString().trim() : 'Argos failed';
    throw new Error(message);
  }
  return JSON.parse(result.stdout);
}

function translateMissing(keys, deDictionary) {
  if (!keys.length) {
    return {};
  }
  if (PROVIDER !== 'argos') {
    return keys.reduce((acc, key) => {
      acc[key] = deDictionary[key];
      return acc;
    }, {});
  }
  const protectedItems = keys.map((key) => protectParams(deDictionary[key] ?? key));
  const protectedTexts = protectedItems.map((item) => item.protectedText);
  const translated = translateWithArgos(protectedTexts);
  return keys.reduce((acc, key, index) => {
    acc[key] = restoreParams(translated[index] ?? deDictionary[key] ?? key, protectedItems[index].params);
    return acc;
  }, {});
}

function main() {
  fs.mkdirSync(LOCALES_DIR, { recursive: true });
  const extractedKeys = extractKeys();
  const de = readJson(DE_PATH);
  const en = readJson(EN_PATH);

  let addedToDe = 0;
  for (const key of extractedKeys) {
    if (!de[key]) {
      de[key] = key;
      addedToDe += 1;
    }
  }

  const missingInEn = Object.keys(de).filter((key) => !en[key]);
  let addedToEn = 0;

  if (missingInEn.length) {
    try {
      const translated = translateMissing(missingInEn, de);
      for (const key of missingInEn) {
        en[key] = translated[key] ?? de[key];
        addedToEn += 1;
      }
    } catch (error) {
      for (const key of missingInEn) {
        en[key] = de[key];
        addedToEn += 1;
      }
      process.stderr.write(`[i18n] Translation failed, copied keys instead. ${error}\n`);
    }
  }

  writeJson(DE_PATH, sortObject(de));
  writeJson(EN_PATH, sortObject(en));

  process.stdout.write(
    `[i18n] Sync complete. Added ${addedToDe} keys to de, ${addedToEn} keys to en. Provider=${PROVIDER}\n`
  );
}

main();
