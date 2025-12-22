# 🧠 AGENTS.md — MedBattle Quiz App

## 🎯 Ziel
Dies ist die zentrale Agent-Anleitung für das Projekt **MedBattle**.
Codex soll effizient arbeiten, Token sparen und nur relevante Dateien laden.

## ⚙️ Regeln
- Immer zuerst `PLANNING.md` lesen
- Vor Änderungen `TASKS.md` prüfen
- Nie große Ordner wie node_modules, .expo, .git laden
- Nur gezielte Dateien öffnen, z. B. `src/screens/QuizScreen.js`

## 🧩 Relevante Dateien
src/AppNavigator.js
src/lib/supabaseClient.js
src/services/quizService.js
src/screens/HomeScreen.js
src/screens/QuizScreen.js
src/screens/ResultScreen.js
App.js
PLANNING.md
TASKS.md

## 🧠 Prinzipien
- Wenn codex eine aufgabe selbst machen kann soll der agent das erst selbst versuchen und nicht dem user die aufgabe geben
- Max 300 Zeilen pro Chunk laden
- Nur betroffene Funktionen analysieren
- Supabase-Abfragen cachen
- UTF-8 für alle Dateien
- Keine doppelten Codeblöcke senden
- Immer nur Patch-Diffs posten
- Supabase-URL in `.env` nicht auf localhost setzen (Expo Go erreicht das nicht)

## 💾 Coding Guidelines
- 2 Spaces Einrückung
- Komponenten PascalCase
- Async + Error-Handling bei API-Calls
- Keine Hardcoded Keys
- Vermeide lange Dateien, lieber refactoren und outsourcen und eine neue erstellen

## ✅ Kurzfassung
always read PLANNING.md
check TASKS.md
load only src/ files
avoid node_modules
use UTF-8
summaries + patches only
mark finished tasks
