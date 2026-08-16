# MedQuiz Admin API

Kleiner serverseitiger Admin-Proxy für gezielte Supabase-Operationen. Er darf niemals in das App-Bundle eingebunden oder mit einem Client-Key verwechselt werden.

## Sicherheitsgrenze

- `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_API_TOKEN` und `TOKEN_SIGNING_KEY` bleiben ausschließlich serverseitig.
- Lokal gehören Secrets nur in die ignorierte `tools/admin-api/.env`.
- In Deployment und CI gehören Secrets in den Secret Store der jeweiligen Plattform.
- Keine Secrets in `.vscode`, Quellcode, Markdown, Kommandozeilenbeispiele, Logs oder Client-Bundles schreiben.
- `ALLOW_SQL` bleibt standardmäßig `false`.
- `ALLOWED_TABLES` auf die tatsächlich benötigten Tabellen begrenzen.
- Den Dienst nach Möglichkeit zusätzlich durch Netzwerkregeln oder eine weitere Authentifizierungsschicht schützen.

## Benötigte Konfiguration

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_API_TOKEN`
- `TOKEN_SIGNING_KEY`
- optional `TOKEN_DEFAULT_EXP`, Standard `300`
- optional `ALLOWED_TABLES`
- optional `ALLOW_SQL=false`
- optional `PORT`, Standard `4001`

Für Clientskripte zusätzlich:

- `ADMIN_API_URL`, lokal standardmäßig `http://localhost:4001`
- `ADMIN_API_TOKEN`

## Lokaler Start

1. `tools/admin-api/.env.example` nach `tools/admin-api/.env` kopieren.
2. Werte ausschließlich in der lokalen, ignorierten `.env` ergänzen.
3. Abhängigkeiten installieren und Dienst starten:

```powershell
Set-Location tools/admin-api
npm install
npm start
```

Health Check:

```powershell
Invoke-RestMethod http://localhost:4001/health
```

Die lokale `.env` weder ausgeben noch committen.

## Kurzlebige Tokens

`POST /v1/tokens` tauscht den Admin-Token gegen ein kurzlebiges, eingeschränktes JWT. Beispielinhalt:

```json
{
  "scope": "questions:write,questions:read",
  "expiresIn": 300
}
```

Das erhaltene Token wird anschließend als Bearer-Token für erlaubte Endpunkte wie `POST /v1/questions/upsert` verwendet. Laufzeit und Scope so klein wie möglich halten.

## Automatisierung

`automate.js` führt den Token- und Questions-Upsert-Flow aus:

```powershell
node tools/admin-api/automate.js data/questions.json
```

Der aufrufende lokale Prozess oder CI-Job muss `ADMIN_API_URL` und `ADMIN_API_TOKEN` sicher aus einer ignorierten lokalen Konfiguration beziehungsweise einem Deployment-/CI-Secret-Store erhalten. Es gibt keinen unterstützten Import aus Editor-Einstellungen oder `.vscode`.

`codex-client.js` ist ein kleines Beispiel für Token-Erzeugung und Upsert. Es nur in einer isolierten lokalen Testumgebung verwenden und niemals echte Tokens einchecken.

## Deployment

1. Dienst auf einer geeigneten serverseitigen Plattform bereitstellen.
2. Alle benötigten Werte im Secret Store der Plattform setzen.
3. Eingehenden Zugriff soweit möglich einschränken.
4. `/health` prüfen, ohne Konfigurationswerte oder Secrets zu protokollieren.
5. Kurzlebigen Token mit minimalem Scope erzeugen und einen erlaubten Testaufruf durchführen.
6. Audit-Logging und Rate-Limits überwachen.

## Rotation und Vorfälle

- `ADMIN_API_TOKEN` und `TOKEN_SIGNING_KEY` regelmäßig rotieren.
- `SUPABASE_SERVICE_ROLE_KEY` bei Verdacht auf Offenlegung sofort rotieren.
- Ausgegebene Tokens, Request-Bodies und personenbezogene Daten nicht vollständig loggen.
- Nach Änderungen an Endpunkten `ALLOWED_TABLES`, Scopes und Dokumentation erneut prüfen.
