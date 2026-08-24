# MedQuiz

MedQuiz ist eine zweisprachige Quiz-App für Android mit Medizin- und Allgemeinwissenskategorien, Solo- und Multiplayer-Runden, Fortschritt, Rewarded Ads und optionalen In-App-Käufen.

## Aktueller Release

- Expo SDK `55`, React Native `0.83.10`, React `19`
- Der aktuelle Store-Stand, lokale Artefaktdaten, Hash und offene Gates stehen ausschließlich in `docs/release/RELEASE_STATUS.md`.
- Nach Codeänderungen gilt ein vorhandenes AAB erst wieder als Release-Kandidat, wenn es neu gebaut und vollständig verifiziert wurde.

## Schnellstart

1. `npm install`
2. `.env` mindestens mit `EXPO_PUBLIC_SUPABASE_URL` und `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` befüllen.
3. Entwicklung mit `npm run start` starten.
4. Optional `npm run android` oder `npm run web` verwenden.

Für echte Geräte darf die Supabase-URL nicht auf `localhost` oder `127.0.0.1` zeigen. Secrets und lokale Signing-Dateien werden nicht eingecheckt.

## Stack

- Expo SDK `55`, React Native `0.83.10`, React `19`, Hermes
- React Navigation `7`
- Supabase JS `2`
- `i18next`, `react-i18next`, `expo-localization`
- AdMob Rewarded Ads und `expo-iap`

## Wichtige Dateien

- Agent-Anleitung: `AGENTS.md`
- Produkt und Architektur: `PLANNING.md`
- Aktuelle Aufgaben: `TASKS.md`
- Navigation: `src/AppNavigator.js`
- Supabase: `src/lib/supabaseClient.js`, `src/services/supabaseRequest.js`
- Quiz-Daten: `src/services/quizService.js`
- Hauptscreens: `src/screens/HomeScreen.js`, `src/screens/QuizScreen.js`, `src/screens/ResultScreen.js`

## Dokumentation

- Release-Status: `docs/release/RELEASE_STATUS.md`
- Play-Release-Runbook: `docs/release/PLAY_RELEASE_RUNBOOK.md`
- Release-Tests: `docs/release/RELEASE_TESTS.md`
- Store Listing und Assets: `docs/play/STORE_LISTING.md`
- App Content und Content Rating: `docs/play/PLAY_APP_CONTENT.md`
- Data Safety: `docs/play/PLAY_DATA_SAFETY.md`
- DSAR-Prozess: `docs/legal/DSAR_PROCESS.md`
- Lizenzen und Attribution: `LICENSES.md`
- Supabase-Schemahinweise: `SUPABASE_SCHEMA.md`

## OAuth-Redirects

- Native App: `medbattle://auth/callback`
- Dev Client: `exp+medbattle://auth/callback`
- Expo-Webflow bei Bedarf: `https://auth.expo.dev/@sjigalin/medbattle`

Das Repo baut Android für `armeabi-v7a`, `arm64-v8a` und `x86_64`.
