# MedQuiz Release Tests

Stand: `2026-08-15`

Diese Checkliste gilt für den aktuellen Release-Kandidaten aus `RELEASE_STATUS.md`. Historische Testläufe bleiben in Git.

## Artefaktidentität

- [x] Finales AAB `1.0.2` / `versionCode 54` gebaut.
- [x] AAB-Pfad, Runtime, SHA-256 `C4DA549270B77ED9141873194AECB4D8A6DFA9AB46566E72B858961E8C5AE11B` und Größe `60,650,041` Bytes gegen `RELEASE_STATUS.md` geprüft.
- [x] Bundletool-Validierung, targetSdk 36, ABIs, Upload-Zertifikat und `PAGE_ALIGNMENT_16K` gegen den finalen Kandidaten geprüft.
- [ ] Nach dem Upload die in Play angezeigte Version mit diesen Werten abgleichen.
- [ ] Auf jedem Testgerät die installierte Paketversion vor dem Smoke dokumentieren.

## Automatisierte Checks

- [x] `npm run release:check`
- [x] `npx tsc --noEmit`
- [x] Expo Doctor
- [x] Expo-Dependency-Check
- [x] Web-Build
- [x] Android Release-Build

## Installation und Start

- [ ] Finalen Kandidaten über den Google-Play-Closed-Test-Link auf einem Realgerät installieren.
- [ ] Finalen Kandidaten über Google Play auf einem kompatiblen Emulator installieren.
- [ ] Cold Start, Warm Start und App-Resume ohne Crash, ANR oder White Screen.
- [ ] Launcher-Icon, Splash und neues blau-violettes Logo prüfen.
- [ ] Deutsch und Englisch mit normaler sowie größerer Systemschrift prüfen.

## Auth und Konto

- [ ] Gastmodus starten und später in ein neues Konto übernehmen.
- [ ] Google-Login mit bestehendem Konto nach Neuinstallation.
- [ ] Discord-Login.
- [ ] E-Mail-Registrierung und Bestätigung.
- [ ] Passwort-Reset über `medbattle://auth/callback`.
- [ ] Logout und erneuter Start ohne falsche oder fremde Sitzungsdaten.
- [ ] In-App-Kontolöschung und öffentliche Delete-Account-Seite stichprobenartig prüfen.

## Kernspiel und Layout

- [ ] Quick Play vollständig von Frage `1/6` bis Ergebnis spielen.
- [ ] Kategoriequiz aus Medizin und einer Allgemeinwissenskategorie spielen.
- [ ] Bildfrage sowie Frage ohne Bild prüfen.
- [ ] Ergebnis, Review, „Nächstes Quiz“ und „Fertig“ prüfen.
- [ ] Home mit und ohne aktive Lobby prüfen; kein abgeschnittener CTA oder unnatürlicher Leerblock.
- [ ] Shop, Kategorien, Quiz und Bottom Navigation auf kleinem Telefon und Tablet prüfen.

## Offline

- [ ] Mit gespeicherter Session offline starten.
- [ ] Offline-Quick-Play vollständig spielen.
- [ ] Wieder online gehen und ausstehenden Fortschritt synchronisieren.
- [ ] Fehler- und Retry-Zustände ohne Endlosschleife prüfen.

## Multiplayer

- [ ] Lobby erstellen und per Code mit einem zweiten Konto beitreten.
- [ ] Drei oder mehr Teilnehmer stichprobenartig prüfen.
- [ ] Quiz starten und Antworten, Punkte sowie Abschluss synchronisieren.
- [ ] App pausieren und Lobby/Match fortsetzen.
- [ ] Disconnect/Reconnect, Abbruch und Rückkehr zur Lobby prüfen.
- [ ] Rematch starten und beendete Teilnehmerzustände korrekt zurücksetzen.

## Ads und Käufe

- [ ] Rewarded Ad mit produktiver Ad-Unit auf einem freigegebenen Testgerät laden und abschließen.
- [ ] Exakt `+5` Energie gutschreiben; Abbruch und Ladefehler ohne Endlosschleife prüfen.
- [ ] Coin-Paket kaufen und Preis/SKU/Gutschrift prüfen.
- [ ] Premium-Flow prüfen.
- [ ] Bereits bearbeitete oder ausstehende Käufe beim Neustart korrekt behandeln.
- [ ] `app-ads.txt` und Developer-Website in AdMob als verifiziert prüfen.

## Play Console und Betrieb

- [ ] Store Listing und Assets je Locale kontrollieren.
- [ ] Content Rating final speichern.
- [ ] Data Safety mit `../play/PLAY_DATA_SAFETY.md` abgleichen und final speichern.
- [ ] Health Apps Declaration final speichern.
- [ ] Abuse-Reports an `medbattle1@gmail.com` operativ empfangen und bearbeiten können.
- [ ] Redigierten Testeintrag in `client_logs` prüfen.
- [ ] DSAR-Dry-Run für Auskunft, Berichtigung und Löschung durchführen.

## Freigabe

Produktionsfreigabe erst erteilen, wenn alle für den Release relevanten Punkte abgeschlossen sind und der getestete Store-Build exakt dem Artefakt in `RELEASE_STATUS.md` entspricht.
