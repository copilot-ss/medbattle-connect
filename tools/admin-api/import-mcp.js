const fs = require('fs');
const path = require('path');

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return null;
  }
}

function extractFromValue(val, mcp) {
  if (!val || typeof val !== 'string') return null;
  const inputMatch = val.match(/\$\{input:(.+)\}/);
  if (!inputMatch) return val;
  const id = inputMatch[1];
  if (!mcp || !Array.isArray(mcp.inputs)) return null;
  const found = mcp.inputs.find(i => i.id === id);
  if (!found) return null;
  // Try common places for a value
  if (found.value) return found.value;
  if (found.default) return found.default;
  if (found.description && found.description.includes('http')) return null; // not a value
  return null;
}

function updateDotEnv(envPath, updates) {
  let content = '';
  if (fs.existsSync(envPath)) content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const map = {};
  for (const l of lines) {
    const idx = l.indexOf('=');
    if (idx > 0) map[l.slice(0, idx)] = l.slice(idx + 1);
  }
  for (const k of Object.keys(updates)) {
    map[k] = updates[k];
  }
  const out = Object.keys(map).map(k => `${k}=${map[k]}`).join('\n') + '\n';
  fs.writeFileSync(envPath, out, 'utf8');
}

(function main() {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const mcpPath = path.join(repoRoot, '.vscode', 'mcp.json');
  const envPath = path.join(__dirname, '.env');

  const mcp = readJson(mcpPath);
  if (!mcp) {
    console.error('Keine .vscode/mcp.json gefunden oder ungültig. Bitte füge SUPABASE-Keys manuell in tools/admin-api/.env ein.');
    process.exit(2);
  }

  // Find first server's env
  const servers = mcp.servers || {};
  const serverKey = Object.keys(servers)[0];
  if (!serverKey) {
    console.error('Keine MCP-Servereinträge gefunden in .vscode/mcp.json');
    process.exit(2);
  }
  const server = servers[serverKey];
  const env = server.env || {};

  const candidateUrl = extractFromValue(env.SUPABASE_URL, mcp) || env.SUPABASE_URL;
  const candidateKey = extractFromValue(env.SUPABASE_SERVICE_ROLE_KEY, mcp) || env.SUPABASE_SERVICE_ROLE_KEY;
  const candidateAdmin = env.ADMIN_API_TOKEN || null;

  const updates = {};
  if (candidateUrl && candidateUrl !== '${input:SUPABASE_URL}') updates.SUPABASE_URL = candidateUrl;
  if (candidateKey && candidateKey !== '${input:SUPABASE_SERVICE_ROLE_KEY}') updates.SUPABASE_SERVICE_ROLE_KEY = candidateKey;
  if (candidateAdmin && candidateAdmin !== '${input:ADMIN_API_TOKEN}') updates.ADMIN_API_TOKEN = candidateAdmin;

  if (Object.keys(updates).length === 0) {
    console.error('Keine konkreten Werte in mcp.json gefunden. Falls du die Werte im MCP-Dialog gespeichert hast, exportiere sie oder setze sie manuell in tools/admin-api/.env');
    process.exit(2);
  }

  updateDotEnv(envPath, updates);
  console.log('tools/admin-api/.env aktualisiert mit Werten aus .vscode/mcp.json (vorsicht: secrets).');
})();
