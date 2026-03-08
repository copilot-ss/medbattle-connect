Automatisierung: Kurzlebige Token + Admin-Calls

Ziel
- Vollautomatischer Ablauf, damit Codex (oder ein CI) kurzfristig Admin-Rechte erhält, ohne `service_role` in Client-Bundles zu bringen.

Voraussetzungen
- Admin API deployed und erreichbar unter `ADMIN_API_URL`.
- Secrets gesetzt in Host: `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN`, `TOKEN_SIGNING_KEY`.

Lokale Nutzung
1. Setze Umgebungsvariablen lokal (nur dev):

```powershell
$env:ADMIN_API_URL = 'http://localhost:4001'
$env:ADMIN_API_TOKEN = '...'
node tools/admin-api/automate.js data/questions.json
```

2. Script `automate.js`:
- Fordert kurzlebigen Token via `POST /v1/tokens` an (Admin-Token benötigt).
- Führt mit diesem Token scoped Aktionen wie `POST /v1/questions/upsert` aus.

CI / Codex Integration
- CI/Codex nutzt `ADMIN_API_TOKEN` serverseitig (nicht im App-Bundle).
- Schritt: CI ruft `POST /v1/tokens` und verwendet das zurückgegebene Token für sequenzielle Admin-Requests.

Sicherheit
- `ADMIN_API_TOKEN` ist mächtig: behandle wie ein Secret.
- Kurzlebige Tokens haben begrenzte Scope/Lifetime.
- Log/Monitor Token-Ausgaben und IPs, rotiere `SUPABASE_SERVICE_ROLE_KEY` bei Verdacht.
