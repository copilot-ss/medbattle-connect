# TASKS.md - MedBattle Aufgabenliste

## Offen
- Release-Readiness: Play Store-Assets, Privacy Policy/AGB, Versionierung, Build-Nummern pruefen.

## Release-Checklist
- [ ] Play Store: Store-Assets (siehe STORE_ASSETS.md).
- [ ] Play Store: Content Rating ausfuellen.
- [x] Play Store: Privacy Policy/AGB + Support-Links hinterlegt (siehe STORE_LISTING.md).
- [x] App/Web: Datenschutz/AGB + Support-Link per ENV verdrahtet.
- [x] Versionen: App-Version + Build-Nummern fuer Android gesetzt.
- [ ] Supabase Auth: OAuth Redirects + Deep Links getestet (Google/Discord/E-Mail).
- [x] App: Deep-Link Schemes konfiguriert (app.json + AndroidManifest).
- [x] App: OAuth-Redirect-Config vorhanden (authConfig + authOAuth).
- [x] App: Email Confirm/Reset/Update Redirects auf Deep Links gesetzt.
- [x] App: Passwort-Reset Flow fuer Deep Link integriert.
- [x] Supabase RLS: Policies fuer alle Tabellen/Buckets geprueft (kein Service-Role-Key in App).
- [x] App: Scan fuer Service-Role-Key (keiner gefunden; nur SQL Grants in Migrations).
- [x] Supabase SQL: RLS fuer alle Tabellen in `supabase/*.sql` aktiv (keine Buckets im Repo).
- [x] Supabase SQL: Policies fuer alle Tabellen vorhanden (static check).
- [x] App: Keine Supabase Storage-Buckets im Code/Migrationen referenziert (static check).
- [ ] Supabase Security: Security Advisor ohne kritische Findings (HIBP nur Pro-Plan).
- [ ] Supabase Performance: Performance Advisor geprueft, notwendige Indexe vorhanden (doppelte Indexe entfernt, Advisor erneut pruefen).
- [x] Supabase SQL: Indexe fuer Kern-Tabellen vorhanden (static check).
- [ ] Supabase DB: SSL enforced, DB-Passwort rotiert, Backup-Status geprueft.
- [ ] Offline: Login-Recall, Offline-Quick-Play, Online-Sync getestet (teilweise via adb; Details in RELEASE_TESTS.md).
- [ ] Multiplayer: Create/Join/Resume/Abbruch getestet (teilweise via adb; Details in RELEASE_TESTS.md).
- [ ] Purchases/Ads: Energie-Flow, Rewarded Ad, Premium-Flow getestet.
- [ ] Telemetry: Crash/Telemetry aktiv (Sentry/Expo) + Alerts konfiguriert (EXPO_PUBLIC_SENTRY_DSN fehlt in `.env`).
- [x] App: Telemetry-Setup verdrahtet (initTelemetry + sentry-expo Plugin).
- [ ] Release-Build: EAS/Store Build gebaut und Smoke-Test auf Geraet.
- [x] QA: Manuelle Release-Checkliste dokumentiert (`RELEASE_TESTS.md`).

## In Arbeit
- Keine Aufgaben in Arbeit erfasst.

## Erledigt
- [x] Refactor: grosse Screens (Settings/Multiplayer) in kleinere Hooks/Components splitten.
- [x] DB-Refactor: Indexe fuer Fragen/Leaderboard + updated_at Trigger fuer users/questions.
- [x] Supabase Local Auth: Passwort-Policy in `supabase/config.toml` gesetzt.
- [x] Alternative Passwort-Policy im Client erzwungen (min. 12 Zeichen, Gross/Klein, Zahl, Sonderzeichen).
- [x] Offline/Connectivity UX: Status-Banner + Retry-Action (Home/Quiz) + Offline-Quick-Play.
- [x] Freunde-Praesenz: Offline/Online/Lobby Status + Lobby-Count in der Freunde-Liste.
- [x] Android Debug Build lokal gebaut (SoLoader MergedSoMapping).
- [x] APK installiert und Start verifiziert (kein Crash/White-Screen).
- [x] Patch `expo-modules-core`: FeatureFlags-Fallback + backingMap-Feld-Fallback.
- [x] Hermes wieder aktiviert, Dev-Client Bundle-Fehler behoben.
- [x] Repo-Cleanup: Credentials/Keystores entfernt und in `.gitignore` aufgenommen.
- [x] Encoding-Fixes: kaputte Zeichen korrigiert, BOMs entfernt, ASCII vereinheitlicht.
- [x] Entferntes Script `import:questions` (fehlte im Repo) und README angepasst.
- [x] Grundstruktur React Native + Expo
- [x] Supabase Verbindung
- [x] Quiz mit Fragen und Ergebnis
- [x] Supabase CLI eingerichtet und mit Projekt `uxlwbzgohgxbnhcjiimh` verknuepft
- [x] Supabase Auth (Google OAuth)
- [x] Supabase Auth (Discord OAuth UI)
- [x] Supabase Auth (E-Mail)
- [x] Social OAuth Buttons mit Provider-Icons
- [x] Werbung (AdMob) einbauen
- [x] Premium-Modus ohne Werbung
- [x] Highscore / Rangliste
- [x] Multiplayer-Duelle (Realtime)
- [x] Android Manifest Merge Fix fuer AdMob (`AD_ID`)
- [x] `.easignore` zur Build-Groessenreduktion
- [x] `eas.json` Kanaele (development/preview/production)
- [x] Patch fuer `expo-modules-core` (FeatureFlags Fallback)
- [x] Banner-Werbung entfernt; Energie-Dialog mit Kauf oder Rewarded Ad (+5 Energie).
- [x] Supabase Functions: search_path gesetzt, Security-Warnungen bereinigt.
- [x] Release: Crash/Telemetry (Sentry) integriert.
- [x] Data-Layer: Supabase-Timeouts/Fehlerhandling zentralisieren + Request-Tracking.
- [x] Offline: lokale Fragenbank erweitern + Sync beim Online-Gehen (Diff/Update-Strategie).
- [x] Performance: Start-Perf (Assets vorladen, Animationen lazy-load, Rendering reduzieren).
- [x] DB: Score-Retention (z.B. Top-N pro User) als Maintenance-Job definieren.
- [x] Multiplayer: Reconnect/Resume Flow fuer unterbrochene Lobbys testen und absichern.
