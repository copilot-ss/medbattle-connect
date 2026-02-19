# PLANNING.md - MedBattle Quiz App

## Vision
Kostenlose kompetitive Medizin-Quiz-App mit Supabase-Backend, Werbung und Premium-Modus.

## Architektur
- React Native Expo dev
- Supabase für Auth, Scores und Fragen
- State: Zustand / AsyncStorage
- Screens: Home, Quiz, Result

## Datenmodell
- users (id, email, premium)
- questions (id, category, question, options, correct_answer)
- scores (id, user_id, points)

## Roadmap
1. MVP (Quiz, Scores, Supabase) - erledigt
2. Werbung + Premium - erledigt
3. Auth (Google live, E-Mail aktiv) - erledigt
4. Multiplayer - erledigt

## Status-Notizen
- Release-Fokus: Android zuerst (User-Wunsch).
- Android Start-Crash behoben: SoLoader initialisiert mit `OpenSourceMergedSoMapping` und `expo-modules-core` patcht `ReactStylesDiffMapHelper`.
- Patch in `patches/expo-modules-core+3.0.28.patch` enthält FeatureFlags-Fallback + backingMap-Feld-Fallback.
- Lokaler Debug Build läuft auf Gerät ohne Crash (logcat crash buffer leer).
- Dev-Client Bundle-Fehler (`Unexpected token '?'`) behoben: Hermes wieder aktiviert (Bundle passt zur Engine).
- EAS Dev Build aktuell blockiert (Free-Plan Build-Limit) -> lokal bauen, bis Limit frei ist.
- Expo Go: `.env` darf kein localhost/127.0.0.1 als Supabase-URL nutzen, sonst Auth/Fragen scheitern. HTTPS-Projekt-URL setzen.
- Banner-Werbung entfernt; bei leerer Energie erscheint ein Vollbild-Dialog mit Kauf (1,99 EUR) oder Rewarded Ad (+5 Energie).
- Supabase Functions: search_path gesetzt, Security-Warnungen bereinigt.
- Leaked Password Protection (HIBP) ist im Free-Plan nicht aktivierbar (API verweigert, Pro erforderlich).

## Tools & Setup
- Supabase CLI v2.65.5, eingeloggt
- Projekt-Ref: `uxlwbzgohgxbnhcjiimh` (verknüpft via `supabase link`)
- Expo SDK 54 / React Native 0.77
- Supabase Free Tier
- GitHub Versionierung
- Dev Client ist der Standard zum Starten/Debuggen
