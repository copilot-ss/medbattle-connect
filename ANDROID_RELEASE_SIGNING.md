# Android Release Signing

Das Projekt baut `release` nicht mehr mit dem Debug-Keystore. Fuer lokale Release-Builds wird ein eigenes Upload-Keystore verwendet.

## Lokale Dateien

- Keystore: `credentials/medbattle-upload-key.jks`
- Gradle-Properties: `android/keystore.properties`
- Vorlage ohne Secrets: `android/keystore.properties.example`

Die echten Dateien sind per `.gitignore` vom Repo ausgeschlossen.

## Release-AAB bauen

```powershell
npm run release:check
cd android
./gradlew.bat bundleRelease
```

Das fertige Bundle liegt danach hier:

`android/app/build/outputs/bundle/release/app-release.aab`

## Alternative Konfiguration

Statt `android/keystore.properties` akzeptiert `android/app/build.gradle` auch diese Variablen:

- `MEDBATTLE_UPLOAD_STORE_FILE`
- `MEDBATTLE_UPLOAD_STORE_PASSWORD`
- `MEDBATTLE_UPLOAD_KEY_ALIAS`
- `MEDBATTLE_UPLOAD_KEY_PASSWORD`

Ausserdem werden die von Gradle/CI oft verwendeten `android.injected.signing.*` Properties akzeptiert.
