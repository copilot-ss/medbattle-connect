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
1. MVP (Quiz, Scores, Supabase)
2. Werbung + Premium
3. Auth
4. Multiplayer

## Tools & Setup
- Supabase CLI v2.65.5, eingeloggt
- Projekt-Ref: `uxlwbzgohgxbnhcjiimh` (verknüpft via `supabase link`)
- Expo SDK >= 50
- Supabase Free Tier
- GitHub Versionierung
