# PLANNING.md - MedQuiz

## Ziel
Kostenlose kompetitive Medizin-Quiz-App mit Supabase-Backend, Google-/E-Mail-Auth, Rewarded Ads, Premium und Multiplayer.

## Aktueller Stand
- Fokus ist Android Release ueber Google Play Closed testing.
- Neuester hochgeladener Store-Build ist `versionCode 31` (`1.0.1`), hochgeladen am `2026-03-17`.
- Neuester lokal gebauter Store-Build ist `versionCode 39` (`1.0.1`), erstellt am `2026-03-24`.
- Dieses lokale Release-AAB entspricht dem aktuellen Repo-Stand; fuer einen echten Store-Install auf Emulator oder Realgeraet muss es jetzt in Google Play hochgeladen und ausgerollt werden.
- Das angeschlossene Realgeraet `c2ccd135` liegt noch auf `versionCode 35`; der gestartete Emulator kann lokal wieder mit `x86_64`-Builds getestet werden, fuer den Play-Store-Pfad braucht er aber den ausgerollten Store-Build.
- Dieser Build ist in Play aktuell noch nicht aktiv, solange Review/Rollout im Closed-Test-Track nicht abgeschlossen ist.
- Solange `31` inaktiv bleibt, sehen Tester weiter den zuletzt aktiven Closed-Test-Build.

## Architektur
- Runtime: Expo SDK `55`, React Native `0.83.2`, React `19`, Hermes aktiv.
- Sprache: `i18next` + `react-i18next`, Locale-Erkennung ueber `expo-localization`, App folgt der Systemsprache.
- App-Start: `App.js` initialisiert Fonts/Assets, Ads, Updates und mountet den Navigator.
- Navigation: `src/AppNavigator.js` + `src/navigation/MainTabs.js`.
- Auth/Supabase: `src/lib/supabaseClient.js`, `src/services/supabaseRequest.js`, `src/hooks/useAuthSession.js`, `src/hooks/useAuthCallbackLinking.js`.
- Quiz-Flow: `src/screens/HomeScreen.js` -> `src/screens/QuizScreen.js` / `src/screens/quiz/useQuizController.js` -> `src/screens/ResultScreen.js`.
- Quiz-Daten: `src/services/quizService.js`.
- Multiplayer: `src/services/matchService.js` + `src/screens/multiplayer/*`.
- Android native entry: `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/java/com/sjigalin/medbattle/MainApplication.kt`.

## Produktregeln
- Normales Solo-/Quick-Play-/Kategorie-Quiz hat `6` Fragen.
- Multiplayer hat standardmaessig ebenfalls `6` Fragen, kann aber in der Lobby zwischen `3` und `20` liegen.
- Rewarded Ads geben aktuell `+5` Energie.
- Coin-zu-Energie im leeren-Energie-Dialog ist auf `15 Coins pro 1 Energie` dargestellt.

## Release- und Build-Stand
- `app.json` nutzt Android `versionCode 39`, `versionName 1.0.1`.
- Expo Updates laufen ueber den `production`-Kanal mit `runtimeVersion 55.0.0`.
- Release-Builds sind mit Minify, Resource Shrinking und Hermes konfiguriert.
- Das Repo ist aktuell fuer `armeabi-v7a`, `arm64-v8a` und `x86_64` konfiguriert.
- Das letzte lokale Store-Artefakt `39` liegt unter `android/app/build/outputs/bundle/release/app-release.aab`; damit ist der aktuelle Repo-Stand fuer den naechsten Upload gebaut.

## Auth / Ads Besonderheiten
- Google-/Supabase-OAuth wurde gegen spaet ankommende Sessions gehaertet, damit der erste Login nach Neuinstallation nicht mehr vorschnell mit `Supabase nicht erreichbar (Session setzen)` fehlschlaegt.
- OAuth-Callback-URLs werden jetzt pro App-Lauf nur noch einmal verarbeitet, damit Google-Redirect und globaler Deep-Link-Listener nicht parallel dieselbe Supabase-Session setzen.
- Closed-Test-/Release-Builds koennen per `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=true` weiterhin Google-Test-Rewarded-Ads verwenden.
- Aktuell gibt es keinen veroeffentlichten EAS Update-Stand auf dem `production`-Branch, der den Store-Build ueberschreibt.

## Patches
- Aktiver Patch im Repo: `patches/react-native-gesture-handler+2.30.0.patch`.
- Zweck: Android-Kompatibilitaets-Stub fuer `ViewManagerWithGeneratedInterface` in `react-native-gesture-handler`.
- Alte Hinweise auf `expo-modules-core`-Patches sind veraltet und nicht mehr Quelle des aktuellen Runtime-Stands.

## Release-Blocker
- Closed-Test-Build `31` aktivieren und danach auf echtem Geraet gegen genau diesen Store-Build testen.
- Store-Build `36` in Google Play hochladen bzw. aktivieren, bevor der echte Play-Store-Smoke auf Emulator oder Realgeraet erfolgen kann.
- Play Console Content Rating und Data Safety final abschliessen.
- OAuth-Roundtrips, Offline-Sync, Multiplayer und Ads/IAP im Store-Build end-to-end bestaetigen.
- Google Play Submit Service Account fuer EAS Submission hinterlegen.

## Arbeitsregeln
- Standard-Track fuer Verteilung ist aktuell Closed testing, nicht Dev Build.
- Vor jeder neuen Arbeit zuerst `TASKS.md` auf offene Release-Blocker pruefen.
- Fuer konkrete Smoke-Checks und Testhistorie `RELEASE_TESTS.md` als Quelle verwenden.
