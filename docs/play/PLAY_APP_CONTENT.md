# Google Play App Content und Content Rating

Stand: `2026-08-15`

Diese Datei ist eine Arbeitsgrundlage. Vor dem Absenden müssen die Fragen und Antwortoptionen mit dem aktuellen Wortlaut der Play Console und dem finalen Store-Build abgeglichen werden.

## Target Audience

Empfehlung:

- Nicht primär für Kinder ausrichten.
- Keine spezielle Families-Ausrichtung wählen.

Begründung:

- Medizinische Lerninhalte
- Multiplayer und soziale Interaktion
- Rewarded Ads und In-App-Käufe

## Medical or Health

- `Medical or health info`: `Yes`
- Kontext: Education, quiz and learning only
- Health Apps Declaration unter `App content` ausfüllen.

Verbindlicher Hinweis für Store und App:

`MedQuiz dient ausschließlich Lern- und Quiz-Zwecken. Die App ist kein Medizinprodukt, diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung. Wenn du eine Diagnose oder Behandlung brauchst, hole bitte medizinischen Rat bei qualifiziertem Fachpersonal ein.`

Die zusätzlichen Allgemeinwissenskategorien ändern nichts daran, dass medizinische Lerninhalte vorhanden und entsprechend zu deklarieren sind.

## User Interaction und UGC

- `User interaction`: `Yes`
- Relevante Funktionen: Multiplayer, Freunde, Einladungen, frei wählbare Nutzernamen und optionale Profilfotos.
- Public-Profile-Ansichten enthalten Report- und Block-Funktionen.
- Auth- und Avatar-Flows verweisen auf Terms und Privacy.
- Abuse-Reports werden operativ über `medbattle1@gmail.com` bearbeitet.
- Es gibt keinen offenen öffentlichen Posting-Feed und keinen Freitext-Chat als Kernfunktion.

## Ads und Käufe

- `Contains ads`: `Yes`, solange Rewarded Ads im Release aktiv sind.
- Rewarded Ads werden als nicht personalisierte Werbung angefragt.
- In-App-Käufe sind vorhanden.

Wenn Ads oder Käufe vor einem Release entfernt oder erweitert werden, müssen App Content, Data Safety und Store Listing erneut geprüft werden.

## App Access

Die App kann ohne Login im Gastmodus geprüft werden. Optionaler Login per E-Mail, Google oder Discord ist für synchronisierte Profile, Freunde und Multiplayer verfügbar.

Vorschlag für Reviewer Notes:

`The app can be tested without signing in by using guest mode. Optional email, Google, or Discord sign-in enables synchronized profiles, friends, and multiplayer features.`

## Account Deletion

- In-App-Löschpfad ist vorhanden.
- Öffentliche URL: `https://copilot-ss.github.io/medbattle-connect/legal-static/delete-account.html`
- Die Seite nennt `MedQuiz`, `CoppiCodes` und `com.sjigalin.medbattle`.

## Content Rating Arbeitsstand

| Fragebereich | Empfohlener Stand |
| --- | --- |
| Violence | No |
| Blood / Gore | No |
| Sexual content / Nudity | No |
| Profanity / Crude humor | No, vor finalem Submit gegen alle aktuellen Fragen prüfen |
| Drugs / Alcohol / Tobacco | No, vor finalem Submit gegen alle aktuellen Fragen prüfen |
| Gambling / Simulated gambling | No |
| Horror / Fear | No |
| User interaction | Yes |
| Shares precise location | No |
| Unrestricted internet access | No |
| Medical or health content | Yes, educational only |

Die finale Altersfreigabe bestimmt IARC/Google Play. Bei neuen Fragepaketen muss insbesondere geprüft werden, ob einzelne Inhalte eine Antwort im Rating ändern.

## Vor dem Absenden

- [ ] Aktuellen Store-Build mit diesen Angaben vergleichen.
- [ ] Health Apps Declaration vollständig ausfüllen.
- [ ] Report/Block im Store-Build sichtbar prüfen.
- [ ] Gastzugang in Reviewer Notes beschreiben.
- [ ] Ads- und IAP-Angaben mit dem finalen Build abgleichen.
- [ ] Content-Rating-Antworten gegen den aktuellen Fragenbestand prüfen.
