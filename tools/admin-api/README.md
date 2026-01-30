MedBattle Admin API
===================

Purpose
-------
Kleiner Admin-Proxy, der Codex/MCP sicheren, eingeschränkten Zugriff auf Supabase erlaubt.

Security
--------
- Auth via `ADMIN_API_TOKEN` (Bearer token) — setze ein starkes Secret und speichere es als Secret in GitHub/EAS.
- `SUPABASE_SERVICE_ROLE_KEY` wird nur auf dem Server/CI genutzt (niemals ins Repo committen).
- `ALLOWED_TABLES` begrenzt Tabellen, die der API zugänglich sind.
- `ALLOW_SQL` ist standardmäßig `false` — rohe SQL-Ausführung ist deaktiviert.

Quickstart (lokal)
------------------
1. Kopiere `.env.example` nach `.env` und fülle Werte ein (SETZE: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN`, `TOKEN_SIGNING_KEY`).
2. cd tools/admin-api && npm install
3. npm start
4. Test: curl -H "Authorization: Bearer <token>" http://localhost:4001/health

Short-lived Token flow (Codex)
-----------------------------
- Erzeuge ein kurzes Token (z.B. 60s) mit dem Admin-Token:
  curl -X POST -H "Authorization: Bearer <ADMIN_API_TOKEN>" -H "Content-Type: application/json" -d '{"expiresIn":60}' http://localhost:4001/v1/tokens
- Nutze das zurückgegebene `token` als Bearer-Token für weitere Requests (z.B. `/v1/questions/upsert`).
- Alternativ: Beispielskript `node codex-client.js` demonstriert Token-Erzeugung + Upsert.

Deploy
------
- Host als kleines Node-Service oder Serverless (z. B. Vercel, Fly, Heroku, Cloud Run).
- Lege `SUPABASE_SERVICE_ROLE_KEY` und `ADMIN_API_TOKEN` als Secrets in deiner Plattform/CI ab.

Notes
-----
- Für Admin-Migrationen und komplexe DB-Operationen nutze CI/CD (GitHub Actions) mit Service-Role-Key.
- Audit-Logging / Rate-Limits / IP-Restriktionen sollten nach Bedarf ergänzt werden.
