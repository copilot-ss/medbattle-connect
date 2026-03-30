# RELEASE_COMPLIANCE.md - Go/No-Go Snapshot

Stand: 2026-03-24
Basis: `TASKS.md`, `RELEASE_TESTS.md`

## Entscheidung
- Aktuell: `NO-GO`

## Snapshot
- Neuester in Google Play hochgeladener Store-Build bleibt `versionCode 31` (`1.0.1`, Upload `2026-03-17`); dieser Build ist weiterhin nicht aktiv.
- Vorhandenes lokales Store-AAB ist `versionCode 39` vom `2026-03-24`.
- Das angeschlossene Realgeraet `c2ccd135` meldet derzeit `versionCode 35`, `versionName 1.0.1`.
- Das aktuelle Store-AAB ist frisch aus dem aktuellen Repo-Stand gebaut und enthaelt wieder `x86_64`, damit Google Play spaeter auch den Emulator bedienen kann. Offen bleiben Upload/Rollout und der echte Store-Smoke auf Emulator und Realgeraet.
- Reine Supabase-Inhaltsaenderungen wie neue Online-Fragen oder Erklaerungen sind bereits live; fuer den eigentlichen Store-/Device-Stand zaehlt aber weiterhin nur das ausgerollte App-Artefakt.

## Aktuelle Security- und Qualitaetslage
- Dependency-Scan (`npm audit --omit=dev`, zuletzt dokumentiert `2026-03-08`): `0 high`, `0 moderate`, `0 critical`.
- Supabase Security / Inspect (letzter dokumentierter Check `2026-03-08`): keine kritischen Findings.
- Supabase DB Lint (letzter erfolgreicher linked-Check `2026-03-08`): keine Error-Findings; nur Warnings in `public.generate_join_code`.
- Repo-Release-Check (`npm run release:check`, `2026-03-23`): erfolgreich.
- App-Typecheck (`npx tsc --noEmit`, `2026-03-24`): clean.
- Aktuelle Supabase-Inhalts- und RPC-Aenderungen sind remote live; fuer Store-/Device-Qualitaet entscheidend offen bleibt vor allem der frische App-Build aus dem aktuellen Repo plus Realgeraet-Smoke.

## Must-Pass Gates
- [x] Play Store Assets vorbereitet (`STORE_ASSETS.md`)
- [ ] Play Store Content Rating final in Play Console eingetragen
- [ ] Play Data Safety final in Play Console eingetragen
- [ ] OAuth Redirects + Deep Links end-to-end getestet (Google, Discord, E-Mail)
- [x] Supabase Security Advisor ohne kritische Findings
- [x] Supabase DB Lint (linked) ohne Error-Findings
- [x] DB Passwort rotiert
- [x] DSAR-Prozess dokumentiert (Auskunft, Loeschung, Berichtigung inkl. SLA)
- [x] In-App-Kontoloeschung + oeffentliche Delete-Account-URL live
- [x] Ads/Consent fuer EWR im Privacy-Text und Code-Stand konsistent dokumentiert
- [x] Dependency-Security-Check fuer produktive Pakete dokumentiert
- [ ] Offline-Flows getestet (Login-Recall, Offline-Quick-Play, Online-Sync)
- [ ] Multiplayer-Flows getestet (Create, Join, Resume, Abbruch)
- [ ] Purchases/Ads-Flow getestet
- [x] Frisches Release-Artefakt aus aktuellem Repo gebaut (Store-AAB `39`)
- [ ] Device-Smoke-Test mit genau diesem aktuellen Release-Artefakt dokumentiert
- [ ] Google Play Submit Service Account in EAS hinterlegt

## Repo-Seitig Bereits Erfuellt
- [x] Privacy, Terms, Support und Delete-Account Links hinterlegt
- [x] App-Version / Android `versionCode` auf `39` gesetzt
- [x] Deep-Link Schemes + OAuth Redirect Config vorhanden
- [x] Passwort-Reset Deep-Link-Flow integriert
- [x] RLS, Policies und Storage-Nutzung geprueft
- [x] Android Release-Hardening gesetzt (`allowBackup=false`, `usesCleartextTraffic=false`, riskante Permissions entfernt)
- [x] Telemetry entfernt; Crash-Logs laufen ueber redigierte `client_logs`
- [x] Store Listing / Data-Safety-Drafts dokumentiert
- [x] Lokales Store-AAB `39` vorhanden
- [x] Lokales Realgeraet `c2ccd135` sieht derzeit `versionCode 35`

## Konkrete Reihenfolge bis GO
1. Das vorhandene Store-AAB `39` in Google Play hochladen bzw. im Closed-Test-Track ausrollen.
2. Genau diesen Store-Build auf Emulator und Realgeraet installieren und smoke-testen: Start, Login, Quiz, Result, Offline-CTA, Ads/IAP, Logout/Reopen.
3. OAuth-, Offline-, Multiplayer- und Purchases/Ads-Flows auf echten Geraeten end-to-end dokumentieren.
4. In Play Console manuell abschliessen: Content Rating, Data Safety, App Content / Target Audience.
5. Google Play Submit Service Account in EAS hinterlegen und erst danach auf `GO` umstellen.

## Go-Kriterium
- `GO` erst dann, wenn alle Punkte unter `Must-Pass Gates` auf `[x]` stehen und der getestete Realgeraet-Stand exakt dem zu veroeffentlichenden Artefakt entspricht.
