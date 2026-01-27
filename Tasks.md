# TASKS.md - MedBattle Aufgabenliste

## Offen
- Release-Readiness: Play Store-Assets, Privacy Policy/AGB, Versionierung, Build-Nummern prüfen.

## Release-Checklist
- [ ] Play Store: Store-Assets (siehe STORE_ASSETS.md).
- [ ] Play Store: Content Rating ausfüllen.
- [x] Play Store: Privacy Policy/AGB + Support-Links hinterlegt (siehe STORE_LISTING.md).
- [x] App/Web: Datenschutz/AGB + Support-Link per ENV verdrahtet.
- [x] Versionen: App-Version + Build-Nummern für Android gesetzt.
- [ ] Supabase Auth: OAuth Redirects + Deep Links getestet (Google/Discord/E-Mail).
- [x] App: Deep-Link Schemes konfiguriert (app.json + AndroidManifest).
- [x] App: OAuth-Redirect-Config vorhanden (authConfig + authOAuth).
- [x] App: Email Confirm/Reset/Update Redirects auf Deep Links gesetzt.
- [x] App: Passwort-Reset Flow für Deep Link integriert.
- [x] Supabase RLS: Policies für alle Tabellen/Buckets geprüft (kein Service-Role-Key in App).
- [x] App: Scan für Service-Role-Key (keiner gefunden; nur SQL Grants in Migrations).
- [x] Supabase SQL: RLS für alle Tabellen in `supabase/*.sql` aktiv (keine Buckets im Repo).
- [x] Supabase SQL: Policies für alle Tabellen vorhanden (static check).
- [x] App: Keine Supabase Storage-Buckets im Code/Migrationen referenziert (static check).
- [ ] Supabase Security: Security Advisor ohne kritische Findings (HIBP nur Pro-Plan).
- [ ] Supabase Performance: Performance Advisor geprüft, notwendige Indexe vorhanden (doppelte Indexe entfernt, Advisor erneut prüfen).
- [x] Supabase SQL: Indexe für Kern-Tabellen vorhanden (static check).
- [ ] Supabase DB: SSL enforced, DB-Passwort rotiert, Backup-Status geprüft.
- [ ] Offline: Login-Recall, Offline-Quick-Play, Online-Sync getestet (teilweise via adb; Details in RELEASE_TESTS.md).
- [ ] Multiplayer: Create/Join/Resume/Abbruch getestet (teilweise via adb; Details in RELEASE_TESTS.md).
- [ ] Purchases/Ads: Energie-Flow, Rewarded Ad, Premium-Flow getestet.
- [ ] Telemetry: Crash/Telemetry aktiv (Sentry/Expo) + Alerts konfiguriert (EXPO_PUBLIC_SENTRY_DSN fehlt in `.env`).
- [x] App: Telemetry-Setup verdrahtet (initTelemetry + sentry-expo Plugin).
- [ ] Release-Build: EAS/Store Build gebaut und Smoke-Test auf Gerät.
- [x] QA: Manuelle Release-Checkliste dokumentiert (`RELEASE_TESTS.md`).

## In Arbeit
- Keine Aufgaben in Arbeit erfasst.

## Erledigt
- [x] Refactor: große Screens (Settings/Multiplayer) in kleinere Hooks/Components splitten.
- [x] DB-Refactor: Indexe für Fragen/Leaderboard + updated_at Trigger für users/questions.
- [x] Supabase Local Auth: Passwort-Policy in `supabase/config.toml` gesetzt.
- [x] Alternative Passwort-Policy im Client erzwungen (min. 12 Zeichen, Groß/Klein, Zahl, Sonderzeichen).
- [x] Offline/Connectivity UX: Status-Banner + Retry-Action (Home/Quiz) + Offline-Quick-Play.
- [x] Freunde-Präsenz: Offline/Online/Lobby Status + Lobby-Count in der Freunde-Liste.
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
- [x] Supabase CLI eingerichtet und mit Projekt `uxlwbzgohgxbnhcjiimh` verknüpft
- [x] Supabase Auth (Google OAuth)
- [x] Supabase Auth (Discord OAuth UI)
- [x] Supabase Auth (E-Mail)
- [x] Social OAuth Buttons mit Provider-Icons
- [x] Werbung (AdMob) einbauen
- [x] Premium-Modus ohne Werbung
- [x] Highscore / Rangliste
- [x] Multiplayer-Duelle (Realtime)
- [x] Android Manifest Merge Fix für AdMob (`AD_ID`)
- [x] `.easignore` zur Build-Größenreduktion
- [x] `eas.json` Kanäle (development/preview/production)
- [x] Patch für `expo-modules-core` (FeatureFlags Fallback)
- [x] Banner-Werbung entfernt; Energie-Dialog mit Kauf oder Rewarded Ad (+5 Energie).
- [x] Supabase Functions: search_path gesetzt, Security-Warnungen bereinigt.
- [x] Release: Crash/Telemetry (Sentry) integriert.
- [x] Data-Layer: Supabase-Timeouts/Fehlerhandling zentralisieren + Request-Tracking.
- [x] Offline: lokale Fragenbank erweitern + Sync beim Online-Gehen (Diff/Update-Strategie).
- [x] Performance: Start-Perf (Assets vorladen, Animationen lazy-load, Rendering reduzieren).
- [x] DB: Score-Retention (z.B. Top-N pro User) als Maintenance-Job definieren.
- [x] Multiplayer: Reconnect/Resume Flow für unterbrochene Lobbys testen und absichern.
