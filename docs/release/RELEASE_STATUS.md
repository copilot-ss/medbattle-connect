# MedQuiz Release Status

Stand: `2026-08-15`

Diese Datei ist die einzige Quelle für den aktuellen Release- und Artefaktstand. README, Planung und Runbook verlinken hierher, statt eigene Gerätesnapshots zu führen.

## Entscheidung

- Closed-Test-Upload des finalen AAB 54: `BEREIT`.
- Produktionsfreigabe: `NO-GO`, bis Store-Smokes, Play-Console-Pflichtfelder und alle unten genannten Sicherheits-/Lizenzblocker abgeschlossen sind.

## Aktueller Store- und Konfigurationsstand

| Bereich | Stand |
| --- | --- |
| Finaler Closed-Test-Kandidat | `1.0.2`, Android `versionCode 54` |
| Expo SDK | `55` |
| React Native | `0.83.10` |
| React | `19.2.0` |
| Runtime-Version | `55.0.0-ui-1.0.2-20260815` |
| Update-Kanal | `production` |
| Aktuell in Google Play | `versionCode 42` / `1.0.1`, Closed Testing |

## Finales verifiziertes Closed-Test-Artefakt

- Pfad: `android/app/build/outputs/bundle/release/app-release.aab`
- SHA-256: `C4DA549270B77ED9141873194AECB4D8A6DFA9AB46566E72B858961E8C5AE11B`
- Größe: `60,650,041` Bytes
- Erstellt: `2026-08-15`
- targetSdk: `36`
- ABIs: `arm64-v8a`, `armeabi-v7a`, `x86_64`
- Native Page Alignment: `PAGE_ALIGNMENT_16K`; geprüfte `arm64-v8a`-/`x86_64`-Bibliotheken mindestens `0x4000`
- Signatur und dokumentiertes Upload-Zertifikat: geprüft und übereinstimmend
- Bundletool-Validierung: bestanden

## Bestandene technische Gates für AAB 54

- `npm run release:check`
- `npx tsc --noEmit`
- Expo Doctor `19/19`
- Expo-Dependency-Check
- Web-Build
- Android Release-Build
- Emulator-Smokes bei `1080x2400` und `1080x1920`
- Launcher, Splash und neues blau-violettes Logo visuell geprüft

## Dependency-Status

- `tools/admin-api`: `npm audit` meldet `0` Findings.
- Root-Projekt: `17` Meldungen (`10 high`, `7 moderate`) aus drei transitiven Advisory-Ketten in Expo-/Metro-/Xcode-Buildwerkzeugen rund um `image-size` und `uuid`.
- Die Meldungen betreffen die Build-Toolchain, nicht bekannten Android-Runtime-Code der App.
- Derzeit gibt es keine Expo-55-kompatible Fixversion. `npm audit` schlägt nur schädliche Downgrades auf Expo 53 / React Native 0.72 vor.
- Deshalb kein `npm audit fix --force`; stattdessen Upstream beobachten und nach einem kompatiblen Fix erneut prüfen.

## Zwingende Produktionsblocker

- [ ] Den Supabase-`service_role`-Key, der zuvor in der getrackten `.vscode/settings.json` stand, sofort rotieren und den alten Key auf Ungültigkeit prüfen.
- [ ] Alle abhängigen Deployment-/Server-Secrets mit dem neuen Key aktualisieren; keine Service-Role-Credentials in Editor-, App- oder Repo-Dateien ablegen.
- [ ] Notwendigkeit eines koordinierten Git-History-Cleanups bewerten. Einen History-Rewrite nicht nebenbei oder ohne Abstimmung durchführen.
- [ ] Coins, XP, Scores, Boosts und Belohnungen serverseitig und idempotent validieren.
- [ ] Match-Antworten, Fortschritt und Punkte serverseitig berechnen beziehungsweise prüfen und direkte sensible Match-Updates sperren.
- [ ] Google-Play-Kauftoken serverseitig und idempotent verifizieren; Consumables erst nach dauerhafter Gutschrift verbrauchen.
- [ ] Herkunft und Lizenz aller verbleibenden `assets/animations/*` nachweisen oder ungeklärte Assets ersetzen; maßgeblich ist `LICENSES.md`.

Diese Punkte blockieren den Produktionsrollout auch dann, wenn das AAB technisch valide ist und der Closed-Test-Smoke besteht.

## Offene Release-Gates

- [ ] AAB 54 in Google Play Closed Testing hochladen.
- [ ] Store-ausgelieferten finalen Kandidaten auf Emulator und Realgerät installieren und `versionCode`/`versionName` prüfen.
- [ ] Google-, Discord- und E-Mail-Auth inklusive Reset/Confirm end-to-end testen.
- [ ] Offline-Quick-Play und späteren Online-Sync testen.
- [ ] Multiplayer Create, Join, Resume, Abbruch und Rematch testen.
- [ ] Rewarded Ad, Energiefluss, Coin-IAP und Premium testen.
- [ ] Content Rating final speichern.
- [ ] Data Safety mit `docs/play/PLAY_DATA_SAFETY.md` abgleichen und final speichern.
- [ ] Health Apps Declaration final speichern.
- [ ] Developer-Website und `app-ads.txt` in Play/AdMob verifizieren.
- [ ] Play-Submit-Service-Account in EAS hinterlegen, falls EAS Submit genutzt wird.
- [ ] Toolchain-Advisories vor jedem Release erneut prüfen und bei verfügbarer Expo-55-kompatibler Version aktualisieren.

## Nächster Ablauf

1. Kompromittierten Supabase-`service_role`-Key sofort rotieren und abhängige Server-Secrets aktualisieren.
2. Das verifizierte AAB 54 manuell oder mit dem expliziten lokalen Pfad aus `PLAY_RELEASE_RUNBOOK.md` in Closed Testing hochladen.
3. Rollout abwarten, genau den von Google Play ausgelieferten Kandidaten installieren und `RELEASE_TESTS.md` vollständig abarbeiten.
4. Serverseitige Manipulationssicherheit und Animationslizenzen abschließen.
5. Erst danach und nach abgeschlossenen Play-Pflichtfeldern die Produktionsfreigabe neu bewerten.

Historische Buildstände und frühere Gerätesnapshots bleiben in Git und werden hier nicht fortgeschrieben.
