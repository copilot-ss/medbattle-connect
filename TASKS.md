# TASKS.md - MedQuiz Aufgaben

## Aktueller Stand

- Datum: `2026-08-15`
- Der finale Closed-Test-Kandidat wurde erfolgreich als `1.0.2` / `versionCode 54` gebaut und verifiziert.
- Vollständiger Store-, Runtime-, AAB- und Hash-Stand wird in `docs/release/RELEASE_STATUS.md` geführt.

## Jetzt offen

- [ ] Den aus der zuvor getrackten `.vscode/settings.json` kompromittierten Supabase-`service_role`-Key sofort rotieren, den alten Key auf Ungültigkeit prüfen und abhängige Server-/Deployment-Secrets aktualisieren.
- [ ] Bewerten, ob der kompromittierte Key aus der Git-Historie entfernt werden muss; History-Rewrite nur geplant und koordiniert durchführen.
- [ ] Den finalen Kandidaten in Google Play Closed Testing hochladen.
- [ ] Den von Google Play ausgelieferten Kandidaten auf Emulator und Realgerät installieren und die Artefaktversion verifizieren.
- [ ] OAuth-Roundtrips für Google, Discord, E-Mail-Bestätigung und Passwort-Reset end-to-end testen.
- [ ] Offline-Start, Offline-Quick-Play und späteren Online-Sync im Store-Build testen.
- [ ] Multiplayer Create, Join, Resume, Abbruch und Rematch mit mindestens zwei Konten testen.
- [ ] Rewarded Ad, Energiefluss, Coin-IAP und Premium im Store-Build testen.
- [ ] Play Console: Content Rating, Data Safety und Health Apps Declaration finalisieren.
- [ ] In Google Play die Developer-Website `https://medquiz-web.vercel.app/` setzen und AdMob-Verifikation für `https://medquiz-web.vercel.app/app-ads.txt` erneut anstoßen.
- [ ] Play-Submit-Service-Account in EAS hinterlegen, falls EAS Submit verwendet werden soll.

## Produktionsblocker: Sicherheit und Lizenzen

- [ ] Änderungen an Coins, XP, Scores, Boosts und Belohnungen vollständig serverseitig und idempotent validieren.
- [ ] Match-Antworten, Fortschritt und Punkte vollständig serverseitig prüfen und direkte sensible Match-Updates sperren.
- [ ] Google-Play-Kauftoken serverseitig und idempotent verifizieren; Consumables erst nach dauerhafter Gutschrift verbrauchen.
- [ ] Herkunft und Lizenz aller verbleibenden Dateien unter `assets/animations/` nachweisen oder ungeklärte Assets ersetzen; `LICENSES.md` danach auf Produktions-GO aktualisieren.
- [ ] Drei transitive Advisory-Ketten in Expo-/Metro-/Xcode-Buildwerkzeugen beobachten (`image-size`, `uuid`): aktuell `17` Root-Meldungen (`10 high`, `7 moderate`), keine Expo-55-kompatible Fixversion; kein `npm audit fix --force` und kein Downgrade auf Expo 53 / React Native 0.72.

## Release-Gates

- [x] Finales AAB `1.0.2` / `versionCode 54` gebaut.
- [x] SHA-256, Größe, Signatur, Upload-Zertifikat, Bundle, targetSdk 36, ABIs und 16-KB-Ausrichtung des finalen AAB geprüft.
- [x] `npm run release:check`, TypeScript, Expo Doctor, Dependency-Check und Web-Build gegen den finalen Code-Stand bestätigt.
- [x] Premium-UI, neue Logos und responsive Home-/Shop-/Quiz-Layouts auf Emulatorgrößen `1080x2400` und `1080x1920` geprüft.
- [x] Privacy-, Terms-, Support- und Delete-Account-Seiten sind öffentlich erreichbar.
- [x] Store-Assets für Telefon sowie 7- und 10-Zoll-Tablets liegen im Repo.
- [x] `tools/admin-api` Lockfile mit `npm audit` ohne Findings geprüft.
- [ ] Store-ausgelieferten finalen Kandidaten vollständig smoke-testen.
- [ ] Alle Play-Console-Pflichtfelder final speichern und prüfen.
- [ ] Produktion erst freigeben, wenn Secret-Rotation, serverseitige Validierung und Animationslizenzprüfung abgeschlossen sind.

## Jüngste Abschlüsse

- [x] Finales Closed-Test-AAB `1.0.2` / `versionCode 54` gebaut und mit Bundletool, Signatur sowie 16-KB-Ausrichtung verifiziert (`2026-08-15`).
- [x] Dokumentation auf eine aktuelle Release-Quelle konsolidiert, Dateinamen case-sensitiv vereinheitlicht und alte Snapshot-Historie entfernt (`2026-08-15`).
- [x] App-weites Premium-UI mit zentraler Navy-/Violett-Spieloptik, wiederverwendbaren Hintergründen, Reward-Chips und Tab-Icons umgesetzt (`2026-08-15`).
- [x] Home-Abstände und das App-Logo-System vereinheitlicht; altes blaues Logo in App-, Android-, Web- und Store-Flächen ersetzt (`2026-08-15`).
- [x] Home-Screen füllt die verfügbare Höhe responsiv und bleibt bei kompakten Höhen nutzbar (`2026-08-15`).
- [x] Englische Play-Store-Vorstellungsgrafik auf `1024x500` aktualisiert (`2026-06-24`).

Ältere abgeschlossene Arbeit bleibt über die Git-Historie nachvollziehbar und wird hier nicht dupliziert.
