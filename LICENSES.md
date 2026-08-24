# LICENSES.md - Third-Party Licenses & Asset Attribution

Stand: 2026-08-24

## Ziel
Diese Datei dokumentiert die aktuell verwendeten Drittanbieter-Lizenzen und den Status fuer den Store-Release.

## Aktueller Status
- Verbleibende Kern-Lizenzen sind dokumentiert (Fonts + Icon-Library).
- Zwei Flaticon-Sticker fuer Profil-Avatare sind lokal eingebunden und in dieser Datei mit Quelle + Nennungspflicht dokumentiert.
- Brainrot-Quizbilder nutzen nur CC0/Public-Domain-Quellen ohne Attribution-Pflicht; keine echten Meme-Screenshots, Figuren- oder Markenassets.
- Weitere Foto-Bildfragen nutzen nur Public-Domain-/CC0-Quellen und werden remote ueber Supabase-Bild-URLs referenziert.
- Alle zuvor ungeklärten Dateien unter `assets/animations/` wurden entfernt und durch Ionicons aus der dokumentierten Icon-Library ersetzt.

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

### Brainrot-Quizbilder
- Nutzung:
  - Lokale Kopien unter `assets/images/brainrot/` und Remote-Quell-URLs in `src/data/offlineGeneralCategoryPack.js` fuer optionale Fragebilder.
  - Die Bilder illustrieren generische Begriffe/Motive und verwenden keine echten Meme-Frames oder geschuetzten Charakterbilder.
- Quellen und Lizenzstatus:
  - Capybara: `https://www.publicdomainpictures.net/en/view-image.php?image=16253&picture=capybara`
    - Lizenz: CC0 Public Domain laut Quellseite.
  - Toilette: `https://commons.wikimedia.org/wiki/File:Toilet.JPG`
    - Lizenz: Public Domain / PD-self, worldwide use grant laut Commons-Dateiseite.
  - Kaffee: `https://commons.wikimedia.org/wiki/File:Cup_Coffee.jpg`
    - Lizenz: Creative Commons CC0 1.0 laut Commons-Dateiseite.
  - Krokodil: `https://commons.wikimedia.org/wiki/File:American_Crocodile_(53495458717).jpg`
    - Lizenz: Public Domain als Werk eines National-Park-Service-Mitarbeiters laut Commons-Dateiseite.
  - Kamera/POV: `https://commons.wikimedia.org/wiki/File:Old_camera_(Unsplash).jpg`
    - Lizenz: Creative Commons CC0 1.0 laut Commons-Dateiseite.
  - Gamepad-Illustration: `https://openclipart.org/detail/172636/gamepad`
    - Lizenz: Openclipart/CC0 Public Domain laut Openclipart-FAQ.
  - Tastatur/Copypasta: `https://commons.wikimedia.org/wiki/File:Keyboard_Close_Up.jpg`
    - Lizenz: Creative Commons CC0 1.0 laut Commons-Dateiseite.
  - Riesenhai/Tralalero: `https://commons.wikimedia.org/wiki/File:Basking_Shark.jpg`
    - Lizenz: Public Domain laut Commons-Dateiseite.
  - Drumsticks/Tung Tung Sahur: `https://commons.wikimedia.org/wiki/File:Drumstick_pair.jpg`
    - Lizenz: Creative Commons CC0 1.0 laut Commons-Dateiseite.
  - Sigma-Zeichen: `https://commons.wikimedia.org/wiki/File:Greek_sigma.png`
    - Lizenz: Public Domain / PD-self laut Commons-Dateiseite.
- Release-Hinweis:
  - Keine Attribution erforderlich; Quellen bleiben hier zur Nachweisbarkeit dokumentiert.

### Weitere Foto-Bildfragen
- Nutzung:
  - Remote-Quell-URLs in Supabase-Fragen (`questions.image_url`), keine lokalen App-Assets.
  - Die Fotos stammen aus Public-Domain-/CC0-Quellen und werden fuer generische Wissensfragen genutzt.
- Quellen und Lizenzstatus:
  - Brustkorb-Roentgen: `https://commons.wikimedia.org/wiki/File:Chest_X-Ray.jpg`
    - Lizenz: Public Domain als Werk der US Army / US Government laut Commons-Dateiseite.
  - AED/Defibrillator: `https://commons.wikimedia.org/wiki/File:AED_Open.jpg`
    - Lizenz: Public Domain / PD-self laut Commons-Dateiseite.
  - Berliner Mauer: `https://commons.wikimedia.org/wiki/File:The_Berlin_Wall_1961_-_1989_HU99520.jpg`
    - Lizenz: Public Domain / UK Government artistic works laut Commons-Dateiseite.
  - Solarzellen: `https://commons.wikimedia.org/wiki/File:Solar_panels_(48306990857).jpg`
    - Lizenz: Public Domain als Werk des U.S. Fish and Wildlife Service laut Commons-Dateiseite.
  - Wahlurne: `https://commons.wikimedia.org/wiki/File:Ballot_Box.jpg`
    - Lizenz: Creative Commons CC0 1.0 laut Commons-Dateiseite.
  - Nil-Delta-Satellitenbild: `https://commons.wikimedia.org/wiki/File:Nile_delta_landsat_false_color.jpg`
    - Lizenz: Public Domain / NASA World Wind laut Commons-Dateiseite.
  - Kompass: `https://commons.wikimedia.org/wiki/File:US_Army_Lensatic_Compass_-_Flickr_-_The_Central_Intelligence_Agency.jpg`
    - Lizenz: Public Domain als Werk der Central Intelligence Agency laut Commons-Dateiseite.
  - Feuer: `https://commons.wikimedia.org/wiki/File:Fire_and_logs_at_night_(Unsplash).jpg`
    - Lizenz: Creative Commons CC0 1.0 laut Commons-Dateiseite.
  - Haendewaschen: `https://commons.wikimedia.org/wiki/File:Person_washing_hands.jpg`
    - Lizenz: Public Domain als Werk der Centers for Disease Control and Prevention laut Commons-Dateiseite.
  - Mikroskop: `https://commons.wikimedia.org/wiki/File:Microscope_(15474680789).jpg`
    - Lizenz: Public Domain als Werk des U.S. National Park Service laut Commons-Dateiseite.
  - Wright Flyer Erstflug: `https://commons.wikimedia.org/wiki/File:Firstflight_2_cropped.jpg`
    - Lizenz: Public Domain wegen abgelaufenen US-Copyrights laut Commons-Dateiseite.
  - Blitz: `https://commons.wikimedia.org/wiki/File:Lightning_NOAA.jpg`
    - Lizenz: Public Domain als Werk der National Oceanic and Atmospheric Administration laut Commons-Dateiseite.
  - U.S. Capitol: `https://commons.wikimedia.org/wiki/File:U.S._Capitol_Building_(9733883414).jpg`
    - Lizenz: Public Domain als Werk des Architect of the Capitol laut Commons-Dateiseite.
  - Grand Canyon: `https://commons.wikimedia.org/wiki/File:Grand_Canyon_National_Park_GRCA9862.jpg`
    - Lizenz: Public Domain als Werk des U.S. National Park Service laut Commons-Dateiseite.
  - Wuestenzelt: `https://commons.wikimedia.org/wiki/File:Desert_tent_(15561690130).jpg`
    - Lizenz: Creative Commons CC0 1.0 laut Commons-Dateiseite.
  - Katzenfoto: `https://commons.wikimedia.org/wiki/File:Cat_closeup.jpg`
    - Lizenz: Public Domain / PD-author laut Commons-Dateiseite.
- Release-Hinweis:
  - Keine Attribution erforderlich; Quellen bleiben hier zur Nachweisbarkeit dokumentiert.

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
  - Die Nennung ist in den In-App-Rechtstexten und in `legal-static/terms.html` sichtbar hinterlegt.
  - Wenn keine Nennung erfolgen soll, auf Premium-Lizenz wechseln oder Assets ersetzen.

## Rest-Risiko vor Release
- Keine ungeklärten lokalen Animationsassets verbleiben im Release-Bundle.

## Copyright Go/No-Go
- Avatar-Sticker: `GO` mit der derzeit sichtbaren Flaticon-Attribution.
- Gesamt-Copyright: `GO` fuer den Produktions-Rollout auf Basis der hier dokumentierten Assets und Attributionen.
