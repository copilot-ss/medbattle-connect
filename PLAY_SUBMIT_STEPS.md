# PLAY_SUBMIT_STEPS.md - MedBattle

Stand: 2026-03-08

## Ziel
Google Play Submit in EAS vorbereiten und den aktuellen Android Build einreichen.

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
1. Service Account Key in EAS hinterlegen (interaktiv):
```bash
npx eas credentials -p android
```

2. Im Menu den Play-Submit Service Account setzen (bestehenden JSON Key hochladen).

3. Kontrolle, dass der Key gesetzt ist:
```bash
npx eas credentials -p android
```
Erwartung: Play Submit Service Account ist nicht mehr `None assigned yet`.

4. Neuesten Production-Build submitten:
```bash
npx eas submit -p android --latest --profile production
```

5. Optional auf Abschluss warten:
```bash
npx eas submit -p android --latest --profile production --wait
```

## Hinweise
- `--non-interactive` kann den Service Account Key nicht neu anlegen.
- Solange der Key nicht in EAS gesetzt ist, bleibt Submit blockiert.
- Die erste Play-Store-Einreichung muss weiterhin manuell ueber das Web-UI erfolgen.
