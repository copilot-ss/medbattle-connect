# TASKS.md - MedBattle Aufgabenliste

## Offen
- Release-Readiness: Play Store-Assets/Content-Rating, OAuth + Gameplay Smoke-Tests, Sentry DSN/Alerts, finaler Store-Build + Device-Smoke-Test.

## Release-Checklist
- [ ] Play Store: Store-Assets (siehe STORE_ASSETS.md).
- [ ] Play Store: Content Rating ausfÃ¼llen.
- [x] Play Store: Privacy Policy/AGB + Support-Links hinterlegt (siehe STORE_LISTING.md).
- [x] App/Web: Datenschutz/AGB + Support-Link per ENV verdrahtet.
- [x] Versionen: App-Version + Build-Nummern fÃ¼r Android gesetzt.
- [ ] Supabase Auth: OAuth Redirects + Deep Links getestet (Google/Discord/E-Mail).
- [x] App: Deep-Link Schemes konfiguriert (app.json + AndroidManifest).
- [x] App: OAuth-Redirect-Config vorhanden (authConfig + authOAuth).
- [x] App: Email Confirm/Reset/Update Redirects auf Deep Links gesetzt.
- [x] App: Passwort-Reset Flow fÃ¼r Deep Link integriert.
- [x] Supabase RLS: Policies fÃ¼r alle Tabellen/Buckets geprÃ¼ft (kein Service-Role-Key in App).
- [x] App: Scan fÃ¼r Service-Role-Key (keiner gefunden; nur SQL Grants in Migrations).
- [x] Supabase SQL: RLS fÃ¼r alle Tabellen in `supabase/*.sql` aktiv (keine Buckets im Repo).
- [x] Supabase SQL: Policies fÃ¼r alle Tabellen vorhanden (static check).
- [x] App: Keine Supabase Storage-Buckets im Code/Migrationen referenziert (static check).
- [ ] Supabase Security: Security Advisor ohne kritische Findings (HIBP nur Pro-Plan).
- [x] Supabase Performance: DB-Statistiken/Index-Nutzung geprueft (`inspect db-stats`, `inspect index-stats`), notwendige Indexe vorhanden.
- [x] Supabase SQL: Indexe fÃ¼r Kern-Tabellen vorhanden (static check).
- [x] Supabase DB: SSL enforced + Backup-Status geprueft (CLI).
- [ ] Supabase DB: DB-Passwort rotiert.
- [ ] Offline: Login-Recall, Offline-Quick-Play, Online-Sync getestet (teilweise via adb; Details in RELEASE_TESTS.md).
- [ ] Multiplayer: Create/Join/Resume/Abbruch getestet (teilweise via adb; Details in RELEASE_TESTS.md).
- [ ] Purchases/Ads: Energie-Flow, Rewarded Ad, Premium-Flow getestet.
- [ ] Telemetry: Crash/Telemetry aktiv (Sentry/Expo) + Alerts konfiguriert (EXPO_PUBLIC_SENTRY_DSN fehlt in `.env`).
- [x] App: Telemetry-Setup verdrahtet (initTelemetry + sentry-expo Plugin).
- [ ] Release-Build: EAS/Store Build gebaut und Smoke-Test auf GerÃ¤t.
- [x] QA: Manuelle Release-Checkliste dokumentiert (`RELEASE_TESTS.md`).

## In Arbeit
- Release-Build Android (EAS production) laeuft: `df9539ac-f829-4359-802b-a49b465f1568`.

## Erledigt
- [x] Shop-Balance: Coin-Preise/Rabatte neu kalibriert (mehr Progression, Bundles mit sichtbaren %-Rabatten).
- [x] Home: Coin->Energie Kaufpreis angehoben, um Shop-Balance nicht zu unterlaufen.
- [x] EAS Build-Fix: npm Peer-Resolution stabilisiert (`.npmrc` mit `legacy-peer-deps=true` + lockfile refresh).
- [x] EAS Build-Fix: abel-preset-expo ergaenzt (Bundle-Fehler behoben).
- [x] Patches auf aktuelle Versionen migriert (`expo-dev-launcher@55.0.7`, `expo-modules-core@55.0.9`, `react-native-gesture-handler@2.30.0`).
- [x] DB: Kategorien bereinigt (FuÃŸball + Polizei-Spanisch entfernt), auf 10 Home-Kategorien verteilt und auf exakt 50 Fragen pro Kategorie normalisiert.
- [x] DB: App-Kategorien auf mindestens 50 Fragen aufgefÃ¼llt (Migration `20260224120000_ensure_min_50_questions_per_app_category.sql`).
- [x] Profil: Abzeichen-Claim mit temporÃ¤rer XP/Coins-Header-Animation umgesetzt.
- [x] Kategorien: FuÃŸball-Quiz entfernt (UI, Offline-Seeds und Kategorie-Filter).
- [x] Refactor: groÃŸe Screens (Settings/Multiplayer) in kleinere Hooks/Components splitten.
- [x] DB-Refactor: Indexe fÃ¼r Fragen/Leaderboard + updated_at Trigger fÃ¼r users/questions.
- [x] Supabase Local Auth: Passwort-Policy in `supabase/config.toml` gesetzt.
- [x] Alternative Passwort-Policy im Client erzwungen (min. 12 Zeichen, GroÃŸ/Klein, Zahl, Sonderzeichen).
- [x] Offline/Connectivity UX: Status-Banner + Retry-Action (Home/Quiz) + Offline-Quick-Play.
- [x] Freunde-PrÃ¤senz: Offline/Online/Lobby Status + Lobby-Count in der Freunde-Liste.
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
- [x] Supabase CLI eingerichtet und mit Projekt `uxlwbzgohgxbnhcjiimh` verknÃ¼pft
- [x] Supabase Auth (Google OAuth)
- [x] Supabase Auth (Discord OAuth UI)
- [x] Supabase Auth (E-Mail)
- [x] Social OAuth Buttons mit Provider-Icons
- [x] Werbung (AdMob) einbauen
- [x] Premium-Modus ohne Werbung
- [x] Highscore / Rangliste
- [x] Multiplayer-Duelle (Realtime)
- [x] Android Manifest Merge Fix fÃ¼r AdMob (`AD_ID`)
- [x] `.easignore` zur Build-GrÃ¶ÃŸenreduktion
- [x] `eas.json` KanÃ¤le (development/preview/production)
- [x] Patch fÃ¼r `expo-modules-core` (FeatureFlags Fallback)
- [x] Banner-Werbung entfernt; Energie-Dialog mit Kauf oder Rewarded Ad (+5 Energie).
- [x] Supabase Functions: search_path gesetzt, Security-Warnungen bereinigt.
- [x] Release: Crash/Telemetry (Sentry) integriert.
- [x] Data-Layer: Supabase-Timeouts/Fehlerhandling zentralisieren + Request-Tracking.
- [x] Offline: lokale Fragenbank erweitern + Sync beim Online-Gehen (Diff/Update-Strategie).
- [x] Performance: Start-Perf (Assets vorladen, Animationen lazy-load, Rendering reduzieren).
- [x] DB: Score-Retention (z.B. Top-N pro User) als Maintenance-Job definieren.
- [x] Multiplayer: Reconnect/Resume Flow fÃ¼r unterbrochene Lobbys testen und absichern.



