# RELEASE_TESTS.md - MedQuiz Release Checks

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
- E-Mail-Update-Flow ist aktuell kein Release-Gate mehr, weil die entsprechende Profil-UI entfernt wurde.
- [x] Standalone-Callback technisch auf Production Build 26 verifiziert (2026-03-10, `emulator-5554`): `medbattle://auth/callback?code=TEST` wird an `com.sjigalin.medbattle/.MainActivity` geliefert.
- [ ] Echter Provider-/Mail-Roundtrip bleibt offen: Google, Discord, E-Mail-Confirm und Passwort-Reset wurden damit noch nicht end-to-end bestaetigt.

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

## Device Smoke (2026-03-13, Realgeraet, EAS Build 26 vor Fix)
- [x] Device connected: `c2ccd135`.
- [x] Installierter Stand verifiziert: `com.sjigalin.medbattle` `versionCode 26`, `versionName 1.0.1`.
- [x] Cold Start per Launcher erfolgreich; `MainActivity` bleibt resumed und fokussiert.
- [x] Deep-Link-Scheme Smoke: `medbattle://auth/callback?code=TEST` liefert an `com.sjigalin.medbattle/.MainActivity`.
- [x] Deep-Link-Scheme Smoke: `exp+medbattle://auth/callback?code=TEST` liefert an `com.sjigalin.medbattle/.MainActivity`.
- [x] Online/Offline Toggle technisch verifiziert: `svc wifi disable` + `svc data disable` -> `ping 8.8.8.8` meldet `Network is unreachable`; nach Re-Enable antwortet `8.8.8.8` wieder.
- [x] Production-Build landet auf dem Home-Screen; `Schnelles Spiel` oeffnet den Quiz-Screen auf dem Realgeraet.
- [x] Screenshot-basierter Quiz-Run ohne `uiautomator dump` bis zur letzten Frage belastbar durchgeklickt; der RN-Timer bleibt dabei stabil.
- [ ] Nach der letzten Quiz-Antwort springt der Production-Build auf dem Realgeraet sofort zurueck auf den Home-Screen statt einen Result-/Review-Screen zu zeigen. Das Verhalten ist damit auch ohne `uiautomator dump` reproduzierbar und kein Dump-Artefakt.
- [ ] Zweiter Repro ohne `uiautomator`: Quick Play kann bereits mit `0.0s` / `Zeit abgelaufen!` auf `Frage 1/6` starten und springt danach direkt auf `Frage 3/6`. Gefiltertes `logcat --pid` zeigt dazu keinen offensichtlichen JS-/Native-Crash.
- [ ] Der installierte Build 26 zeigt beim Cold Start weiterhin `expo-updates`: `Remote update request not successful: "channel-name": Required.` Der Config-Fix ist erst im Code, aber noch nicht auf diesem Geraet neu gebaut/installiert.

## Release Rebuild / Verification (2026-03-13, lokal)
- [x] Quiz-/Timer-/Navigation-Fix im Code umgesetzt: stale Timer-/Answer-Callbacks invalidiert, Solo-Fragensatz pro Run eingefroren, Result-Screen per `navigation.replace(...)` und Quiz-Starts per frischer Route aufgerufen.
- [x] App-Typecheck nach dem Fix: `npx tsc --noEmit` erfolgreich.
- [x] Release-Bundle lokal reproduziert: `android/gradlew :app:createBundleReleaseJsAndAssets --stacktrace --info` erfolgreich.
- [x] Voller Android-Release-Build lokal erfolgreich: `android/gradlew assembleRelease` erzeugt `android/app/build/outputs/apk/release/app-release.apk` (`versionCode 26`, `versionName 1.0.1`).
- [x] APK-Inhalt geprueft: `aapt dump xmltree ... app-release.apk AndroidManifest.xml` zeigt `expo.modules.updates.UPDATES_CONFIGURATION_REQUEST_HEADERS_KEY` und `com.google.android.gms.ads.APPLICATION_ID` im Release-Artefakt.
- [x] Frisches lokales Release-APK auf `c2ccd135` installiert (`adb install -r`); installierter Stand erneut verifiziert als `com.sjigalin.medbattle` `versionCode 26`, `versionName 1.0.1`.
- [x] Startup-Retest mit dem frischen APK: der alte `expo-updates` Fehler `Remote update request not successful: "channel-name": Required.` taucht im Realgeraet-Logcat nicht mehr auf.
- [x] Quick Play auf dem frischen APK laeuft auf dem Realgeraet stabil von `Frage 1/6` bis zum Result-Screen; kein `1/6 -> 3/6` Sprung und kein Rueckfall auf den Home-Screen nach der letzten Antwort.
- [x] Result-Actions verifiziert: `Naechstes Quiz` startet wieder bei `Frage 1/6`, `Fertig` fuehrt zurueck in den Home-Screen.
- [x] Quiz-Exit-Flow verifiziert: `X` -> `Quiz beenden?` -> `Beenden` fuehrt zurueck in den Home-Screen.
- [x] Deep-Link Cold Start mit dem frischen APK verifiziert: `medbattle://auth/callback?...` und `exp+medbattle://auth/callback?...` liefern beide `Status: ok`, `LaunchState: COLD`, `Activity: com.sjigalin.medbattle/.MainActivity`.
- [x] Offline/Online-Flow im frischen APK verifiziert: Offline-Launch zeigt den Banner, `Online gehen` blendet den Offline-Hinweis nach Netz-Restore wieder aus.

## Closed Testing / Store Build 31 (2026-03-17)
- [x] Lokales Release-AAB gebaut: `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] Store-Artefakt verifiziert: `versionCode 31`, `versionName 1.0.1`.
- [x] AAB in Google Play Closed testing hochgeladen.
- [x] Historischer Closed-Test-Upload; Build `31` ist inzwischen durch neuere Store-Builds ueberholt.
- [x] Code-Stand fuer diesen Release-Zyklus gehaertet: OAuth-Session-Recovery nach Deep-Link/Google-Login verbessert.
- [x] Code-Stand fuer diesen Release-Zyklus gehaertet: Rewarded Ads koennen in Closed Tests mit Google-Test-Ad-IDs laufen.
- [x] Urspruengliche Aktivierungs-Notiz erledigt; aktueller Store-Teststand laeuft inzwischen ueber neuere Builds.
- [ ] Repo-Aenderung nach dem Upload: Android ist inzwischen auf `armeabi-v7a` und `arm64-v8a` reduziert; dafuer ist ein neuer Build nach `31` erforderlich.

## Local Rebuild / Store Build 32 (2026-03-19)
- [x] Lokales Release-AAB gebaut: `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] Store-Artefakt verifiziert: `versionCode 32`, `versionName 1.0.1`.
- [x] Lokaler Build nutzt weiterhin reale Android-ABIs `armeabi-v7a` und `arm64-v8a`.
- [x] Code-Stand fuer diesen Release-Zyklus gehaertet: OAuth-Callback-URL wird pro App-Lauf nur einmal verarbeitet, damit Google-Redirect und globaler Deep-Link-Listener nicht parallel dieselbe Supabase-Session setzen.
- [ ] AAB `32` in Google Play hochladen.
- [ ] Nach Upload/Verteilung von `32` auf Realgeraet pruefen: Neuinstallation, Google-Login mit bestehendem Account, Quick Play `1/6 -> Result`, Energie-Dialog, Rewarded Ad, Logout/Reopen.

## Local Rebuild / Store Build 35 (2026-03-23)
- [x] Repo-Release-Check vor dem Build erfolgreich (`npm run release:check`).
- [x] Lokales Release-AAB gebaut: `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] Store-Artefakt verifiziert: `versionCode 35`, `versionName 1.0.1`.
- [x] Lokaler Build nutzt weiterhin reale Android-ABIs `armeabi-v7a` und `arm64-v8a`.
- [ ] AAB `35` in Google Play hochladen.
- [ ] Nach Upload/Verteilung von `35` auf Realgeraet pruefen: Neuinstallation, Google-Login mit bestehendem Account, Quick Play `1/6 -> Result`, Energie-Dialog, Rewarded Ad, Logout/Reopen.

## Emulator ABI Fix / Store Build 36 (2026-03-24)
- [x] `android/gradle.properties` auf `armeabi-v7a,arm64-v8a,x86_64` erweitert, damit der Emulator wieder eine passende Native-ABI bekommt.
- [x] Frischer Debug-Build auf `emulator-5554` installiert; alter Startcrash `couldn't find DSO to load: libreactnative.so` ist danach nicht mehr reproduzierbar.
- [x] Lokales Release-AAB gebaut: `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] Store-Artefakt verifiziert: `versionCode 36`, `versionName 1.0.1`.
- [x] Release-Build erzeugt wieder `x86_64`-Native-Libs (`android/app/build/intermediates/merged_native_libs/release/.../lib/x86_64/`).
- [ ] AAB `36` in Google Play hochladen.
- [ ] Nach Upload/Rollout von `36` den Play-Store-Install auf `emulator-5554` und dem Realgeraet `c2ccd135` pruefen.

## Local Rebuild / Store Build 39 (2026-03-24)
- [x] Lokales Release-AAB gebaut: `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] Store-Artefakt verifiziert: `versionCode 39`, `versionName 1.0.1`.
- [x] Aktueller Repo-Stand ist damit als frisches Store-AAB lokal vorhanden.
- [x] ABI-Stand bleibt fuer `armeabi-v7a`, `arm64-v8a` und `x86_64` geeignet.
- [ ] AAB `39` in Google Play hochladen.
- [ ] Nach Upload/Rollout von `39` den echten Store-Build auf `emulator-5554` und `c2ccd135` smoke-testen.

## Closed Testing / Store Build 42 (2026-03-31)
- [x] Repo-Release-Check vor dem Build erfolgreich (`npm run release:check`).
- [x] Lokales Release-AAB gebaut: `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] Store-Artefakt verifiziert: `versionCode 42`, `versionName 1.0.1`.
- [x] AAB `42` in Google Play Closed testing hinterlegt.
- [x] Release-Build enthaelt weiter `armeabi-v7a`, `arm64-v8a` und `x86_64`.
- [ ] Closed-Test-Install auf dem Realgeraet `c2ccd135` auf `versionCode 42` aktualisieren und verifizieren.
- [ ] Closed-Test-Install auf `emulator-5554` pruefen.
- [ ] Gegen genau diesen Store-Build `42` testen: Google-Login, Quick Play `1/6 -> Result`, Energie-Dialog, Rewarded Ad, Coin-/IAP-Kauf und Logout/Reopen.

## Aktueller Artefakt-Stand (2026-03-31)
- [x] Das angeschlossene Realgeraet `c2ccd135` meldet aktuell `versionCode 35`, `versionName 1.0.1`.
- [x] Lokales Release-APK vorhanden: `android/app/build/outputs/apk/release/app-release.apk`.
- [x] Lokales Store-AAB vorhanden: `android/app/build/outputs/bundle/release/app-release.aab`.
- [x] Der aktuelle Repo-Stand ist als frisches Store-AAB `42` gebaut.
- [x] Dieses AAB `42` liegt jetzt im Google-Play-Closed-Test-Track.
- [ ] Der naechste belastbare Store-Smoke muss gegen den aus dem Closed Test installierten Build `42` erfolgen.

## Store Listing Links (Play Console)
- Privacy Policy: https://copilot-ss.github.io/medbattle-connect/legal-static/privacy.html
- AGB/Terms: https://copilot-ss.github.io/medbattle-connect/legal-static/terms.html
- Support: https://copilot-ss.github.io/medbattle-connect/legal-static/support.html
- Delete Account: https://copilot-ss.github.io/medbattle-connect/legal-static/delete-account.html
- [x] Static legal pages deployed via GitHub Pages (2026-04-10): privacy, terms, support, and delete-account are live as standalone HTML pages under `legal-static/`.
- [x] Legacy Delete-Account API bleibt deployed (`supabase functions deploy delete-account`), ist aber nicht die Play-Console-URL; fuer Google Play zaehlt die statische oeffentliche Delete-Account-Seite.

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
- [x] Coin-Produkt-IDs in `.env` gegen die aktuellen Play-Console-SKUs abgeglichen (2026-03-31): `buy_coins500`, `buy_coins1300`, `buy_coins2700`, `buy_coins7000`, `buy_coins1800`.
- [ ] Store-Build mit diesen neuen Coin-SKUs neu bauen, hochladen und im Closed Test erneut pruefen.
- Rewarded Ad: Abschluss gibt +2 Energie.
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
