# Play Console Release Guide

Stand: 2026-03-24

Diese Datei buendelt die Werte, die du manuell in der Play Console brauchst. Sie ersetzt nicht die Pflichtschritte in der Console, reduziert aber Sucharbeit.

## Aktueller Release-Status

- In Play liegt weiterhin nur der hochgeladene Build `31`, der noch nicht aktiv ist.
- Lokal liegt ein frisches AAB `39` aus dem aktuellen Repo-Stand vor.
- Dieses AAB enthaelt wieder `x86_64`; fuer einen echten Play-Store-Install auf dem Emulator muss dieser Build jetzt hochgeladen und ausgerollt werden.
- Reine Supabase-Inhaltsaenderungen wie neue Online-Fragen sind bereits live, aendern aber nichts am noch offenen Play-Rollout des aktuellen App-Builds.

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
4. dann erst `./gradlew.bat bundleRelease`
5. danach den echten Artefaktstand dokumentieren (`versionCode`, Datum, Testgeraet)

Referenz:

- `ADMOB_SETUP.md`

## Danach weiter

- Store Assets hochladen
- Content Rating ausfuellen
- Data Safety final eintragen
- Closed Test starten
- Realgeraet-Smoke + OAuth/Multiplayer/Purchases/Ads manuell gegen genau dieses frische Artefakt bestaetigen
