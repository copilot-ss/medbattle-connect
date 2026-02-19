# RELEASE_COMPLIANCE.md - Go/No-Go Snapshot

Stand: 2026-02-18  
Basis: `TASKS.md` (Release-Checklist)

## Entscheidung
- Aktuell: `NO-GO`

## Must-Pass Gates
- [ ] Play Store Assets final (`STORE_ASSETS.md`)
- [ ] Play Store Content Rating ausgefuellt
- [ ] OAuth Redirects + Deep Links end-to-end getestet (Google/Discord/E-Mail)
- [ ] Supabase Security Advisor ohne kritische Findings
- [ ] DB Passwort rotiert
- [ ] Offline-Flows getestet (Login-Recall, Offline-Quick-Play, Online-Sync)
- [ ] Multiplayer Flows getestet (Create/Join/Resume/Abbruch)
- [ ] Purchases/Ads Flow getestet
- [ ] Telemetry aktiv + Alerts konfiguriert (`EXPO_PUBLIC_SENTRY_DSN`; EAS `production` Environment derzeit leer)
- [ ] Device-Smoke-Test mit aktuellem Production-Build (`75e9ace1-34fc-4560-9d44-a421560aa71c`)

## Bereits Erfuellt (laut TASKS)
- [x] Privacy/AGB/Support Links hinterlegt (Store + App/Web ENV)
- [x] App-Version + Android Build-Nummern gesetzt
- [x] Deep-Link Schemes + OAuth Redirect Config vorhanden
- [x] Passwort-Reset Deep Link Flow integriert
- [x] RLS/Policies/Indexe geprueft
- [x] QA-Checkliste dokumentiert (`RELEASE_TESTS.md`)
- [x] Externe Flaticon-Icon-URL entfernt, lokale Drittanbieter-Iconbilder durch Vector-Icons ersetzt (`LICENSES.md`)
- [x] Android Production Store-Build erfolgreich erstellt (`75e9ace1-34fc-4560-9d44-a421560aa71c`, versionCode 19, AAB)

## Konkrete Reihenfolge bis GO
1. Store-Themen abschliessen: Assets + Content Rating.
2. Telemetry sauber schalten: DSN setzen und Alert-Regeln pruefen.
3. Sicherheitsabschluss: DB Passwort rotieren + Security Advisor final checken.
4. Funktionale E2E-Tests: OAuth, Offline, Multiplayer, Purchases/Ads.
5. Device-Smoke-Test auf realem Geraet mit Build `75e9ace1-34fc-4560-9d44-a421560aa71c`.

## Go-Kriterium
- `GO` erst dann, wenn alle Punkte unter "Must-Pass Gates" auf `[x]` stehen.
