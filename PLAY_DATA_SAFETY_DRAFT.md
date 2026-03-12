# PLAY_DATA_SAFETY_DRAFT.md - MedBattle

Stand: 2026-03-11

Zweck:
- Arbeitsvorlage fuer die Play Console `Data safety` Eingabe.
- Vor finalem Submit mit dem aktuellen Store-Build und den Live-Links gegenpruefen.

## 1) App-Grundangaben (Draft)
- Daten werden verschluesselt uebertragen: `Ja` (HTTPS/TLS fuer Supabase, Store, Ads).
- Kontoloeschung moeglich: `Ja` (direkt in der App plus oeffentliche Delete-Account-URL).
- Oeffentliche Delete-Account-URL:
  - `https://uxlwbzgohgxbnhcjiimh.functions.supabase.co/legal?doc=delete-account`
- Sicherheitspraktiken dokumentiert: `Ja` (redigierte Client-Logs, kein externer Telemetry-Provider).
- Daten werden nicht verkauft: `Nein` zu `Data is sold`.

## 2) Relevante Features im Code
- Auth (E-Mail, Google, Discord):
  - `src/screens/AuthScreen.js`
  - `src/screens/auth/authOAuth.js`
- Profilfoto optional (Kamera/Galerie + Upload):
  - `src/screens/AvatarEditScreen.js`
  - `src/services/userService.js`
- Ads (Rewarded, non-personalized request):
  - `src/screens/home/useHomeBoostActions.js`
  - `src/services/adsService.native.js`
- In-App-Kaeufe:
  - `src/lib/inAppPurchases.js`
  - `src/screens/ShopScreen.js`
  - `src/screens/home/useHomeBoostActions.js`
- Lokale Notifications (kein Push-Token-Flow im App-Code):
  - `src/services/notificationsService.js`
- Crash-/Fehlerlogging (redigiert) nach Supabase:
  - `src/services/loggingService.js`
  - `src/utils/privacySanitizer.js`
- Direkte Kontoloeschung:
  - `src/screens/LegalScreen.js`
  - `src/services/accountDeletionService.js`
  - `supabase/functions/delete-account/index.ts`

## 3) Data-Type Draft fuer Play Console
Hinweis:
- `Collected` und `Shared` in Play Console streng nach Google-Definition setzen.
- Bei Unsicherheit konservativ eintragen und mit Privacy-Text konsistent halten.

### Personal info
- Email address: `Collected` (Account/Auth)
- User ID: `Collected` (Auth/DB references)
- Name/username: `Collected` (profile/display name)

### Photos and videos
- Photos: `Collected` (optional nur wenn Nutzer ein Avatar-Foto waehlt)
- Videos: `Not collected`

### App activity
- App interactions / in-app progress / scores / multiplayer state: `Collected`

### App info and performance
- Crash logs and diagnostics: `Collected` (redigiert)

### Financial info
- Payment card / bank data: `Not collected` (Store-Abrechnung extern)
- Purchase records (product IDs / receipt metadata): `Collected` fuer Kaufabwicklung

### Device or other IDs
- Advertising ID / device identifiers ueber Ads SDK: `Collected` (AdMob SDK-Kontext)

## 4) Sharing Draft (vorsichtig)
- AdMob: in der Regel als `Shared` mit Google fuer Ads zu behandeln. In Play Console nach dem exakten Fragewortlaut eintragen.
- Supabase: fuer die App-Funktion als Service-Provider-Verarbeitung bewerten; in Play Console nach dem exakten Fragewortlaut eintragen.
- App Stores / Billing: Kaufabwicklung ueber Plattformanbieter.

## 5) Must-Check vor finalem Publish
- Data Safety Eintrag passt exakt zu:
  - Avatar-Foto (Kamera/Galerie) + Storage `avatars`
  - Ads (Rewarded, non-personalized request)
  - In-App-Kaeufe (Coin- und Boost-Produkte)
  - Crash-Logging ueber `client_logs` (redigiert)
  - Kontoerstellung per E-Mail/OAuth
  - In-App-Kontoloeschung plus oeffentliche Delete-Account-URL
- Privacy-URL, Delete-Account-URL und In-App-Legal-Text sind konsistent mit dem finalen Data-Safety-Formular.
- Nach jedem Feature-Change Data Safety erneut gegenpruefen.
