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

## adb Smoke (2026-02-15)
- [x] Device connected: c2ccd135
- [x] Package installed: com.sjigalin.medbattle (versionName 1.0.1, versionCode 2)
- [x] Deep link medbattle://auth/callback?code=TEST -> Status ok (DevLauncherActivity)
- [x] Deep link exp+medbattle://auth/callback?code=TEST -> Status ok (MainActivity)
- [x] Offline toggle: wifi/data disabled -> ping 8.8.8.8 fails; app launch ok
- [x] Online restore: wifi/data enabled -> ping 8.8.8.8 ok
Note: Offline Quick-Play/Sync and Multiplayer flows still need manual in-app checks.

## Store Listing Links (Play Console)
- Privacy Policy: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=privacy
- AGB/Terms: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=terms
- Support: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=support

## Supabase Security/Performance/DB
- Security Advisor: keine kritischen Findings.
- Performance Advisor: keine offenen Index-Warnungen.
- DB: SSL enforced, DB-Passwort rotiert, Backup-Status ok.

## Offline
- [x] Online Quick-Play gestartet, Fragen geladen (c2ccd135).
- [x] Netzwerk aus (wifi+data): Quick-Play laeuft weiter; Banner/Toast "Network request failed" sichtbar.
- [x] Offline Modus Hinweis im Quiz sichtbar ("Offline Modus").
- [x] Quiz im Offline-Modus bis Ergebnis durchgeklickt.
- [ ] App kalt starten im Offline-Modus (Session-Recall) - DevLauncher blockiert Offline-Start.
- [ ] Wieder online: Pending Scores/Fragen-Sync verifizieren (nicht beobachtbar im UI).

## Multiplayer
- [x] Lobby erstellt (c2ccd135), Code sichtbar.
- [ ] Emulator Join versucht (Gast) -> Supabase Auth: Anonymous sign-ins deaktiviert (Login/Join blockiert).
- [ ] Join per Code mit zweitem Geraet/Account.
- [ ] Starten und Synchronisation der Fragen/Antworten pruefen.
- [ ] App pausieren/foreground -> Lobby bleibt erhalten.
- [ ] Disconnect/Reconnect -> Status korrekt.

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
