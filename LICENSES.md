# LICENSES.md - Third-Party Licenses & Asset Attribution

Stand: 2026-02-19

## Ziel
Diese Datei dokumentiert die aktuell verwendeten Drittanbieter-Lizenzen und den Status fuer den Store-Release.

## Aktueller Status
- Verbleibende Kern-Lizenzen sind dokumentiert (Fonts + Icon-Library).
- Zwei Flaticon-Sticker fuer Profil-Avatare sind lokal eingebunden und in dieser Datei mit Quelle + Nennungspflicht dokumentiert.

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

### Flaticon-Sticker (Profil-Avatare)
- Dateien:
  - `assets/avatars/flaticon_arzt_6181883.png`
  - `assets/avatars/flaticon_krankenschwester_6181895.png`
- Quellen:
  - `https://www.flaticon.com/de/kostenloses-sticker/arzt_6181883`
  - `https://www.flaticon.com/de/kostenloses-sticker/krankenschwester_6181895`
- Autor laut Flaticon-Seite:
  - `inipagistudio`
- Lizenzhinweis:
  - Flaticon Free License mit Nennungspflicht ("Attribution required").
  - Bei Flaticon Premium kann die Nennungspflicht entfallen.
- Umsetzungsanforderung fuer Release:
  - Wenn Free License genutzt wird, muss die Nennung in App/Store/Impressum sichtbar hinterlegt sein.
  - Wenn keine Nennung erfolgen soll, auf Premium-Lizenz wechseln oder Assets ersetzen.

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
- Icon-Thema: `GO mit Bedingung` (Flaticon-Attribution muss bei Free License sichtbar hinterlegt sein).
- Gesamt-Copyright: `NO-GO`, solange Herkunft/Lizenz fuer alle verbleibenden Animationsassets nicht intern verifiziert ist.
