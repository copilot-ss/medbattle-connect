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
- [x] Standalone-Callback technisch auf Production Build 26 verifiziert (2026-03-10, `emulator-5554`): `medbattle://auth/callback?code=TEST` wird an `com.sjigalin.medbattle/.MainActivity` geliefert.
- [ ] Echter Provider-/Mail-Roundtrip bleibt offen: Google, Discord, E-Mail-Confirm, Passwort-Reset und E-Mail-Update wurden damit noch nicht end-to-end bestaetigt.

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

## adb Smoke (2026-03-08, Emulator)
- [x] Device connected: `emulator-5554` (Android 16 / API 36.1).
- [x] Package vorhanden: `com.sjigalin.medbattle` (versionName 1.0.1, versionCode 2).
- [x] Deep link `medbattle://auth/callback?code=TEST` -> Status ok (`DevLauncherActivity`, cold start).
- [x] Deep link `exp+medbattle://auth/callback?code=TEST` -> Status ok (`MainActivity`).
- [x] Offline toggle: `svc wifi disable` + `svc data disable` -> ping 8.8.8.8 mit 100% packet loss.
- [x] Online restore technisch verifiziert: `svc wifi/data enable`, Netz als `CONNECTED`/`VALIDATED` in `dumpsys connectivity`.
- [x] Dev-Client Runtime-Check: Debug-APK neu installiert, Metro mit `--host lan`, Start via `exp+medbattle://expo-development-client/...`; in `logcat` keine Treffer fuer `Cannot find native module 'ExpoIap'`, `ExpoTopicSubscriptionModule fehlt`, `NoClassDefFoundError` oder `ExpoAsset.downloadAsync`.
- [ ] App-interne Offline-Quick-Play/Sync und Multiplayer/Purchase weiterhin manuell zu bestaetigen.

## Device Smoke (2026-03-09, Realgeraet)
- [x] Device connected: `c2ccd135`.
- [x] App startet stabil mit Dev-Client + Metro (`adb reverse tcp:8081 tcp:8081`).
- [x] Tabs geprueft: Home, Shop, Freunde, Rangliste, Einstellungen rendern ohne Crash.
- [x] Quiz gestartet (Quick Play), Antwortflow laeuft, Exit-Confirm (`Quiz beenden?`) funktioniert.
- [x] Dev-UX Fix: Quiz-`X` in `__DEV__` nach links versetzt, damit Expo-Tools-Button das `X` nicht ueberlagert.
- [ ] Emulator bleibt aktuell intermittierend bei App-Start mit Startup-ANR (`failed to complete startup`); weitere Emulator-Diagnose optional.

## Device Smoke (2026-03-10, Emulator, Production Build 26)
- [x] EAS-AAB `7cd7ea48-fde1-4a21-867f-78a43e8b1eef` geladen und per `bundletool` als `universal.apk` auf `emulator-5554` installiert.
- [x] Installierter Stand verifiziert: `com.sjigalin.medbattle` `versionCode 26`, `versionName 1.0.1`.
- [x] App startet auf dem Emulator und `MainActivity` bleibt resumed.
- [x] Login-Screen rendert; `Als Gast fortfahren` fuehrt in den Home-Screen.
- [x] Home-Screen rendert auf dem Production-Build; `Schnelles Spiel` startet.
- [x] Erster Quiz-Start zeigt den Android-Benachrichtigungsdialog fuer `POST_NOTIFICATIONS`.
- [x] Quiz-/Result-Flow technisch erreicht: Result-/Review-Screen nach Quick-Play aufgerufen.
- [x] Deep-Link-Scheme Smoke: `adb shell am start -W -a android.intent.action.VIEW -d "medbattle://auth/callback?code=TEST"` liefert an `com.sjigalin.medbattle/.MainActivity`.
- [x] Offline-Toggle technisch geprueft: `svc wifi disable` + `svc data disable` -> `ping 8.8.8.8` mit 100% packet loss.
- [ ] Online-Restore auf dem Emulator nicht bestaetigt; `ping 8.8.8.8` blieb nach `svc wifi/data enable` ohne Antwort.
Note: Der Emulator zeigte zwischendurch `System UI isn't responding`; die App selbst blieb dabei als resumed sichtbar, daher kein sauberer Ersatz fuer den offenen Realgeraet-Smoke.

## Store Listing Links (Play Console)
- Privacy Policy: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=privacy
- AGB/Terms: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=terms
- Support: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=support
- Delete Account: https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=delete-account
- [x] Legal Function deployed public (`supabase functions deploy legal --no-verify-jwt`), Links live mit Stand `2026-03-11`.
- [x] Delete-Account Function deployed (`supabase functions deploy delete-account`), ohne Auth korrekt `401` am `2026-03-11`.

## Play Data Safety
- [ ] Data Safety Form mit `PLAY_DATA_SAFETY_DRAFT.md` abgeglichen und final in Play Console eingetragen.
- [x] Konsistenz geprueft (2026-03-09): optionales Avatar-Foto (Kamera/Galerie) + Upload nach Supabase Storage `avatars` korrekt in Draft erfasst (`src/screens/AvatarEditScreen.js`, `src/services/userService.js`).
- [x] Konsistenz geprueft (2026-03-09): Ads (AdMob Rewarded non-personalized) und In-App-Kaeufe korrekt in Draft erfasst (`src/services/adsService.native.js`, `src/screens/home/useHomeBoostActions.js`, `src/lib/inAppPurchases.js`).

## Supabase Security/Performance/DB
- Security Advisor / Inspect (2026-03-08): keine kritischen Findings.
- Performance Advisor: Index-Hinweise vorhanden (ungenutzte Indexe), kein akuter Release-Blocker.
- DB: SSL enforced, DB-Passwort rotiert, Backup-Status ok.
- [x] DB Lint (linked, 2026-03-08): keine Error-Findings mehr nach Migration-Push (`20260308153000_drop_legacy_add_friend_rpc.sql` angewendet); verbleibend nur Warnings in `generate_join_code`.
- Inspect-Report (2026-03-08): `supabase inspect report --linked` ausgefuehrt.
- Inspect-Report Hinweise: ungenutzte Indexe + "never vacuumed" fuer mehrere Tabellen (Monitoring fortsetzen, kein unmittelbarer Release-Blocker).

## Dependency Security Audit
- Command: `npm audit --omit=dev --json`
- Vor Fix (2026-03-08): `3 high`, `5 moderate`, `0 critical`.
- Nach Entfernung von `sentry-expo` (2026-03-08): `0 high`, `0 moderate`, `0 critical`.
- Recheck (2026-03-08): weiterhin `0 high`, `0 moderate`, `0 critical`.
- Recheck 2 (2026-03-08): weiterhin `0 high`, `0 moderate`, `0 critical`.
- [x] Keine offenen Findings fuer produktive Dependencies.

## Android Security Hardening
- [x] `AndroidManifest`: `allowBackup=false` gesetzt.
- [x] `AndroidManifest`: `usesCleartextTraffic=false` gesetzt.
- [x] Unnoetige Permissions entfernt/geblockt (`READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW`).
- [ ] Store-Build Smoke nach Permission-Reduktion auf realem Geraet bestaetigt.

## Datenschutz / Logging
- [x] Externer Telemetry-Provider entfernt (`sentry-expo` deinstalliert, Expo-Plugin entfernt).
- [x] Client-Error-Logs redigieren sensible Werte vor Persistenz in `client_logs`.
- [x] Redaction-Smoketest lokal bestanden (`privacySanitizer` maskiert Test-E-Mail/Test-Token/JWT -> `PASS` am 2026-03-08).
- [x] DSAR-Prozess dokumentiert (`DSAR_PROCESS.md`: Auskunft/Berichtigung/Loeschung, SLA, Identitaetspruefung, SQL-Templates).
- [ ] Redaction-Smoketest mit echtem `client_logs` DB-Eintrag verifizieren (ohne Sentry).
- [ ] DSAR-Prozess dry-run (Auskunft/Loeschung/Berichtigung) einmal komplett durchspielen und dokumentieren.

## Offline
- [x] Online Quick-Play gestartet, Fragen geladen (c2ccd135).
- [x] Netzwerk aus (wifi+data): Quick-Play laeuft weiter; Banner/Toast "Network request failed" sichtbar.
- [x] Offline Modus Hinweis im Quiz sichtbar ("Offline Modus").
- [x] Quiz im Offline-Modus bis Ergebnis durchgeklickt.
- [x] App kalt starten im Offline-Modus (2026-03-10, Production Build 26 auf `emulator-5554`): gespeicherte Gast-Session landet direkt im Home-Screen; Offline-Banner sichtbar.
- [ ] Offline Quick Play aus dem Offline-Home auf `emulator-5554` nicht belastbar per `adb input` ausloesbar; Banner meldet zwar "Quick Play bleibt verfuegbar", Start liess sich dort aber nicht sauber automatisieren.
- [ ] Wieder online: Pending Scores/Fragen-Sync verifizieren (nicht beobachtbar im UI).

## Multiplayer
- [x] Test-Setup bereit: Handy `c2ccd135` + Emulator `emulator-5554` verbunden, App auf beiden gestartet.
- [x] Dev-Server Verbindung fuer beide Clients ueber `adb reverse tcp:8081 tcp:8081` hergestellt.
- [x] Lobby erstellt (c2ccd135), Code sichtbar.
- [x] Realtime-Resilienz im Client erhoeht: Auto-Reconnect fuer `lobby_invites`/`matches` bei Channel-Fehlern mit Backoff.
- [ ] Emulator Join versucht (Gast) -> Supabase Auth: Anonymous sign-ins deaktiviert (Login/Join blockiert).
- [ ] Join per Code mit zweitem Geraet/Account.
- [ ] Starten und Synchronisation der Fragen/Antworten pruefen.
- [ ] App pausieren/foreground -> Lobby bleibt erhalten.
- [ ] Disconnect/Reconnect -> Status korrekt.

## Purchases / Ads
- Energie auf 0 bringen -> Dialog erscheint.
- [x] Rewarded Ad Request auf non-personalized gesetzt (`requestNonPersonalizedAdsOnly: true`).
- [x] IAP Runtime auf `expo-iap` migriert (Play Billing modernisiert), Consumable-Finish fuer Coin-/Boost-Kaeufe aktiv.
- [x] Expo Config Plugin `expo-iap` aktiviert (`app.json`), Shop nutzt geladene Store-Preislabels als Primary (`displayPrice`) mit Fallback.
- [x] IAP-Robustheit erhoeht (2026-03-09): `Billing client not ready` wird per Reconnect+Retry abgefangen; im letzten Shop-Smoke kein entsprechender Logcat-Warnfehler.
- [x] IAP ENV-Guard aktiv: fehlende `EXPO_PUBLIC_IAP_*` werden einmalig geloggt (Fallback in Nutzung).
- [x] Metro-Transport stabilisiert: Dev-Server auf IPv4/LAN (`expo start --host lan`) statt nur `::1`, damit `adb reverse`/DevLauncher nicht mit `unexpected end of stream` fehlschlaegt.
- [x] Expo-Dependency-Align: `expo@~55.0.5` + `expo-modules-core@55.0.14`; veralteter Patch `expo-modules-core+55.0.9.patch` entfernt.
- [x] Dev-Client Debug-Build (lokal) neu gebaut und neu installiert; Gradle listet `expo-iap` + `expo-notifications` im Build (2026-03-08).
- [x] Runtime-Check auf Emulator bestanden: keine `ExpoIap`/`expo-notifications`/`ExpoAsset` Native-Fehler nach Neustart mit aktivem Metro.
- [x] Runtime-Check auf Realgeraet (2026-03-09, `c2ccd135`): kein `Cannot find native module 'ExpoIap'` / kein `ExpoTopicSubscriptionModule fehlt` / kein `ExpoAsset.downloadAsync`-Klassenfehler nach Neustart mit aktivem Metro.
- [ ] Produkt-IDs in `.env` gegen Play-Console SKUs pruefen (`EXPO_PUBLIC_IAP_*_PRODUCT_ID`) und Store-Build neu testen.
- Rewarded Ad: Abschluss gibt +5 Energie.
- Kauf-Flow: Premium setzt Werbung aus, Energie-Dialog passt.
- [x] Consent-Nachweis (EWR) dokumentiert: Privacy-Text + Code sind konsistent (Rewarded Ads non-personalized, kein externer Telemetry-Provider).
- [ ] Consent/Ad-Stichprobe auf Realgeraet im Store-Build bestaetigen (Produktiv-ID, EWR-Netz).

## Crash Logging
- [x] Sentry nicht mehr Teil des Release-Setups.
- [x] App-seitiges Error-Logging ueber Supabase `client_logs` aktiv.
- [ ] Stichprobe: Crash provozieren und DB-Eintrag in `client_logs` bestaetigen.

## Release Build
- [x] EAS Store Build erstellt: `75e9ace1-34fc-4560-9d44-a421560aa71c` (Android, versionCode 19, `FINISHED` am 2026-02-18).
- [x] EAS Store Build erstellt: `a80f9a26-1f1a-4c1d-8aaf-3f31bd25e9c3` (Android, versionCode 25, `FINISHED` am 2026-03-07).
- [x] EAS Store Build erstellt: `7cd7ea48-fde1-4a21-867f-78a43e8b1eef` (Android, versionCode 26, `FINISHED` am 2026-03-08, ohne Sentry).
- [ ] Device-Smoke-Test auf realem Geraet mit Build `7cd7ea48-fde1-4a21-867f-78a43e8b1eef`: Start, Login, Spiel, Werbung/Purchase, Multiplayer, Logout.
- [x] Emulator-Teilsmoke fuer denselben Build dokumentiert (2026-03-10): AAB auf `emulator-5554` installiert, Start/Gast-Entry/Home/Quick-Play/Deep-Link technisch verifiziert.
- [x] EAS Credentials-Flow geprueft (`eas credentials -p android`): Submission-Account fehlt weiterhin.
- [x] EAS Credentials Detail (production): Push FCM Legacy `None`, FCM V1 Service Account `None`, Play Submit Service Account `None assigned yet`.
- [ ] Play Submit per EAS: Google Service Account JSON in EAS Credentials hinterlegen (Probe 2026-03-08: `eas submit --non-interactive` -> `Google Service Account Keys cannot be set up in --non-interactive mode`).
- Referenz: `PLAY_SUBMIT_STEPS.md` (interaktive EAS-Credentials + Submit-Ablauf).
