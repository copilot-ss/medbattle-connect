# TASKS.md - MedQuiz Aufgaben

## Aktueller Stand

- Datum: `2026-08-24`
- Der finale Produktionsupdate-Kandidat wurde erfolgreich als `1.0.4` / `versionCode 59` gebaut und verifiziert.
- Vollständiger Store-, Runtime-, AAB- und Hash-Stand wird in `docs/release/RELEASE_STATUS.md` geführt.

## Jetzt offen

- [ ] Den öffentlichen Google-Play-Haupteintrag auf die deutschen und englischen SEO-Texte aus `docs/play/STORE_LISTING.md` umstellen; der Live-Titel lautet noch `Trivia Quiz – Knowledge Duels`.
- [ ] Den finalen Kandidaten als Update in Google Play Produktion hochladen.
- [ ] Den von Google Play ausgelieferten Kandidaten auf Emulator und Realgerät installieren und die Artefaktversion verifizieren.
- [ ] OAuth-Roundtrips für Google, Discord, E-Mail-Bestätigung und Passwort-Reset end-to-end testen.
- [ ] Offline-Start, Offline-Quick-Play und späteren Online-Sync im Store-Build testen.
- [ ] Multiplayer Create, Join, Resume, Abbruch und Rematch mit mindestens zwei Konten testen.
- [ ] Rewarded Ad, Energiefluss und Premium im Store-Build testen; ausgeblendete Echtgeld-Coinpacks bestätigen.
- [ ] Play Console: Content Rating, Data Safety und Health Apps Declaration finalisieren.
- [ ] In Google Play die Developer-Website `https://medquiz-web.vercel.app/` setzen und AdMob-Verifikation für `https://medquiz-web.vercel.app/app-ads.txt` erneut anstoßen.
- [ ] Play-Submit-Service-Account in EAS hinterlegen, falls EAS Submit verwendet werden soll.

## Produktionsblocker: Sicherheit und Lizenzen

- [x] Änderungen an Coins, XP, Scores, Boosts und Belohnungen serverseitig und idempotent validiert.
- [x] Match-Antworten, Fortschritt und Punkte serverseitig geprüft und direkte sensible Match-Updates gesperrt.
- [x] Unverifizierten Google-Play-Consumable-Flow aus dem Release entfernt; Reaktivierung erst mit serverseitiger Tokenprüfung und Gutschrift-vor-Consume.
- [x] Ungeklärte Dateien unter `assets/animations/` entfernt und `LICENSES.md` auf Produktions-`GO` aktualisiert.
- [x] Transitive `image-size`-/`uuid`-Advisories kompatibel behoben; Root-`npm audit` meldet `0` Findings.

## Release-Gates

- [x] Finales AAB `1.0.4` / `versionCode 59` gebaut.
- [x] SHA-256, Größe, Signatur, Upload-Zertifikat, Bundle, targetSdk 36, ABIs und 16-KB-Ausrichtung des finalen AAB geprüft.
- [x] `npm run release:check`, TypeScript, Expo Doctor, Dependency-Check und Web-Build gegen den finalen Code-Stand bestätigt.
- [x] Premium-UI, neue Logos und responsive Home-/Shop-/Quiz-Layouts auf Emulatorgrößen `1080x2400` und `1080x1920` geprüft.
- [x] Privacy-, Terms-, Support- und Delete-Account-Seiten sind öffentlich erreichbar.
- [x] Store-Assets für Telefon sowie 7- und 10-Zoll-Tablets liegen im Repo.
- [x] `tools/admin-api` Lockfile mit `npm audit` ohne Findings geprüft.
- [ ] Store-ausgelieferten finalen Kandidaten vollständig smoke-testen.
- [ ] Alle Play-Console-Pflichtfelder final speichern und prüfen.
- [x] Secret-Rotation, serverseitige Validierung und Animationslizenzprüfung abgeschlossen.

## Jüngste Abschlüsse

- [x] Android-`versionCode` auf `59` erhöht und neues signiertes Produktions-AAB vollständig verifiziert (`2026-08-24`).
- [x] Play-Store-Icon als kanonische Quelle eingerichtet, Adaptive-/Launcher-/Splash-/Web-Icons vereinheitlicht und finalen AAB-58-Homescreen auf Android API 36 geprüft (`2026-08-24`).
- [x] Supabase-Legacy-Keys deaktiviert, neue Publishable-/Secret-Keys deployed und alte Keys live als ungültig bestätigt (`2026-08-24`).
- [x] Serverseitige, idempotente Quiz-/Match-/Shop-/Reward-Validierung deployed und mit authentifizierten Angriffs- und Replaytests bestätigt (`2026-08-24`).
- [x] Ungeklärte Animationsassets ersetzt, Dependency-Audit auf `0` Findings gebracht und AAB `1.0.4` / `versionCode 58` verifiziert (`2026-08-24`).
- [x] Expo-55-Patchstände aktualisiert, inkompatiblen Ads-Dependency-Sprung durch exaktes Pinning verhindert und alle automatisierten Release-Checks bestätigt (`2026-08-24`).
- [x] Dokumentation auf eine aktuelle Release-Quelle konsolidiert, Dateinamen case-sensitiv vereinheitlicht und alte Snapshot-Historie entfernt (`2026-08-15`).
- [x] App-weites Premium-UI mit zentraler Navy-/Violett-Spieloptik, wiederverwendbaren Hintergründen, Reward-Chips und Tab-Icons umgesetzt (`2026-08-15`).
- [x] Home-Abstände und das App-Logo-System vereinheitlicht; altes blaues Logo in App-, Android-, Web- und Store-Flächen ersetzt (`2026-08-15`).
- [x] Home-Screen füllt die verfügbare Höhe responsiv und bleibt bei kompakten Höhen nutzbar (`2026-08-15`).
- [x] Englische Play-Store-Vorstellungsgrafik auf `1024x500` aktualisiert (`2026-06-24`).

Ältere abgeschlossene Arbeit bleibt über die Git-Historie nachvollziehbar und wird hier nicht dupliziert.
