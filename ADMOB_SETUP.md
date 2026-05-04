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
EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false
# Optional fuer Live-Smokes auf einzelnen Geraeten:
# EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS_ANDROID=EMULATOR,33BE2250B43518CCDA7DE426D04EE231
```

Wichtig:

- `App ID` und `Rewarded Ad Unit ID` sind zwei verschiedene Werte
- die Google-Testwerte duerfen nicht fuer den Release-Build stehen bleiben
- `EXPO_PUBLIC_ADMOB_USE_TEST_IDS` muss fuer Release auf `false` stehen
- einzelne Testgeraete fuer Live-Ad-Smokes laufen stattdessen ueber `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS_ANDROID`

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
- Vor dem Veroeffentlichen muss die echte Rewarded-Ad-Unit gesetzt sein.
- Wenn Live-Ads auf einem Geraet als Test-Ad ausgeliefert werden sollen, die echte Testgeraete-ID aus Logcat in `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS_ANDROID` eintragen.
- Die Android `App ID` muss im Manifest vorhanden sein, sonst kann das Mobile-Ads-SDK abstuerzen.

## app-ads.txt

- Die Datei liegt jetzt unter `public/app-ads.txt`, damit sie bei Vite/Vercel direkt als `/app-ads.txt` ausgeliefert wird.
- Inhalt:

```txt
google.com, pub-8212642377810191, DIRECT, f08c47fec0942fa0
```

- Fuer AdMob muss die Datei oeffentlich unter `/app-ads.txt` auf der Developer-Website erreichbar sein.
- Wichtig: Die in Google Play hinterlegte `Website` muss auf dieselbe Domain zeigen, auf der `https://DEINE-DOMAIN/app-ads.txt` auslieferbar ist.
- Wenn die aktuelle GitHub-Pages-URL nur unter einem Projekt-Unterpfad laeuft, die finale AdMob-Verifikation notfalls ueber eine echte Root-Domain oder Firebase Hosting abschliessen.

## Offizielle Referenzen

- AdMob Android Quick Start:
  `https://developers.google.com/admob/android/quick-start`
- Test Ads / Demo Ad Units:
  `https://developers.google.com/admob/android/test-ads`
- app-ads.txt:
  `https://developers.google.com/admob/android/app-ads`
