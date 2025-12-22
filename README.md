# MedBattle (Lovable)

Kurzsetup, damit du im Lovable-Repo sofort mit Expo und Codex starten kannst.

## Setup
1. `npm install`
2. `.env` anlegen und `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` eintragen.
3. `npm run start` (oder `npm run android` / `npm run ios` / `npm run web`).

## OAuth (Google, Discord)
- Im Supabase Dashboard unter Authentication -> Providers Google/Discord aktivieren und App-ID/Secret hinterlegen.
- Redirect-URL erlauben: deine Web-URL (z.B. `http://localhost:5173/` fuer Vite oder Expo Web).
- Danach funktionieren die Social Buttons im Auth-Screen sofort ueber Supabase OAuth.

## Wichtige Dateien
- `AGENTS.md`, `PLANNING.md`, `TASKS.md` beachten.
- Kernlogik: `src/AppNavigator.js`, `src/lib/supabaseClient.js`, `src/services/quizService.js`, Screens unter `src/screens/`.

## Hinweise
- Keine Secrets committen (`.env` ist ignoriert).
- Expo SDK ~54, React Native 0.77.0, Supabase JS v2.
- Expo Go: Supabase-URL darf nicht auf localhost/127.0.0.1 stehen, sonst schlagen Logins/Queries auf echten Geraeten fehl. Immer die gehostete Supabase-URL nutzen.
