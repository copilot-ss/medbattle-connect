# PLANNING.md — MedBattle Quiz App

## Vision
Kostenlose kompetitive Medizin-Quiz-App mit Supabase-Backend, Werbung und Premium-Modus.

## Architektur
- React Native (Expo)
- Supabase für Auth, Scores und Fragen
- State: Zustand / AsyncStorage
- Screens: Home, Quiz, Result

## Datenmodell
- users (id, email, premium)
- questions (id, category, question, options, correct_answer)
- scores (id, user_id, points)

## Roadmap
1. MVP (Quiz, Scores, Supabase) — erledigt
2. Werbung + Premium — erledigt
3. Auth (Google live, E-Mail aktiv) — erledigt
4. Multiplayer — erledigt

## Status-Notizen
- Google Sign-In über Supabase funktioniert
- E-Mail-Login via Supabase aktiv
- Werbung/Premium integriert
- Multiplayer-Duelle via Realtime integriert
- Expo Go: `.env` darf kein localhost/127.0.0.1 als Supabase-URL nutzen, sonst Auth/Fragen scheitern. HTTPS-Projekt-URL setzen.

## Tools & Setup
- Supabase CLI v2.65.5, eingeloggt
- Projekt-Ref: `uxlwbzgohgxbnhcjiimh` (verknüpft via `supabase link`)
- Expo SDK >= 50
- Supabase Free Tier
- GitHub Versionierung
