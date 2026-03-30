# PLAY_SUBMIT_STEPS.md - MedQuiz

Stand: 2026-03-24

## Ziel
Google Play Submit in EAS vorbereiten und das naechste frische Android-Release-Artefakt einreichen.

## Aktueller Status
- In Google Play liegt bisher nur der hochgeladene Store-Build `31`; dieser ist weiterhin nicht aktiv.
- Lokal existiert ein frisches Store-AAB `39` vom `2026-03-24`.
- Dieses AAB ist aus dem aktuellen Repo-Stand gebaut und enthaelt wieder `x86_64`, damit Google Play dem Emulator spaeter wieder eine passende Variante ausliefern kann.
- Der Play Submit Service Account ist weiterhin offen und blockiert einen sauberen CLI-Submit.

## Voraussetzungen
- Google Play Console App ist angelegt.
- Entwicklerkonto-Einrichtung/Identitaetspruefung in Play Console ist abgeschlossen.
- Service Account JSON aus Google Cloud ist vorhanden.
- Service Account hat in Play Console die noetigen Rechte fuer den geplanten Flow.
- Erste App-Einreichung wurde mindestens einmal manuell im Web-UI gemacht. Erst danach funktioniert der API-Submit sauber.

## Wenn API Access noch fehlt
- Solange in der Play Console "Einrichtung des Entwicklerkontos abschliessen" bzw. die Identitaetspruefung offen ist, ist API-Zugriff oft noch blockiert.
- In diesem Zustand zuerst die Google-Freigabe abwarten und erst danach Service Account + Rechte setzen.

## Service Account JSON beschaffen
1. In der Google Cloud Console `IAM & Admin` -> `Service Accounts` oeffnen.
2. Service Account erstellen, z. B. `eas-play-submit`.
3. Unter `Keys` einen neuen `JSON`-Key erzeugen.
4. In Play Console `Users and permissions` oeffnen.
5. Den Service-Account per E-Mail-Adresse einladen und nur die noetigen App-Rechte vergeben.
6. Fuer Uploads in Test-Tracks: `Release apps to testing tracks`.
7. Fuer Production-Rollouts: zusaetzlich `Release to production, exclude devices, and use Play App Signing`.
8. Wenn Store-Eintraege oder In-App-Produkte bearbeitet werden sollen: zusaetzlich `Manage store presence`.
9. Fuer Billing-/Purchase-API-Flows: `View financial data, orders, and cancellation survey responses` und `Manage orders and subscriptions`.
10. Die heruntergeladene JSON-Datei lokal sicher speichern; diese Datei wird in EAS Credentials hochgeladen.

Hinweis zu Kosten: Das Anlegen eines Service Accounts und JSON-Keys kostet in der Regel nichts. Fuer den Play-Submit-Flow fallen normalerweise keine separaten Google-Cloud-Kosten an.

## Sicherer Workflow fuer Codex
- Kein normales Play-Console-Login oder Google-Passwort an Codex geben.
- Die Service-Account-JSON nicht ins Repo committen.
- Bevorzugter Weg: JSON einmal selbst in EAS Credentials hochladen, danach kann Codex `eas submit` ausfuehren, ohne den Key erneut zu sehen.
- Alternativ: JSON nur lokal ausserhalb des Repos speichern, z. B. unter `C:\Users\simon\.secrets\play-service-account.json`, und nur fuer lokale CLI-Aufrufe verwenden.
- Wenn ein Service Account verwendet wird, die Rechte so klein wie moeglich halten.

## Schritte
1. Falls seit `versionCode 39` wieder App-Code geaendert wurde: aktuelles Release-Artefakt neu bauen
```bash
npm run release:check
cd android
./gradlew.bat bundleRelease
```
Reine Supabase-Inhaltsaenderungen wie neue Online-Fragen brauchen dagegen keinen neuen AAB-Build.

2. Service Account Key in EAS hinterlegen (interaktiv):
```bash
npx eas credentials -p android
```

3. Im Menu den Play-Submit Service Account setzen (bestehenden JSON Key hochladen).

4. Kontrolle, dass der Key gesetzt ist:
```bash
npx eas credentials -p android
```
Erwartung: Play Submit Service Account ist nicht mehr `None assigned yet`.

5. Neuesten Production-Build submitten:
```bash
npx eas submit -p android --latest --profile production
```

6. Optional auf Abschluss warten:
```bash
npx eas submit -p android --latest --profile production --wait
```

## Hinweise
- Ohne frischen Build aus dem aktuellen Repo wuerde ein Submit nicht den juengsten Code-Stand veroeffentlichen.
- `--non-interactive` kann den Service Account Key nicht neu anlegen.
- Solange der Key nicht in EAS gesetzt ist, bleibt Submit blockiert.
- Die erste Play-Store-Einreichung muss weiterhin manuell ueber das Web-UI erfolgen.
