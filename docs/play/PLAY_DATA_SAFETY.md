# Google Play Data Safety

Stand: `2026-08-15`

Arbeitsgrundlage für das Data-Safety-Formular. Vor jedem Submit gegen den finalen Store-Build, die aktuelle Google-Terminologie und die veröffentlichte Privacy Policy prüfen.

## Grundangaben

- Daten werden verschlüsselt übertragen: `Yes` (`HTTPS/TLS`).
- Kontolöschung ist in der App und über eine öffentliche Seite möglich: `Yes`.
- Daten werden verkauft: `No`.
- Öffentliche Löschseite: `https://copilot-ss.github.io/medbattle-connect/legal-static/delete-account.html`
- Kanonische Privacy Policy: `https://copilot-ss.github.io/medbattle-connect/legal-static/privacy.html`
- Externer Telemetrieanbieter: keiner; redigierte Diagnosedaten werden in Supabase `client_logs` gespeichert.

Die Health Apps Declaration ist ein separates Play-Console-Formular und muss zusätzlich ausgefüllt werden.

## Relevante Funktionen und Codequellen

- Auth: `src/screens/AuthScreen.js`, `src/screens/auth/authOAuth.js`
- Profil und optionales Avatar-Foto: `src/screens/AvatarEditScreen.js`, `src/services/userService.js`
- Rewarded Ads: `src/screens/home/useHomeBoostActions.js`, `src/services/adsService.native.js`
- In-App-Käufe: `src/lib/inAppPurchases.js`, `src/screens/ShopScreen.js`
- Lokale Benachrichtigungen: `src/services/notificationsService.js`
- Redigiertes Fehlerlogging: `src/services/loggingService.js`, `src/utils/privacySanitizer.js`
- Kontolöschung: `src/screens/LegalScreen.js`, `src/services/accountDeletionService.js`
- Öffentliche Legal-Seiten: `legal-static/`

## Datentypen

| Datentyp | Arbeitsstand | Zweck |
| --- | --- | --- |
| E-Mail-Adresse | Collected | Konto und Authentifizierung |
| User ID | Collected | Konto-, Profil- und Datenbankzuordnung |
| Nutzername | Collected | Profil und soziale Funktionen |
| Foto | Optional collected | Gewähltes Avatar-Foto |
| Video | Not collected | Keine Funktion im aktuellen Produkt |
| App-Aktivität | Collected | Fortschritt, Scores, Multiplayer und Interaktionen |
| Crash Logs / Diagnostics | Collected | Redigierte Fehlerdiagnose |
| Zahlungs- oder Bankdaten | Not collected | Abrechnung erfolgt über den Store |
| Kaufdatensätze | Collected | Produkt-ID und für die Kaufabwicklung nötige Metadaten |
| Advertising / Device IDs | Collected by SDK | AdMob-Kontext |
| Präziser Standort | Not collected | Keine Funktion im aktuellen Produkt |

## Sharing-Arbeitsstand

- AdMob-Daten nach dem exakten Google-Fragewortlaut als Sharing mit Google für Ads bewerten.
- Supabase als Service-Provider für Auth, Datenhaltung, Storage und Diagnostik nach dem exakten Formularwortlaut bewerten.
- Store/Billing verarbeitet Käufe als Plattformanbieter.

`Collected` und `Shared` müssen nach den Definitionen der aktuellen Play Console gesetzt werden; nicht aus älteren Formulartexten übernehmen.

## Pflichtabgleich vor Submit

- [ ] E-Mail-, Google- und Discord-Auth
- [ ] Gastmodus und lokale Gastdaten
- [ ] Optionales Avatar-Foto, Kamera/Galerie und Storage-Bucket `avatars`
- [ ] Rewarded Ads und Advertising ID
- [ ] Coin-, Boost- und Premium-Käufe
- [ ] Scores, Fortschritt, Freunde und Multiplayer-Zustände
- [ ] Redigierte `client_logs`
- [ ] In-App-Löschung und öffentliche Delete-Account-Seite
- [ ] Privacy-Aufbewahrungsfristen und sichere Datenverarbeitung
- [ ] Neue SDKs oder Datenflüsse seit dem letzten Store-Release

Das Formular erst final speichern, wenn jeder Punkt mit dem tatsächlich hochgeladenen Store-Build übereinstimmt.
