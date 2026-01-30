/**
 * Small demo client showing how to (A) request a short-lived token, and (B) call the admin API with it.
 * Usage: set ADMIN_API_URL and ADMIN_API_TOKEN in env or pass them inline.
 */
const fetch = require('node-fetch');

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:4001';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN || 'test-token';

async function getShortToken(expiresIn = 300) {
  const res = await fetch(`${ADMIN_API_URL}/v1/tokens`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ADMIN_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn, scope: 'questions:upsert' }),
  });
  if (!res.ok) throw new Error(`Token issuance failed: ${res.status}`);
  return res.json();
}

async function upsertQuestion(shortToken, question) {
  const res = await fetch(`${ADMIN_API_URL}/v1/questions/upsert`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${shortToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions: [question] }),
  });
  return res.json();
}

(async () => {
  try {
    const { token, expiresIn } = await getShortToken(60);
    console.log('Got short token (expiresIn):', expiresIn);
    const sample = { id: 'codex-demo-' + Date.now(), question: 'Demo question from Codex client', options: ['a','b','c'], correct: 'a' };
    const result = await upsertQuestion(token, sample);
    console.log('Upsert result:', result);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
