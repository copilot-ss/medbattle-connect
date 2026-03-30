# MedQuiz

Kurzer Projektueberblick fuer die App, den aktuellen Release-Stand und die wichtigsten Arbeitswege im Repo.

## Aktueller Status
- Verteilung laeuft weiterhin ueber Google Play Closed testing.
- In Google Play ist bislang nur `versionCode 31` hochgeladen; dieser Build ist weiter nicht aktiv.
- Das aktuelle lokale Store-AAB aus dem Repo ist `versionCode 39` unter `android/app/build/outputs/bundle/release/app-release.aab`.
- Das angeschlossene Realgeraet `c2ccd135` liegt noch auf `versionCode 35`.
- Reine Supabase-Inhaltsaenderungen wie neue Online-Fragen brauchen keinen neuen App-Build. App-Code-Aenderungen dagegen schon.

## Stack
- Expo SDK `55`
- React Native `0.83.2`
- React `19`
- Supabase JS `v2`
- i18n: `i18next`, `react-i18next`, `expo-localization`

## Schnellstart
1. `npm install`
2. `.env` mit mindestens `EXPO_PUBLIC_SUPABASE_URL` und `EXPO_PUBLIC_SUPABASE_ANON_KEY` fuellen
3. Dev-Start: `npm run start`
4. Optional lokal starten: `npm run android`, `npm run web`

## OAuth / Redirects
- Im Supabase Dashboard die benoetigten Provider aktivieren.
- Fuer native Builds den Redirect `medbattle://auth/callback` erlauben.
- Fuer Dev Client zusaetzlich `exp+medbattle://auth/callback` erlauben.
- Fuer Expo-Auth-Webflows bei Bedarf auch `https://auth.expo.dev/@sjigalin/medbattle` freigeben.

## Wichtige Dateien
- Orientierung: `AGENTS.md`, `PLANNING.md`, `TASKS.md`
- Navigation: `src/AppNavigator.js`
- Supabase: `src/lib/supabaseClient.js`, `src/services/supabaseRequest.js`
- Quiz-Daten: `src/services/quizService.js`
- Hauptscreens: `src/screens/HomeScreen.js`, `src/screens/QuizScreen.js`, `src/screens/ResultScreen.js`

## Weitere Dokus
- Release-Checks: `RELEASE_TESTS.md`
- Go/No-Go Stand: `RELEASE_COMPLIANCE.md`
- Play-Submit-Ablauf: `PLAY_SUBMIT_STEPS.md`
- Play-Console-Werte: `PLAY_CONSOLE_RELEASE_GUIDE.md`
- Schema-/RPC-Hinweise: `SUPABASE_SCHEMA.md`

## Hinweise
- Keine Secrets committen; `.env` bleibt lokal.
- Fuer echte Geraete darf die Supabase-URL nicht auf `localhost` oder `127.0.0.1` zeigen.
- Das Repo ist aktuell fuer `armeabi-v7a`, `arm64-v8a` und `x86_64` konfiguriert.
