# TASKS.md - MedBattle Aufgabenliste

## Offen
- Release-Readiness: Store-Assets, Privacy Policy/AGB, Versionierung, Build-Nummern pruefen.
- Data-Layer: Supabase-Timeouts/Fehlerhandling zentralisieren + Request-Tracking.
- DB: Score-Retention (z.B. Top-N pro User) als Maintenance-Job definieren.
- Offline: lokale Fragenbank erweitern + Sync beim Online-Gehen (Diff/Update-Strategie).
- Performance: Start-Perf (Assets vorladen, Animationen lazy-load, Rendering reduzieren).
- Multiplayer: Reconnect/Resume Flow fuer unterbrochene Lobbys testen und absichern.

## Release-Checklist
- [ ] App Store: Store-Assets, Privacy Policy/AGB, Content Rating, Support-Links.
- [ ] Versionen: App-Version + Build-Nummern fuer iOS/Android gesetzt.
- [ ] Supabase Auth: OAuth Redirects + Deep Links getestet (Google/Discord/E-Mail).
- [ ] Supabase RLS: Policies fuer alle Tabellen/Buckets geprueft (kein Service-Role-Key in App).
- [ ] Supabase Security: Security Advisor ohne kritische Findings.
- [ ] Supabase Performance: Performance Advisor geprueft, notwendige Indexe vorhanden.
- [ ] Supabase DB: SSL enforced, DB-Passwort rotiert, Backup-Status geprueft.
- [ ] Offline: Login-Recall, Offline-Quick-Play, Online-Sync getestet.
- [ ] Multiplayer: Create/Join/Resume/Abbruch getestet (schnelle Wiederverbindung).
- [ ] Purchases/Ads: Energie-Flow, Rewarded Ad, Premium-Flow getestet.
- [ ] Telemetry: Crash/Telemetry aktiv (Sentry/Expo) + Alerts konfiguriert.
- [ ] Release-Build: EAS/Store Build gebaut und Smoke-Test auf Geraet.

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
