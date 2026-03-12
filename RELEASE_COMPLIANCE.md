# RELEASE_COMPLIANCE.md - Go/No-Go Snapshot

Stand: 2026-03-11
Basis: `TASKS.md` (Release-Checklist)

## Entscheidung
- Aktuell: `NO-GO`

## Aktuelle Security Befunde
- Dependency-Scan (2026-03-11, `npm audit --omit=dev`): `0 high`, `0 moderate`, `0 critical`.
- Supabase Security / Inspect (letzter dokumentierter Check 2026-03-08): keine kritischen Findings.
- Supabase DB Lint (letzter dokumentierter Check 2026-03-08): keine Error-Findings; nur Warnings in `public.generate_join_code`.
- Recheck `supabase db lint --linked` am 2026-03-11 in dieser Umgebung blockiert: verknuepftes DB-Passwort lokal nicht mehr gueltig.
- Repo-Release-Check (2026-03-11, `npm run release:check`): nur noch `EXPO_PUBLIC_ADMOB_APP_ID_ANDROID` und `EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID` fehlen fuer einen sauberen Release-Build.
- App-Typecheck (2026-03-11, `npx tsc --noEmit`): clean, nachdem Supabase Edge Functions aus dem App-TS-Check ausgeschlossen wurden.
- Expo Dependency Check (2026-03-11, `npx expo install --check`): clean.
- Expo Doctor (2026-03-11, `npx expo-doctor`): clean; der nicht passende Non-CNG Sync-Check ist bewusst deaktiviert, weil das Projekt native Android-Dateien manuell pflegt.

## Must-Pass Gates
- [ ] Play Store Assets final (`STORE_ASSETS.md`)
- [ ] Play Store Content Rating ausgefuellt
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
- [ ] Device-Smoke-Test mit aktuellem Production-Build (`7cd7ea48-fde1-4a21-867f-78a43e8b1eef`)
- [ ] Play-Submit-Credentials in EAS vorhanden (Google Service Account JSON)

## Bereits Repo-Seitig Erfuellt
- [x] Privacy, Terms, Support und Delete-Account Links hinterlegt
- [x] App-Version und lokaler Android `versionCode` auf Release-Stand 26 angeglichen
- [x] Deep-Link Schemes + OAuth Redirect Config vorhanden
- [x] Passwort-Reset Deep Link Flow integriert
- [x] RLS, Policies und Storage-Nutzung geprueft
- [x] Android Release-Hardening: `allowBackup=false`, `usesCleartextTraffic=false`, riskante Permissions entfernt
- [x] Telemetry entfernt; Crash-Logs laufen ueber redigierte `client_logs`
- [x] Store Listing um Health-/Medical-Hinweis ergaenzt
- [x] Data-Safety-Draft auf aktuellen Konto-, Ads-, IAP- und Logging-Stand gebracht
- [x] Android Production Store-Build erfolgreich dokumentiert (`versionCode 26`)
- [x] Repo-Release-Check vorhanden (`npm run release:check` fuer Env, Signing und Android-Hardening)

## Konkrete Reihenfolge bis GO
1. In Play Console manuell abschliessen: Store Assets, Content Rating, Data Safety, Target audience / app content.
2. OAuth-, Offline-, Multiplayer- und Purchases/Ads-Flows auf echten Geraeten end-to-end testen.
3. Device-Smoke-Test auf Realgeraet mit dem aktuellen Production-Build abschliessen.
4. Google Play Submit Service Account in EAS hinterlegen.
5. Danach erst `GO`.

## Go-Kriterium
- `GO` erst dann, wenn alle Punkte unter `Must-Pass Gates` auf `[x]` stehen.
