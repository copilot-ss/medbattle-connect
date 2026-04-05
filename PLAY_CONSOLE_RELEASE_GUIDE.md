# Play Console Release Guide

Stand: 2026-03-31

Diese Datei buendelt die Werte, die du manuell in der Play Console brauchst. Sie ersetzt nicht die Pflichtschritte in der Console, reduziert aber Sucharbeit.

## Aktueller Release-Status

- In Play liegt jetzt der aktuelle Build `42` im Closed-Test-Track.
- Lokal liegt dasselbe AAB `42` aus dem aktuellen Repo-Stand vor.
- Dieses AAB enthaelt wieder `x86_64`; fuer einen echten Play-Store-Install auf dem Emulator muss jetzt genau dieser Closed-Test-Build ausgeliefert werden.
- Reine Supabase-Inhaltsaenderungen wie neue Online-Fragen sind bereits live; der offene Punkt ist jetzt der echte Smoke gegen den aktuellen Closed-Test-App-Build.

## Links

- Privacy: `https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=privacy`
- Terms: `https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=terms`
- Support: `https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=support`
- Delete account: `https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=delete-account`
- Kontakt: `medbattle1@gmail.com`

## Store Listing

Short description:

`MedQuiz - Medizinwissen im Quiz, Solo oder Multiplayer.`

Pflichthinweis:

`MedQuiz dient ausschliesslich Lern- und Quiz-Zwecken. Die App ist kein Medizinprodukt, diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung.`

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

## Data Safety

Vor dem finalen Eintrag mit `PLAY_DATA_SAFETY_DRAFT.md` abgleichen.

Wichtige Punkte:

- Kontoerstellung via E-Mail / Google / Discord
- optionales Avatar-Foto
- Rewarded Ads
- In-App-Kaeufe
- redigiertes Crash-/Fehlerlogging
- In-App-Kontoloeschung + oeffentliche Delete-Account-URL

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
