require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.set('trust proxy', 1);

const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });
app.use(apiLimiter);

const PORT = process.env.PORT || 4001;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;
const TOKEN_SIGNING_KEY = process.env.TOKEN_SIGNING_KEY || process.env.TOKEN_SIGNING_KEY;
const TOKEN_DEFAULT_EXP = Number(process.env.TOKEN_DEFAULT_EXP) || 300;
const ALLOW_SQL = (process.env.ALLOW_SQL === 'true');
const ALLOWED_TABLES = (process.env.ALLOWED_TABLES || 'questions,scores,users').split(',').map(s => s.trim());

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('WARN: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. The server will run but reject DB actions.');
}
if (!ADMIN_API_TOKEN) {
  console.warn('WARN: ADMIN_API_TOKEN is not set. Requests will be rejected without a token.');
}

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  if (!ADMIN_API_TOKEN) return res.status(500).json({ error: 'Server misconfigured' });
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Bearer token' });
  const token = auth.slice(7);
  // Direct admin token
  if (token === ADMIN_API_TOKEN) {
    req.isAdmin = true;
    return next();
  }

  // Short-lived JWT token
  if (!TOKEN_SIGNING_KEY) return res.status(403).json({ error: 'Invalid token' });
  try {
    const payload = jwt.verify(token, TOKEN_SIGNING_KEY);
    req.tokenPayload = payload;
    req.isAdmin = false;
    return next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

function hasScope(req, required) {
  if (req.isAdmin) return true;
  if (!req.tokenPayload || !req.tokenPayload.scope) return false;
  const scope = req.tokenPayload.scope;
  if (scope === 'all') return true;
  // allow comma-separated scopes in token
  const parts = String(scope).split(',').map(s => s.trim());
  return parts.includes(required) || parts.some(s => s.endsWith(':*') && required.startsWith(s.replace(':*', ':')));
}

app.get('/health', (req, res) => res.json({ ok: true, env: !!SUPABASE_URL }));

// Read single question
app.get('/v1/questions/:id', requireAuth, async (req, res) => {
  if (!hasScope(req, 'questions:read')) return res.status(403).json({ error: 'Insufficient scope' });
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  const id = req.params.id;
  try {
    const { data, error } = await supabase.from('questions').select('*').eq('id', id).single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Issue short-lived token (requires admin token)
app.post('/v1/tokens', requireAuth, (req, res) => {
  // Only allow issuance if caller presented the ADMIN_API_TOKEN (not a short token)
  const auth = req.headers.authorization || '';
  const bearer = auth.slice(7);
  if (bearer !== ADMIN_API_TOKEN) return res.status(403).json({ error: 'Only admin token can issue short tokens' });
  if (!TOKEN_SIGNING_KEY) return res.status(500).json({ error: 'Token signing key not configured' });

  const { expiresIn = TOKEN_DEFAULT_EXP, scope = 'all' } = req.body || {};
  const payload = { scope };
  const token = jwt.sign(payload, TOKEN_SIGNING_KEY, { expiresIn });
  console.log(`Issued short token (scope=${scope}) for expiresIn=${expiresIn}s from ${req.ip}`);
  return res.json({ token, expiresIn });
});

// Upsert questions (array)
app.post('/v1/questions/upsert', requireAuth, async (req, res) => {
  if (!hasScope(req, 'questions:write')) return res.status(403).json({ error: 'Insufficient scope' });
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Provide "questions" array in body' });
  }

  try {
    // Basic validation: ensure each item has 'id' and 'question'
    for (const q of questions) {
      if (!q || typeof q !== 'object' || !q.question) return res.status(400).json({ error: 'Each question must have a "question" field' });
    }
    const { data, error } = await supabase.from('questions').upsert(questions, { onConflict: 'id' }).select();
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Generic allowed-table operations (select/insert/update) - conservative
app.post('/v1/table', requireAuth, async (req, res) => {
  if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
  const { table, action, payload, match } = req.body;
  if (!ALLOWED_TABLES.includes(table)) return res.status(403).json({ error: 'Table not allowed' });
  // require table-level scope for non-admin callers
  if (!hasScope(req, 'tables:admin') && !hasScope(req, `${table}:write`) && action === 'insert') return res.status(403).json({ error: 'Insufficient scope for insert' });
  if (!hasScope(req, 'tables:admin') && !hasScope(req, `${table}:read`) && action === 'select') return res.status(403).json({ error: 'Insufficient scope for select' });
  if (!hasScope(req, 'tables:admin') && !hasScope(req, `${table}:write`) && action === 'update') return res.status(403).json({ error: 'Insufficient scope for update' });
  try {
    if (action === 'select') {
      const { data, error } = await supabase.from(table).select('*').match(payload || {}).limit(100);
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ data });
    } else if (action === 'insert') {
      if (!payload) return res.status(400).json({ error: 'payload required' });
      const { data, error } = await supabase.from(table).insert(payload).select();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ data });
    } else if (action === 'update') {
      if (!payload || !match) return res.status(400).json({ error: 'payload and match required' });
      const { data, error } = await supabase.from(table).update(payload).match(match).select();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ data });
    }
    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// SQL runner - disabled by default, enable via ALLOW_SQL=true
app.post('/v1/sql', requireAuth, async (req, res) => {
  if (!ALLOW_SQL) return res.status(403).json({ error: 'SQL endpoint disabled' });
  const { sql } = req.body;
  if (!sql || typeof sql !== 'string') return res.status(400).json({ error: 'sql string required' });
  try {
    // NOTE: Supabase client doesn't offer raw SQL execution via JS API for security.
    // This endpoint is intentionally left as a placeholder for a controlled migration runner.
    return res.status(501).json({ error: 'Not implemented: use CI/CLI for raw SQL' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`Admin API listening on ${PORT}`);
});
