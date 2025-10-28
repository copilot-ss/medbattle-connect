@"
# 🩺 PLANNING.md — MedBattle Quiz App

## Vision
Kostenlose kompetitive Medizin-Quiz-App mit Supabase-Backend, Werbung & Premium.

## Architektur
React Native (Expo) + Supabase  
State: Zustand / AsyncStorage  
Screens: Home, Quiz, Result  
Auth & Scores über Supabase  

## Datenmodell
users(id, email, premium)  
questions(id, category, question, options, correct_answer)  
scores(id, user_id, points)

## Roadmap
1. MVP (Quiz, Scores, Supabase)  
2. Werbung + Premium  
3. Auth  
4. Multiplayer  

## Tools
Expo SDK >= 50  
Supabase Free Tier  
GitHub Versionierung
"@ | Out-File -FilePath PLANNING.md -Encoding utf8
