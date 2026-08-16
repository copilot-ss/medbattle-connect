# Google Play Release Runbook

Stand: `2026-08-15`

## Zweck

Dieses Runbook beschreibt den reproduzierbaren Android-Release von der lokalen Prüfung bis zum Closed-Test-Rollout. Der konkrete Kandidat und seine Prüfsumme stehen ausschließlich in `RELEASE_STATUS.md`.

## Voraussetzungen

- `app.json`, `package.json` und `RELEASE_STATUS.md` nennen denselben Versionsstand.
- `.env` enthält die produktiven Supabase-, AdMob- und IAP-Werte.
- `EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false` ist für den Release gesetzt.
- Einzelne Testgeräte dürfen ausschließlich über `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS_ANDROID` als Testgeräte markiert werden.
- Lokales Upload-Keystore und `android/keystore.properties` sind vorhanden oder die Signing-Variablen sind gesetzt.
- Play Console, Closed-Test-Track und bei EAS Submit der Play-Service-Account sind eingerichtet.

## Lokales Signing

Nicht eingecheckte lokale Dateien:

- Keystore: `credentials/medbattle-upload-key.jks`
- Properties: `android/keystore.properties`
- Vorlage: `android/keystore.properties.example`

Alternativ akzeptiert `android/app/build.gradle`:

- `MEDBATTLE_UPLOAD_STORE_FILE`
- `MEDBATTLE_UPLOAD_STORE_PASSWORD`
- `MEDBATTLE_UPLOAD_KEY_ALIAS`
- `MEDBATTLE_UPLOAD_KEY_PASSWORD`
- die üblichen `android.injected.signing.*`-Properties

Secrets, Keystores und Service-Account-JSON dürfen nicht committed werden.

## AdMob und app-ads.txt

Erforderliche Release-Variablen:

```env
EXPO_PUBLIC_ADMOB_APP_ID_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy
EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID=ca-app-pub-xxxxxxxxxxxxxxxx/zzzzzzzzzz
EXPO_PUBLIC_ADMOB_USE_TEST_IDS=false
# Optional, kommasepariert:
# EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS_ANDROID=EMULATOR,DEVICE_HASH
```

- Developer-Website: `https://medquiz-web.vercel.app/`
- Seller-Datei: `https://medquiz-web.vercel.app/app-ads.txt`
- Repo-Datei: `public/app-ads.txt`

Die App-ID und die Rewarded-Ad-Unit-ID sind unterschiedliche Werte. Vor jedem Release muss `npm run release:check` globale Test-IDs blockieren.

## Preflight

Im Repo-Root ausführen:

```powershell
npm ci
npm run release:check
npx tsc --noEmit
npx expo-doctor
npx expo install --check
npm run build
```

Bei einem bestehenden, bereits geprüften `node_modules` kann `npm ci` entfallen. Fehler nicht durch Downgrades oder das Überspringen des Release-Checks verdecken.

## Dependency-Audit

- Root- und Admin-API-Audits getrennt ausführen und dokumentieren.
- Bekannte Root-Meldungen aus transitiven Expo-/Metro-/Xcode-Buildwerkzeugen stehen in `RELEASE_STATUS.md`.
- Solange kein Expo-55-kompatibler Upstream-Fix existiert, weder `npm audit fix --force` ausführen noch Expo oder React Native auf die von npm vorgeschlagenen alten Hauptversionen zurücksetzen.
- Neue Runtime-Abhängigkeiten oder zusätzliche Advisory-Ketten sind separat zu bewerten und dürfen nicht pauschal als Toolchain-Risiko abgetan werden.

## AAB bauen

Bevorzugt den vorhandenen Wrapper verwenden:

```powershell
npm run release:android:aab
```

Der Wrapper erhöht den Android-`versionCode` genau einmal, baut das Bundle und führt anschließend die automatisierte AAB-Prüfung aus. Einen fehlgeschlagenen Lauf deshalb nicht blind erneut starten: zuerst prüfen, ob der Code bereits erhöht wurde.

Alternativ nach erfolgreichem Preflight:

```powershell
Set-Location android
./gradlew.bat bundleRelease
Set-Location ..
```

Erwartetes Artefakt:

`android/app/build/outputs/bundle/release/app-release.aab`

## Artefakt prüfen

```powershell
npm run release:verify:aab
```

Der Prüfer kontrolliert Bundletool-Validierung, Version, Signatur, Upload-Zertifikat, ABIs und 16-KB-Paketierung und gibt Größe sowie SHA-256 aus. Für eine unabhängige manuelle Gegenprüfung:

```powershell
Get-FileHash -Algorithm SHA256 android/app/build/outputs/bundle/release/app-release.aab
java -jar tools/android/bundletool.jar validate --bundle=android/app/build/outputs/bundle/release/app-release.aab
```

Zusätzlich vor Upload prüfen:

- `versionCode` und Version stimmen mit `app.json` und `RELEASE_STATUS.md` überein.
- Upload-Zertifikat stimmt mit Play App Signing überein.
- targetSdk, enthaltene ABIs und 16-KB-Ausrichtung sind korrekt.
- Hash in `RELEASE_STATUS.md` gehört exakt zu diesem Artefakt.

## Upload-Varianten

### Manuell in der Play Console

Für ein lokal gebautes und verifiziertes AAB ist der manuelle Upload in den Closed-Test-Track der direkteste Weg. Vor dem Speichern noch einmal Dateipfad, Version und Prüfsumme abgleichen.

### EAS Submit mit lokalem AAB

Zuerst den Play-Submit-Service-Account interaktiv hinterlegen:

```powershell
npx eas credentials -p android
```

Dann genau das geprüfte lokale Artefakt einreichen:

```powershell
npx eas submit --platform android --path android/app/build/outputs/bundle/release/app-release.aab --profile production
```

`--latest` darf nur verwendet werden, wenn ein bestimmter EAS-Production-Build zuvor anhand von Version und Artefakt-ID geprüft wurde. Es reicht nicht das lokal gebaute AAB ein und ist deshalb für den aktuellen lokalen Kandidaten ungeeignet.

## Closed-Test-Rollout

1. Release Notes und Zieltrack kontrollieren.
2. AAB hochladen und Play-Prüfungen abwarten.
3. Den Closed-Test-Rollout starten.
4. Kontoabhängige Tester- und Laufzeitanforderungen direkt in der aktuellen Play Console prüfen; keine alten Zahlen aus historischen Notizen übernehmen.
5. Build über den Opt-in-Link aus Google Play installieren, nicht per lokaler APK ersetzen.
6. Die Matrix in `RELEASE_TESTS.md` auf Emulator und Realgerät abarbeiten.

## Play-Console-Pflichtfelder

- Store Listing und Assets: `../play/STORE_LISTING.md`
- App Content und Content Rating: `../play/PLAY_APP_CONTENT.md`
- Data Safety: `../play/PLAY_DATA_SAFETY.md`
- Privacy, Terms, Support und Delete Account: Links in `../play/STORE_LISTING.md`
- Health Apps Declaration: medizinische Lerninhalte als Education/Quiz, nicht als Diagnose oder Therapie deklarieren.

## Abschluss

- Testergebnisse in `RELEASE_TESTS.md` dokumentieren.
- Tatsächlich ausgerollten Build und Status in `RELEASE_STATUS.md` aktualisieren.
- Nur aktuelle offene Arbeit in `../../TASKS.md` führen.
- Bei einem neuen Artefakt Hash, Datum und Versionsstand ersetzen; nie alte Artefaktdaten als aktuellen Nachweis stehen lassen.
- Ein technisch valides Closed-Test-AAB ist keine Produktionsfreigabe. Die Secret-, Servervalidierungs- und Lizenzblocker in `RELEASE_STATUS.md` müssen vor Produktion separat abgeschlossen sein.
