# Play App Content Draft

Stand: 2026-03-11

Zweck:
- Vorlage fuer `App content`, `Target audience`, `App access` und angrenzende Play-Console-Felder.

## Target Audience

Empfehlung:

- Nicht primaer fuer Kinder ausrichten
- Keine spezielle Families-Ausrichtung

Begruendung:

- Medizin-/Gesundheitsbezug
- Multiplayer / soziale Interaktion
- Werbung und In-App-Kaeufe vorhanden

## Medical / Health

Empfehlung:

- `Medical or health info`: `Yes`
- Kontext: `Educational / quiz / learning only`

Begruendung:

- MedQuiz dient Lern- und Quiz-Zwecken.
- Kein Medizinprodukt
- Keine Diagnose, Behandlung, Heilung oder Praevention

Store-/Legal-Hinweis:

`MedQuiz dient ausschliesslich Lern- und Quiz-Zwecken. Die App ist kein Medizinprodukt, diagnostiziert, behandelt, heilt oder verhindert keine Erkrankungen und ersetzt keine medizinische Beratung. Bei Beschwerden oder wenn du eine Diagnose oder Behandlung brauchst, hole bitte medizinischen Rat bei qualifiziertem Fachpersonal ein.`

## Health Apps Declaration

Empfehlung:

- In Play Console unter `App content` die `Health apps declaration` fuer den medizinischen Lern-/Quiz-Kontext manuell ausfuellen.

Begruendung:

- Laut aktueller Google-Play-Richtlinie fallen auch Apps mit gesundheitsbezogenen Informationen in diese Deklaration, selbst wenn sie kein Medizinprodukt sind.

## User Interaction

Empfehlung:

- `Yes`

Begruendung:

- Multiplayer-Matches
- Freunde / Einladungen / Lobby-Bezug
- Frei waehlbare Nutzernamen und optionale Profilfotos

Aktueller Repo-Stand:

- In-App-Profilansichten bieten jetzt klar beschriftete `Report user/content`- und `Block`-Funktionen.
- Auth- und Avatar-Flow verlangen vor Social-/UGC-Nutzung eine bestaetigte Kenntnis von AGB und Datenschutz.
- Support-Mailbox fuer Abuse-Reports bleibt operativ zu ueberwachen.

## Ads

Empfehlung:

- `Yes`, wenn Rewarded Ads im Release aktiv bleiben

Hinweis:

- Rewarded Ads werden aktuell als nicht personalisierte Werbung angefragt.
- Wenn Ads vor Release deaktiviert werden, muss diese Angabe erneut geprueft werden.

## App Access

Empfehlung:

- Falls Play nach Review-Zugang fragt: angeben, dass die App im Gastmodus pruefbar ist.

Vorschlag fuer Reviewer-Notiz:

`Die App kann ohne Login im Gastmodus getestet werden. Optionaler Login per E-Mail, Google oder Discord ist fuer synchronisierte Profile, Freunde und Multiplayer verfuegbar.`

## Account Deletion

In der Play Console hinterlegen:

- Delete account URL:
  `https://copilot-ss.github.io/medbattle-connect/legal-static/delete-account.html`
  Die Zielseite muss `MedQuiz`, `CoppiCodes` und `com.sjigalin.medbattle` sichtbar nennen.

In-App vorhanden:

- direkter Loeschpfad in den Legal-/Settings-Bereichen

## Privacy / Terms / Support

- Privacy:
  `https://copilot-ss.github.io/medbattle-connect/legal-static/privacy.html`
- Terms:
  `https://copilot-ss.github.io/medbattle-connect/legal-static/terms.html`
- Support:
  `https://copilot-ss.github.io/medbattle-connect/legal-static/support.html`
- Privacy page update (2026-04-12): the public privacy policy now states explicit retention periods for account/profile/gameplay data, local guest data, diagnostics, support requests, and legally required billing/security records.
- Privacy page update (2026-04-12): the public privacy policy now also states secure data handling procedures such as HTTPS/TLS transport and redacted diagnostics logging.
