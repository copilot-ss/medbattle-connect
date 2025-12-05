# MedBattle (Lovable)

Kurzsetup, damit du im Lovable-Repo sofort mit Expo und Codex starten kannst.

## Setup
1. `npm install`
2. `.env` aus `.env.example` anlegen und Supabase-URL/-Anon-Key eintragen.
3. `npm run start` (oder `npm run android` / `npm run ios` / `npm run web`).

## OAuth (Google, Facebook, Twitter)
- Im Supabase Dashboard unter Authentication → Providers Google/Facebook/Twitter aktivieren und App-ID/Secret hinterlegen.
- Redirect-URL erlauben: `http://localhost:5173/` (bzw. deine Prod-Domain).
- Danach funktionieren die Social Buttons im Auth-Screen sofort über Supabase OAuth.

## Wichtige Dateien
- `AGENTS.md`, `PLANNING.md`, `TASKS.md` beachten.
- Kernlogik: `src/AppNavigator.js`, `src/lib/supabaseClient.js`, `src/services/quizService.js`, Screens unter `src/screens/`.

## Nützliche Skripte
- `npm run import:questions`: Import-Skript für Fragen (passt Supabase-Keys in `.env` an).

## Hinweise
- Keine Secrets committen (`.env` ist ignoriert).
- Expo SDK ~54, React Native 0.81.5, Supabase JS v2.
