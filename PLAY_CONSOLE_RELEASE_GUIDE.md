# Play Console Release Guide

Stand: 2026-03-31

Diese Datei buendelt die Werte, die du manuell in der Play Console brauchst. Sie ersetzt nicht die Pflichtschritte in der Console, reduziert aber Sucharbeit.

## Aktueller Release-Status

- In Play liegt jetzt der aktuelle Build `42` im Closed-Test-Track.
- Lokal liegt dasselbe AAB `42` aus dem aktuellen Repo-Stand vor.
- Dieses AAB enthaelt wieder `x86_64`; fuer einen echten Play-Store-Install auf dem Emulator muss jetzt genau dieser Closed-Test-Build ausgeliefert werden.
- Reine Supabase-Inhaltsaenderungen wie neue Online-Fragen sind bereits live; der offene Punkt ist jetzt der echte Smoke gegen den aktuellen Closed-Test-App-Build.

## Links

- Privacy: `https://copilot-ss.github.io/medbattle-connect/legal-static/privacy.html`
- Terms: `https://copilot-ss.github.io/medbattle-connect/legal-static/terms.html`
- Support: `https://copilot-ss.github.io/medbattle-connect/legal-static/support.html`
- Delete account: `https://copilot-ss.github.io/medbattle-connect/legal-static/delete-account.html`
- app-ads.txt im Repo: `public/app-ads.txt`
- Kontakt: `medbattle1@gmail.com`
- Privacy update for Play review (2026-04-12): the privacy page now includes explicit retention periods. In Play Console, open `App content > Privacy policy`, save the same URL again if needed, then resubmit the changes for review.

## Store Listing

Short description:

`MedQuiz - Medizinwissen im Quiz, Solo oder Multiplayer.`

Pflichthinweis:

`MedQuiz dient ausschliesslich Lern- und Quiz-Zwecken. Die App ist kein Medizinprodukt, diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung. Bei Beschwerden oder wenn du eine Diagnose oder Behandlung brauchst, hole bitte medizinischen Rat bei qualifiziertem Fachpersonal ein.`

Referenz: `STORE_LISTING.md`
Store-Assets: `STORE_ASSETS.md`

## Content Rating / App Content

Vorschlag:

- Violence: None
- Sexual content: None
- Profanity: None
- Alcohol/tobacco/drugs: None
- Simulated gambling: None
- User interaction: Yes
- Medical or health info: Yes, educational only

Referenzen:

- `PLAY_CONTENT_RATING_DRAFT.md`
- `PLAY_APP_CONTENT_DRAFT.md`

Target audience:

- Nicht primaer fuer Kinder
- `Medical or health info`: Ja, aber nur Lern-/Quiz-Kontext
- `User interaction`: Ja, wegen Multiplayer
- `Health apps declaration`: manuell in `App content` ausfuellen, weil MedQuiz gesundheitsbezogene Lerninhalte bereitstellt

## Data Safety

Vor dem finalen Eintrag mit `PLAY_DATA_SAFETY_DRAFT.md` abgleichen.

Wichtige Punkte:

- Kontoerstellung via E-Mail / Google / Discord
- optionales Avatar-Foto
- Rewarded Ads
- In-App-Kaeufe
- redigiertes Crash-/Fehlerlogging
- In-App-Kontoloeschung + oeffentliche Delete-Account-URL

## Policy Focus

- Nutzerdaten / Privacy Policy: Privacy- und Delete-Account-Seiten enthalten seit `2026-04-12` explizite Aufbewahrungsfristen und sichere Datenverarbeitung. In Play Console die Privacy-URL erneut speichern und zur Pruefung einreichen.
- Gesundheitsbezogene Inhalte: MedQuiz muss ueberall klar als Lern-/Quiz-App bleiben. Keine diagnostischen, therapeutischen oder irrefuehrenden Heilversprechen in Store-Texten, In-App-Texten oder Screenshots. Zusaetzlich die `Health apps declaration` in Play Console ausfuellen und den Hinweis auf qualifiziertes Fachpersonal im Store-Text beibehalten.
- Monetarisierung / Werbung: Rewarded Ads laufen als non-personalized, IAP ueber Store-Billing. Vor dem Release den echten Closed-Test-Store-Build gegen Ad-/Kauf-Flow smoke-testen.
- app-ads.txt / Developer Website: Die Seller-Datei ist im Repo vorbereitet. Fuer die AdMob-Verifikation muss die in Google Play hinterlegte `Website` auf genau die Domain zeigen, die `https://<domain>/app-ads.txt` am Root ausliefert. Ein Projekt-Unterpfad allein ist dafuer nicht die sichere Endkonfiguration.
- User Interaction / UGC: Freunde, Multiplayer-Lobbys, Nutzernamen und optionale Profilfotos sind im Produkt vorhanden. Der aktuelle Repo-Stand bietet in Public-Profile-Sheets klar beschriftete `Report user/content`- und `Block`-Funktionen sowie eine Terms-/Privacy-Bestaetigung im Auth-/Avatar-Flow. Vor dem Submit trotzdem im Store-Build pruefen, dass diese Buttons sichtbar sind und Abuse-Mails unter `medbattle1@gmail.com` operativ bearbeitet werden.
- Funktionalitaet / Nutzererfahrung: Store-Smoke fuer den tatsaechlich ausgerollten Closed-Test-Build bleibt Pflicht, weil Google funktionale und stabile Kernflows erwartet.

## Closed Test

Fuer neue private Entwicklerkonten:

- `Geschlossener Test`
- mindestens `12 Tester`
- mindestens `14 Tage` fortlaufend

Erst danach `Produktion beantragen`.

Referenz:

- `CLOSED_TEST_PLAN.md`

## Vor dem AAB-Bau

1. `npm run release:check`
2. reale `EXPO_PUBLIC_ADMOB_APP_ID_ANDROID` setzen
3. reale `EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID` setzen
4. `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false` sicherstellen
5. optional eigene Testgeraete per `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS_ANDROID` eintragen
6. dann erst `./gradlew.bat bundleRelease`
7. danach den echten Artefaktstand dokumentieren (`versionCode`, Datum, Testgeraet)

Referenz:

- `ADMOB_SETUP.md`

## Danach weiter

- Store Assets hochladen
- Content Rating ausfuellen
- Data Safety final eintragen
- Closed-Test-Rollout mit Build `42` weiter pruefen
- Realgeraet-Smoke + Emulator-Smoke + OAuth/Multiplayer/Purchases/Ads manuell gegen genau dieses frische Artefakt bestaetigen
