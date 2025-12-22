# AGENTS.md - MedBattle Quiz App

## Ziel
Zentrale Agent-Anleitung fuer MedBattle.
Codex soll effizient arbeiten, Token sparen und nur relevante Dateien laden.

## Regeln
- Immer zuerst `PLANNING.md` lesen
- Vor Aenderungen `TASKS.md` pruefen
- Nie grosse Ordner wie node_modules, .expo, .git laden
- Nur gezielte Dateien oeffnen (z. B. `src/screens/QuizScreen.js`)

## Relevante Dateien
src/AppNavigator.js
src/lib/supabaseClient.js
src/services/quizService.js
src/screens/HomeScreen.js
src/screens/QuizScreen.js
src/screens/ResultScreen.js
App.js
PLANNING.md
TASKS.md
android/app/src/main/AndroidManifest.xml
android/app/src/main/java/com/sjigalin/medbattle/MainApplication.kt
android/gradle.properties
eas.json
.easignore
patches/expo-modules-core+3.0.28.patch

## Prinzipien
- Wenn Codex eine Aufgabe selbst machen kann, zuerst selbst versuchen.
- Max 300 Zeilen pro Chunk laden
- Nur betroffene Funktionen analysieren
- Supabase-Abfragen cachen
- UTF-8 fuer alle Dateien
- Keine doppelten Codebloecke senden
- Immer nur Patch-Diffs posten
- Supabase-URL in `.env` nicht auf localhost setzen (Expo Go erreicht das nicht)

## Coding Guidelines
- 2 Spaces Einrueckung
- Komponenten PascalCase
- Async + Error-Handling bei API-Calls
- Keine Hardcoded Keys
- Vermeide lange Dateien; lieber refactoren und auslagern

## Kurzfassung
always read PLANNING.md
check TASKS.md
load only relevant files
avoid node_modules
use UTF-8
summaries + patches only
mark finished tasks
