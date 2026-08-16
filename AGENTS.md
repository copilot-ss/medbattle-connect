# AGENTS.md - MedQuiz

## Ziel

Zentrale Arbeitsanleitung für MedQuiz. Änderungen sollen gezielt, nachvollziehbar und mit möglichst wenig unnötigem Kontext erfolgen.

## Pflichtablauf

- Immer zuerst `PLANNING.md` lesen.
- Vor Änderungen `TASKS.md` auf offene Release-Blocker prüfen.
- Nur betroffene Dateien laden; große Ordner wie `node_modules`, `.expo` und `.git` nicht durchsuchen.
- Dateien in UTF-8 und mit 2 Leerzeichen Einrückung bearbeiten.
- Vor Übergabe die für die Änderung relevanten Checks ausführen.

## Wichtige Einstiege

- App-Start: `App.js`
- Navigation: `src/AppNavigator.js`, `src/navigation/MainTabs.js`
- Supabase: `src/lib/supabaseClient.js`, `src/services/supabaseRequest.js`
- Quiz: `src/services/quizService.js`, `src/screens/QuizScreen.js`
- Home und Ergebnis: `src/screens/HomeScreen.js`, `src/screens/ResultScreen.js`
- Android: `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/java/com/sjigalin/medbattle/MainApplication.kt`
- Build-Konfiguration: `app.json`, `eas.json`, `android/gradle.properties`
- Native Kompatibilität: `patches/`

## Doku-Quellen

- Produkt und Architektur: `PLANNING.md`
- Aktuelle Aufgaben: `TASKS.md`
- Release-Status: `docs/release/RELEASE_STATUS.md`
- Release-Ablauf: `docs/release/PLAY_RELEASE_RUNBOOK.md`
- Release-Tests: `docs/release/RELEASE_TESTS.md`
- Play-Inhalte: `docs/play/`

## Coding-Grundsätze

- Komponenten in PascalCase benennen.
- API-Aufrufe asynchron und mit Fehlerbehandlung ausführen.
- Keine Secrets oder hardcodierten Schlüssel einchecken.
- Supabase-Abfragen cachen oder deduplizieren, wenn sie wiederholt auftreten.
- Große Screens in fokussierte Hooks und Komponenten aufteilen.
- Die Supabase-URL in `.env` für echte Geräte nie auf `localhost` oder `127.0.0.1` setzen.
- Bestehende Nutzeränderungen im Worktree nicht überschreiben.

## Ausgabe

- Änderungen knapp zusammenfassen.
- Nur relevante Diffs oder Dateiverweise nennen; keine doppelten Codeblöcke.
- Erledigte Aufgaben in `TASKS.md` nur als kurze jüngste Abschlüsse dokumentieren.
