# LICENSES.md - Third-Party Licenses & Asset Attribution

Stand: 2026-02-18

## Ziel
Diese Datei dokumentiert die aktuell verwendeten Drittanbieter-Lizenzen und den Status fuer den Store-Release.

## Aktueller Status
- Externe Flaticon-CDN-URL aus dem Runtime-Code entfernt (`src/screens/ShopScreen.js`).
- Lokale Flaticon-/Profil-Icon-Bilddateien aus dem Repo entfernt und durch Vector-Icons ersetzt.
- Verbleibende Kern-Lizenzen sind dokumentiert (Fonts + Icon-Library).

## Verwendete Drittanbieter-Lizenzen

### Fonts
- Dateien:
  - `assets/fonts/Kanit-Regular.ttf`
  - `assets/fonts/Kanit-SemiBold.ttf`
  - `assets/fonts/Kanit-Bold.ttf`
- Lizenz:
  - SIL Open Font License 1.1
  - Lizenztext im Repo: `assets/fonts/Kanit-OFL.txt`

### Icon-Library (Code)
- Paket: `@expo/vector-icons` (Ionicons, FontAwesome5)
- Nutzung: UI-Icons/Avatare/Badges
- Lizenzhinweis:
  - Kommt ueber Paketlizenz in `node_modules`
  - Fuer Store-Doku optional als "Open Source Components" auffuehren

## Entfernte, nicht mehr genutzte Drittanbieter-Bildicons
- `assets/icons/flaticon/schild_473701.png`
- `assets/icons/flaticon/trophae_3135735.png`
- `assets/icons_profile/alte-frau.png`
- `assets/icons_profile/arztin.png`
- `assets/icons_profile/benutzer.png`
- `assets/icons_profile/caduceus_1839855.png`
- `assets/icons_profile/doktor-der-medizin.png`
- `assets/icons_profile/frau.png`
- `assets/icons_profile/junge.png`
- `assets/icons_profile/mann.png`

## Rest-Risiko vor Release
- Alle verbleibenden Animationen/Bilder in `assets/animations/*` sollten intern als "eigene Assets" oder mit externer Quelle/Lizenz belegbar sein.
- Wenn fuer einzelne Animationen kein klarer Herkunftsnachweis vorliegt: vor Release Quelle + Lizenztyp ergaenzen oder Asset ersetzen.

## Copyright Go/No-Go (nur fuer Icon-Thema)
- Icon-Thema: `GO` (keine externen Icon-URLs und keine unklaren lokalen Drittanbieter-Icondateien mehr in Nutzung).
- Gesamt-Copyright: `NO-GO`, solange Herkunft/Lizenz fuer alle verbleibenden Animationsassets nicht intern verifiziert ist.

