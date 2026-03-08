#!/usr/bin/env node
// Automatisches Helfer-Skript:
// 1) Fordert ein kurzlebiges Token vom Admin-API an (mit ADMIN_API_TOKEN)
// 2) Führt eine scoped Admin-Operation aus (z.B. /v1/questions/upsert)
// Usage: ADMIN_API_URL=http://localhost:4001 ADMIN_API_TOKEN=... node automate.js [questions.json]

const fs = require('fs');
const path = require('path');

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:4001';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;
const SCOPE = process.env.TOKEN_SCOPE || 'questions:write,questions:read';
const EXPIRES_IN = Number(process.env.EXPIRES_IN || 300);

if (!ADMIN_API_TOKEN) {
  console.error('ADMIN_API_TOKEN fehlt in der Umgebung.');
  process.exit(2);
}

async function requestShortToken() {
  const res = await fetch(`${ADMIN_API_URL.replace(/\/$/, '')}/v1/tokens`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${ADMIN_API_TOKEN}`,
    },
    body: JSON.stringify({ scope: SCOPE, expiresIn: EXPIRES_IN }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Token request failed: ${res.status} ${txt}`);
  }
  return res.json();
}

async function upsertQuestions(token, questions) {
  const res = await fetch(`${ADMIN_API_URL.replace(/\/$/, '')}/v1/questions/upsert`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ questions }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`Upsert failed: ${res.status} ${body}`);
  return JSON.parse(body);
}

async function main() {
  try {
    const arg = process.argv[2];
    let questions = null;
    if (arg) {
      const file = path.resolve(process.cwd(), arg);
      questions = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (!Array.isArray(questions)) {
        console.error('Die Datei muss ein Array von Fragen enthalten.');
        process.exit(3);
      }
    } else {
      questions = [
        { id: 'auto-1', question: 'Beispielfrage: Was ist 2+2?', answer: '4' },
      ];
    }

    console.log('Fordere kurzlebiges Token an...');
    const tokenRes = await requestShortToken();
    const token = tokenRes.token;
    console.log(`Token erhalten (expiresIn=${tokenRes.expiresIn}s)`);

    console.log('Führe Upsert mit Scoped-Token aus...');
    const result = await upsertQuestions(token, questions);
    console.log('Upsert Ergebnis:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Fehler:', err.message || err);
    process.exit(1);
  }
}

// Node 18+ liefert global fetch. For older node versions user muss `node-fetch` installieren.
main();
