# AdMob Setup

Stand: 2026-03-11

Ziel:
- die letzten technischen Release-Blocker schliessen:
  - `EXPO_PUBLIC_ADMOB_APP_ID_ANDROID`
  - `EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID`

## Was du brauchst

1. Eine App in AdMob fuer Android, verknuepft mit deinem Paket `com.sjigalin.medbattle`
2. Daraus die `App ID`
3. Eine `Rewarded` Ad Unit daraus

## In `.env` eintragen

```env
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy
EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz
```

Wichtig:

- `App ID` und `Rewarded Ad Unit ID` sind zwei verschiedene Werte
- die Google-Testwerte duerfen nicht fuer den Release-Build stehen bleiben

## Danach pruefen

```powershell
npm run release:check
```

Erwartung:

- keine fehlenden AdMob-Werte mehr

Danach erst:

```powershell
cd android
./gradlew.bat bundleRelease
```

## Hinweise

- Fuer Tests im Code sind Google-Demo-Ad-Units ok.
- Vor dem Verentlichen muss die echte Rewarded-Ad-Unit gesetzt sein.
- Die Android `App ID` muss im Manifest vorhanden sein, sonst kann das Mobile-Ads-SDK abstuerzen.

## Offizielle Referenzen

- AdMob Android Quick Start:
  `https://developers.google.com/admob/android/quick-start`
- Test Ads / Demo Ad Units:
  `https://developers.google.com/admob/android/test-ads`
