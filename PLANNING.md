# PLANNING.md - MedQuiz

## Ziel

Kostenlose kompetitive Quiz-App mit Medizin- und Allgemeinwissenskategorien, Supabase-Backend, optionalem Login, Rewarded Ads, Premium und Multiplayer.

## Aktueller Stand

- Fokus ist das nächste Android-Produktionsupdate über Google Play.
- Der aktuelle technische Release-Kandidat ist gebaut; ausschließlich seine verifizierten Daten in `docs/release/RELEASE_STATUS.md` sind maßgeblich.
- Der vollständige, allein maßgebliche Store-, Versions-, Runtime-, Artefakt- und Hash-Stand steht in `docs/release/RELEASE_STATUS.md`.

## Architektur

- Runtime: Expo SDK `55`, React Native `0.83.10`, React `19`, Hermes.
- Sprache: `i18next`, `react-i18next` und `expo-localization`; die App folgt der Systemsprache.
- App-Start: `App.js` initialisiert Fonts, Assets, Ads und Updates und mountet den Navigator.
- Navigation: `src/AppNavigator.js`, `src/navigation/MainTabs.js`.
- Auth und Supabase: `src/lib/supabaseClient.js`, `src/services/supabaseRequest.js`, `src/hooks/useAuthSession.js`, `src/hooks/useAuthCallbackLinking.js`.
- Quiz-Flow: `src/screens/HomeScreen.js` → `src/screens/QuizScreen.js` → `src/screens/ResultScreen.js`.
- Quiz-Daten: `src/services/quizService.js`.
- Multiplayer: `src/services/matchService.js`, `src/screens/multiplayer/`.
- Native Android-Einstiege: `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/java/com/sjigalin/medbattle/MainApplication.kt`.

## Produktregeln

- Solo-, Quick-Play- und Kategoriequiz haben `6` Fragen.
- Multiplayer startet ebenfalls mit `6` Fragen; in der Lobby sind `3` bis `20` möglich.
- Rewarded Ads geben `+5` Energie.
- Eine Energie kostet in Shop und Energie-Dialog `24` Coins.
- Navigation, Belohnungen und Spiellogik werden nur bei explizitem Produktauftrag geändert.

## Release-Konfiguration

- Android-ABIs: `armeabi-v7a`, `arm64-v8a`, `x86_64`.
- Release-Builds: Hermes, Minify und Resource Shrinking aktiv.
- Aktive Native-Patches liegen unter `patches/` und müssen zur installierten Paketversion passen.
- Der Android-15-Kompatibilitätspatch zielt auf React Native `0.83.10`.

## Aktuelle Release-Blocker

- Den finalen Kandidaten als Produktionsupdate hochladen und anschließend genau den über Google Play ausgelieferten Build testen.
- Content Rating, Data Safety und Health Apps Declaration in der Play Console finalisieren.
- OAuth, Offline-Sync, Multiplayer, Rewarded Ads und IAP im Store-Build end-to-end bestätigen.
- Play-Submit-Service-Account in EAS hinterlegen, falls der Upload über EAS erfolgen soll.
- Echtgeld-Coinpacks erst nach Einrichtung einer serverseitigen Google-Play-Tokenprüfung wieder aktivieren.

## Arbeitsquellen

- Offene Arbeit: `TASKS.md`
- Release-Status: `docs/release/RELEASE_STATUS.md`
- Release-Ablauf: `docs/release/PLAY_RELEASE_RUNBOOK.md`
- Manuelle Prüfungen: `docs/release/RELEASE_TESTS.md`
