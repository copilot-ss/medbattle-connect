# MedQuiz Release Status

Stand: `2026-08-24`

Diese Datei ist die einzige Quelle für den aktuellen Release- und Artefaktstand. README, Planung und Runbook verlinken hierher, statt eigene Gerätesnapshots zu führen.

## Entscheidung

- Produktionsupdate-Upload des finalen AAB 58: `BEREIT`.
- Sicherheits- und Lizenzfreigabe: `GO` für diesen Release-Umfang.
- Öffentlicher Rollout: nach Play-Prüfung und Store-Smoke freigeben.

## Aktueller Store- und Konfigurationsstand

| Bereich | Stand |
| --- | --- |
| Finaler Produktionsupdate-Kandidat | `1.0.4`, Android `versionCode 58` |
| Expo SDK | `55` |
| React Native | `0.83.10` |
| React | `19.2.0` |
| Runtime-Version | `55.0.0-ui-1.0.4-20260824` |
| Update-Kanal | `production` |
| Aktuell in Google Play | Öffentlicher Store-Eintrag erreichbar; installierte Live-Version in der Play Console abgleichen |

## Finales verifiziertes Produktionsartefakt

- Pfad: `android/app/build/outputs/bundle/release/app-release.aab`
- SHA-256: `E6BC2D7EADF5339EF5A274C00BE6B9F46EE781B2BC583DD910648DFEED169715`
- Größe: `56,723,292` Bytes
- Erstellt: `2026-08-24`
- targetSdk: `36`
- ABIs: `arm64-v8a`, `armeabi-v7a`, `x86_64`
- Native Page Alignment: `PAGE_ALIGNMENT_16K`; geprüfte `arm64-v8a`-/`x86_64`-Bibliotheken mindestens `0x4000`
- Signatur und dokumentiertes Upload-Zertifikat: geprüft und übereinstimmend
- Bundletool-Validierung: bestanden

## Bestandene technische Gates für AAB 58

- `npm run release:check`
- `npx tsc --noEmit`
- Expo Doctor `19/19`
- Expo-Dependency-Check
- Web-Build
- Android Release-Build
- Play-Store-, Launcher-, Adaptive-, Splash- und Web-Icons aus einer kanonischen Store-Quelle erzeugt; Launcher-Darstellung auf Android API 36 geprüft
- Supabase-Schema-Lint ohne Findings
- Authentifizierte Sicherheits-Negativtests für Fortschritt, Scores, Matches, Shop und Daily Rewards
- Neuer Publishable-/Secret-Key-Pfad inklusive Kontolöschung nach Abschaltung der Legacy-Keys

## Dependency-Status

- `tools/admin-api`: `npm audit` meldet `0` Findings.
- Root-Projekt: `npm audit --omit=dev` meldet `0` Findings.
- Metro wurde innerhalb der kompatiblen `0.83.x`-Patchlinie auf `0.83.8` vereinheitlicht; die nur von Xcode genutzte transitive `uuid`-Version ist auf die reparierte Version `11.1.1` begrenzt.
- Expo Doctor `19/19`, TypeScript, Web- und Android-Release-Build bleiben mit diesen Overrides grün.

## Abgeschlossene Sicherheits- und Lizenzgates

- [x] Kompromittierte Legacy-Keys deaktiviert und alten `anon`-Key per Live-Request als ungültig bestätigt; App und Edge Function nutzen Publishable-/Secret-Keys.
- [x] Git-History bewertet: Der ungültige alte Key bleibt als historischer Nachweis enthalten; ein riskanter History-Rewrite ist nach der bestätigten Deaktivierung nicht erforderlich.
- [x] Coins, XP, Scores, Boost-Nutzung, Shop-Abbuchungen und Daily Rewards serverseitig berechnet beziehungsweise validiert und idempotent verbucht.
- [x] Match-Antworten, Fortschritt und Punkte serverseitig geprüft; gefälschte Werte und direkte Match-Updates werden abgewiesen.
- [x] Echtgeld-Coinpacks aus dem Release ausgeblendet. Vor einer späteren Reaktivierung sind Google-Play-Tokenprüfung und Gutschrift-vor-Consume zwingend.
- [x] Alle ungeklärten `assets/animations/*` entfernt und durch die dokumentierte Icon-Library ersetzt; `LICENSES.md` steht auf Copyright-`GO`.

## Offene Release-Gates

- [ ] AAB 58 als Update in Google Play Produktion hochladen.
- [ ] Store-ausgelieferten finalen Kandidaten auf Emulator und Realgerät installieren und `versionCode`/`versionName` prüfen.
- [ ] Google-, Discord- und E-Mail-Auth inklusive Reset/Confirm end-to-end testen.
- [ ] Offline-Quick-Play und späteren Online-Sync testen.
- [ ] Multiplayer Create, Join, Resume, Abbruch und Rematch testen.
- [ ] Rewarded Ad, Energiefluss und Premium testen; prüfen, dass Echtgeld-Coinpacks nicht angezeigt werden.
- [ ] Content Rating final speichern.
- [ ] Data Safety mit `docs/play/PLAY_DATA_SAFETY.md` abgleichen und final speichern.
- [ ] Health Apps Declaration final speichern.
- [ ] Developer-Website und `app-ads.txt` in Play/AdMob verifizieren.
- [ ] Play-Submit-Service-Account in EAS hinterlegen, falls EAS Submit genutzt wird.
- [ ] Dependency-Audit vor jedem Release erneut prüfen.

## Nächster Ablauf

1. Das verifizierte AAB 58 manuell oder mit dem expliziten lokalen Pfad aus `PLAY_RELEASE_RUNBOOK.md` in Produktion hochladen.
2. Rollout abwarten, genau den von Google Play ausgelieferten Kandidaten installieren und `RELEASE_TESTS.md` vollständig abarbeiten.
3. Nach abgeschlossenen Play-Pflichtfeldern die Produktionsfreigabe neu bewerten.

Historische Buildstände und frühere Gerätesnapshots bleiben in Git und werden hier nicht fortgeschrieben.
