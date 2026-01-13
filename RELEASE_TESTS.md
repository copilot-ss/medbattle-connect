# RELEASE_TESTS.md - MedBattle Release Checks

Kurze manuelle Checkliste fuer die offenen Release-Tasks.

## Supabase Auth + Deep Links
- Allowed Redirect URLs im Supabase Dashboard pruefen/ergaenzen:
  - medbattle://auth/callback (Standalone/Store Build)
  - exp+medbattle://auth/callback (Dev Client)
  - https://auth.expo.dev/@sjigalin/medbattle (Expo Go)
  - https://<web-host>/ (nur falls Web Login genutzt wird)
- Google OAuth: Login, Rueckkehr in App, Session gesetzt.
- Discord OAuth: Login, Rueckkehr in App, Session gesetzt.
- E-Mail Sign-Up: Bestaetigungs-Mail, Link oeffnet App (Deep Link), danach Login ok.
- Passwort-Reset: Link oeffnet App (Deep Link), Passwort aendern, Login ok.
- E-Mail-Update (Settings): Bestaetigungs-Link oeffnet App, neue Mail aktiv.

### Android Deep-Link Smoke (adb)
- `adb shell am start -W -a android.intent.action.VIEW -d "medbattle://auth/callback?code=TEST"`
- `adb shell am start -W -a android.intent.action.VIEW -d "exp+medbattle://auth/callback?code=TEST"`

## Store Listing Links (Play Console)
- Privacy Policy: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=privacy
- AGB/Terms: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=terms
- Support: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=support

## Supabase Security/Performance/DB
- Security Advisor: keine kritischen Findings.
- Performance Advisor: keine offenen Index-Warnungen.
- DB: SSL enforced, DB-Passwort rotiert, Backup-Status ok.

## Offline
- Online einloggen -> App beenden -> Flugmodus -> App starten:
  Session wird geladen (kein erzwungener Login).
- Offline Quick-Play: lokale Fragen laden, Spiel starten.
- Wieder online: Pending Scores/Fragen-Sync laeuft durch.

## Multiplayer
- Lobby erstellen -> Join per Code (zweites Geraet/Account).
- Resume nach App-Pause/Foreground: Lobby bleibt erhalten.
- Abbruch/Disconnect: Reconnect klappt, Status korrekt.

## Purchases / Ads
- Energie auf 0 bringen -> Dialog erscheint.
- Rewarded Ad: Abschluss gibt +5 Energie.
- Kauf-Flow: Premium setzt Werbung aus, Energie-Dialog passt.

## Telemetry
- EXPO_PUBLIC_SENTRY_DSN gesetzt (Prod).
- Test-Event erscheint im Sentry Projekt.
- Alerts im Sentry Projekt aktiv (Crash + Spike).

## Release Build
- EAS/Store Build erstellen.
- Smoke-Test auf Geraet: Start, Login, Spiel, Werbung/Purchase, Multiplayer, Logout.
